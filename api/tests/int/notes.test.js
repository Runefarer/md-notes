import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app.js';
import NoteModel from '../../components/notes/NoteModel.js';

const EXPECTED_INVALID_TITLE = `'title' should be a non-empty string`;
const EXPECTED_INVALID_CONTENT = `'content' should be a non-empty string`;
const EXPECTED_INVALID_TAGS = `'tags' should be an array of strings`;
const EXPECTED_INVALID_TAG_CHANGES = `'tags' should be an array of type { tag: string, op: 'ADD'|'REMOVE' }`;
const EXPECTED_INVALID_PARTIAL = `At least one of 'title', 'content', or 'tags' properties should be present with valid a value`;

const expectNotesToBeEqual = (test, expected) => {
  expect(test.title).toBe(expected.title);
  expect(test.content).toBe(expected.content);
  expect(test.tags).toEqual(expected.tags ?? []);
};

describe('Notes API', () => {
  beforeAll(async () => {
    await mongoose.connect(
      'mongodb://localhost:27017/api-test',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      },
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await NoteModel.deleteMany();
  });

  describe('GET /api/notes', () => {
    describe('gets all notes', () => {
      const data = [
        {
          title: 'First title',
          content: '# First content',
          tags: ['test', 'tag'],
        },
        {
          title: 'Second title',
          content: '## Second content',
          tags: ['second', 'tag'],
        },
        {
          title: 'Third title',
          content: '### Third content',
        },
      ];

      beforeEach(async () => {
        await NoteModel.insertMany(data);
      });

      const testCases = test.each([
        [
          'given no query',
          {
            query: ``,
            expected: data,
          },
        ],
        [
          'given title as query',
          {
            query: `?title=${encodeURIComponent('sec')}`,
            expected: [data[1]],
          },
        ],
        [
          'given tags as query',
          {
            query: `?tags=${encodeURIComponent('test')}&tags=${encodeURIComponent('tag')}`,
            expected: [data[0]],
          },
        ],
        [
          'given both title and tags as query',
          {
            query: `?title=${encodeURIComponent('sec')}&tags=${encodeURIComponent('tag')}`,
            expected: [data[1]],
          },
        ],
      ]);

      testCases('%s', async (name, { query, expected }) => {
        const { status, body } = await request(app).get(`/api/notes${query}`);

        expect(status).toBe(200);

        expect(body).toHaveLength(expected.length);

        for (let i = 0; i < expected.length; i++) {
          expectNotesToBeEqual(body[i], expected[i]);
        }
      });
    });
  });

  describe('GET /api/notes/:id', () => {
    let note;

    beforeEach(async () => {
      const doc = new NoteModel({
        title: 'Test title',
        content: '# Test Content',
        tags: ['test', 'tag'],
      });
      const saved = await doc.save();
      note = saved.toObject();
    });

    describe('gets requested note', () => {
      test('given valid id', async () => {
        const { status, body } = await request(app).get(`/api/notes/${note.id}`);

        expect(status).toBe(200);

        expect(body).toBeDefined();
        expectNotesToBeEqual(body, note);
        expect(body.createdAt).toBe(note.createdAt.toISOString());
        expect(body.updatedAt).toBe(note.updatedAt.toISOString());
      });
    });

    describe('responds with note not found', () => {
      const testCases = test.each([
        [
          'given non existing id',
          {
            getId: (doc) => `${doc.id}`.replace(/\d/g, 2),
          },
        ],
        [
          'given invalid id',
          {
            getId: () => '123ffgds',
          },
        ],
      ]);

      testCases('%s', async (name, { getId }) => {
        const id = getId(note);

        const { status, body } = await request(app).get(`/api/notes/${id}`);

        expect(status).toBe(404);

        expect(body).toBeDefined();
        expect(body.error).toBe(`Note with id ${id} not found.`);
        expect(body.details).toBeUndefined();
      });
    });
  });

  describe('POST /api/notes', () => {
    describe('note gets created properly', () => {
      const testCases = test.each([
        [
          'given data with all properties',
          {
            data: {
              title: 'Test Title',
              content: '# Test Content',
              tags: ['test', 'tag'],
            },
            expectedFor: (data) => ({ ...data }),
          },
        ],
        [
          'given data without tags',
          {
            data: {
              title: 'Test Title',
              content: '# Test Content',
            },
            expectedFor: (data) => ({ ...data }),
          },
        ],
        [
          'given null as tags',
          {
            data: {
              title: 'Test Title',
              content: '# Test Content',
              tags: null,
            },
            expectedFor: (data) => ({ ...data }),
          },
        ],
        [
          'given duplicate tags',
          {
            data: {
              title: 'Test Title',
              content: '# Test Content',
              tags: ['foo', 'bar', 'foo', 'baz'],
            },
            expectedFor: (data) => ({ ...data, tags: ['foo', 'bar', 'baz'] }),
          },
        ],
      ]);

      testCases('%s', async (name, { data, expectedFor }) => {
        const expected = expectedFor(data);

        const { status, body } = await request(app).post('/api/notes').send(data);

        expect(status).toBe(201);

        expect(body).toBeDefined();
        expect(body.id).toBeDefined();
        expectNotesToBeEqual(body, expected);

        const note = await NoteModel.findById(body.id);
        expectNotesToBeEqual(note.toObject(), expected);
      });
    });

    describe('responds with proper error', () => {
      const testCases = test.each([
        [
          'given no title',
          {
            data: {
              content: '# Test Content',
              tags: ['test', 'tag'],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
            },
          },
        ],
        [
          'given no content',
          {
            data: {
              title: 'Test Title',
              tags: ['test', 'tag'],
            },
            details: {
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
        [
          'given no title and content',
          {
            data: {
              tags: ['test', 'tag'],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
        [
          'given no title and content without tags',
          {
            data: {},
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],

        [
          'given empty title',
          {
            data: {
              title: '',
              content: '# Test Content',
              tags: ['test', 'tag'],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
            },
          },
        ],
        [
          'given empty content',
          {
            data: {
              title: 'Test Title',
              content: '',
              tags: ['test', 'tag'],
            },
            details: {
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
        [
          'given both title and content empty',
          {
            data: {
              title: '',
              content: '',
              tags: ['test', 'tag'],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],

        [
          'given non-array as tags',
          {
            data: {
              title: 'Test Title',
              content: '# Test Content',
              tags: 'testtag',
            },
            details: {
              tags: EXPECTED_INVALID_TAGS,
            },
          },
        ],

        [
          'given invalid title, content, and tags',
          {
            data: {
              title: '',
              tags: ['mixed', 123],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
              tags: EXPECTED_INVALID_TAGS,
            },
          },
        ],

        [
          'given no data',
          {
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
        [
          'given null as data',
          {
            data: null,
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
        [
          'given data with missing properties',
          {
            data: {
              foo: 'bar',
              baz: 42,
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
      ]);

      testCases('%s', async (name, { data, details }) => {
        const { status, body } = await request(app).post('/api/notes').send(data);

        expect(status).toBe(400);

        expect(body).toBeDefined();
        expect(body.error).toBe('Invalid request.');
        expect(body.details).toEqual(details);
      });
    });
  });

  describe('PATCH /api/notes/:id', () => {
    let note;

    beforeEach(async () => {
      const doc = new NoteModel({
        title: 'Test Title',
        content: '# Test Content',
        tags: ['foo', 'bar', 'baz'],
      });
      const saved = await doc.save();
      note = saved.toObject();
    });

    describe('note gets updated properly', () => {
      const testCases = test.each([
        [
          'given only title',
          {
            getId: (doc) => doc.id,
            data: {
              title: 'New Title',
            },
            expectedFor: (doc, data) => ({
              ...doc,
              title: data.title,
            }),
          },
        ],
        [
          'given only content',
          {
            getId: (doc) => doc.id,
            data: {
              content: '# New Content',
            },
            expectedFor: (doc, data) => ({
              ...doc,
              content: data.content,
            }),
          },
        ],
        [
          'given title and content',
          {
            getId: (doc) => doc.id,
            data: {
              title: 'New Title',
              content: '# New Content',
            },
            expectedFor: (doc, data) => ({
              ...doc,
              title: data.title,
              content: data.content,
            }),
          },
        ],
        [
          'given tags with only ADD op',
          {
            getId: (doc) => doc.id,
            data: {
              tags: [
                { tag: 'alpha', op: 'add' },
                { tag: 'beta', op: 'ADD' },
              ],
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: [...doc.tags, 'alpha', 'beta'],
            }),
          },
        ],
        [
          'given tags with only REMOVE op',
          {
            getId: (doc) => doc.id,
            data: {
              tags: [
                { tag: 'foo', op: 'REMOVE' },
                { tag: 'baz', op: 'remove' },
                { tag: 'notatag', op: 'REMOVE' },
              ],
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: [...doc.tags.filter((tag) => !['foo', 'baz', 'notatag'].includes(tag))],
            }),
          },
        ],
        [
          'given tags with both ADD and REMOVE op',
          {
            getId: (doc) => doc.id,
            data: {
              tags: [
                { tag: 'alpha', op: 'ADD' },
                { tag: 'bar', op: 'remove' },
                { tag: 'help', op: 'ADD' },
                { tag: 'notatag', op: 'REMOVE' },
                { tag: 'beta', op: 'add' },
                { tag: 'help', op: 'remove' },
              ],
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: ['foo', 'baz', 'alpha', 'beta'],
            }),
          },
        ],
        [
          'given duplicate tags with only ADD op',
          {
            getId: (doc) => doc.id,
            data: {
              tags: [
                { tag: 'alpha', op: 'ADD' },
                { tag: 'beta', op: 'add' },
                { tag: 'alpha', op: 'add' },
                { tag: 'bar', op: 'ADD' },
              ],
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: [...doc.tags, 'alpha', 'beta'],
            }),
          },
        ],
        [
          'given duplicate tags with both ADD and REMOVE op',
          {
            getId: (doc) => doc.id,
            data: {
              tags: [
                { tag: 'alpha', op: 'ADD' },
                { tag: 'bar', op: 'remove' },
                { tag: 'notatag', op: 'REMOVE' },
                { tag: 'beta', op: 'add' },
                { tag: 'alpha', op: 'ADD' },
                { tag: 'bar', op: 'REMOVE' },
                { tag: 'foo', op: 'add' },
              ],
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: ['foo', 'baz', 'alpha', 'beta'],
            }),
          },
        ],
        [
          'given all properties',
          {
            getId: (doc) => doc.id,
            data: {
              title: 'New Title',
              content: '# New Content',
              tags: [
                { tag: 'alpha', op: 'ADD' },
                { tag: 'bar', op: 'remove' },
                { tag: 'notatag', op: 'REMOVE' },
                { tag: 'beta', op: 'add' },
                { tag: 'alpha', op: 'ADD' },
                { tag: 'bar', op: 'REMOVE' },
                { tag: 'foo', op: 'add' },
              ],
            },
            expectedFor: (doc, data) => ({
              ...doc,
              title: data.title,
              content: data.content,
              tags: ['foo', 'baz', 'alpha', 'beta'],
            }),
          },
        ],
      ]);

      testCases('%s', async (name, { getId, data, expectedFor }) => {
        const { status, body } = await request(app)
          .patch(`/api/notes/${getId(note)}`)
          .send(data);

        expect(status).toBe(200);

        expect(body).toBeDefined();
        expectNotesToBeEqual(body, expectedFor(note, data));
        expect(body.createdAt).toBe(note.createdAt.toISOString());
        expect(body.updatedAt).not.toBe(note.updatedAt.toISOString());
      });
    });

    describe('responds with note not found', () => {
      const data = {
        title: 'New Title',
        content: '# New Content',
        tags: [
          { tag: 'alpha', op: 'ADD' },
          { tag: 'bar', op: 'remove' },
          { tag: 'notatag', op: 'REMOVE' },
          { tag: 'beta', op: 'add' },
        ],
      };

      const testCases = test.each([
        [
          'given non existing id',
          {
            getId: (doc) => `${doc.id}`.replace(/\d/g, 2),
          },
        ],
        [
          'given invalid id',
          {
            getId: () => '123ffgds',
          },
        ],
      ]);

      testCases('%s', async (name, { getId }) => {
        const id = getId(note);

        const { status, body } = await request(app)
          .patch(`/api/notes/${id}`)
          .send(data);

        expect(status).toBe(404);

        expect(body).toBeDefined();
        expect(body.error).toBe(`Note with id ${id} not found.`);
        expect(body.details).toBeUndefined();
      });
    });

    describe('responds with proper error', () => {
      const testCases = test.each([
        [
          'given invalid title',
          {
            getId: (doc) => doc.id,
            data: {
              title: 12345,
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
            },
          },
        ],
        [
          'given invalid content',
          {
            getId: (doc) => doc.id,
            data: {
              content: [42],
            },
            details: {
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
        [
          'given invalid tags',
          {
            getId: (doc) => doc.id,
            data: {
              tags: 'testtag',
            },
            details: {
              tags: EXPECTED_INVALID_TAG_CHANGES,
            },
          },
        ],

        [
          'given invalid title and content',
          {
            getId: (doc) => doc.id,
            data: {
              title: { foo: 1 },
              content: ['bar'],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
            },
          },
        ],
        [
          'given invalid title and tags',
          {
            getId: (doc) => doc.id,
            data: {
              title: { foo: 1 },
              tags: ['bar'],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
              tags: EXPECTED_INVALID_TAG_CHANGES,
            },
          },
        ],
        [
          'given invalid content and tags',
          {
            getId: (doc) => doc.id,
            data: {
              content: { foo: 42 },
              tags: [{ tag: 'hi', op: 'bye' }],
            },
            details: {
              content: EXPECTED_INVALID_CONTENT,
              tags: EXPECTED_INVALID_TAG_CHANGES,
            },
          },
        ],

        [
          'given invalid title, content, and tags',
          {
            getId: (doc) => doc.id,
            data: {
              title: { foo: 42 },
              content: ['bar'],
              tags: [{ tag: 'hi', op: 'bye' }],
            },
            details: {
              title: EXPECTED_INVALID_TITLE,
              content: EXPECTED_INVALID_CONTENT,
              tags: EXPECTED_INVALID_TAG_CHANGES,
            },
          },
        ],

        [
          'given no data',
          {
            getId: (doc) => doc.id,
            details: {
              required: EXPECTED_INVALID_PARTIAL,
            },
          },
        ],
        [
          'given null data',
          {
            getId: (doc) => doc.id,
            data: null,
            details: {
              required: EXPECTED_INVALID_PARTIAL,
            },
          },
        ],
        [
          'given data with missing properties',
          {
            getId: (doc) => doc.id,
            data: {
              foo: 'bar',
              baz: 42,
            },
            details: {
              required: EXPECTED_INVALID_PARTIAL,
            },
          },
        ],
      ]);

      testCases('%s', async (name, { getId, data, details }) => {
        const { status, body } = await request(app)
          .patch(`/api/notes/${getId(note)}`).send(data);

        expect(status).toBe(400);

        expect(body).toBeDefined();
        expect(body.error).toBe('Invalid request.');
        expect(body.details).toEqual(details);
      });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let note;

    beforeEach(async () => {
      const doc = new NoteModel({
        title: 'Test Title',
        content: '# Test Content',
        tags: ['foo', 'bar', 'baz'],
      });
      const saved = await doc.save();
      note = saved.toObject();
    });

    describe('note gets deleted properly', () => {
      test('given existing note id', async () => {
        const { status, body } = await request(app).delete(`/api/notes/${note.id}`);
        const stored = await NoteModel.findById(note.id);

        expect(status).toBe(200);

        expect(body).toBeDefined();
        expectNotesToBeEqual(body, note);

        expect(stored).toBeNull();
      });
    });

    describe('responds with note not found', () => {
      const testCases = test.each([
        [
          'given non existing id',
          {
            getId: (doc) => `${doc.id}`.replace(/\d/g, 2),
          },
        ],
        [
          'given invalid id',
          {
            getId: () => '123ffgds',
          },
        ],
      ]);

      testCases('%s', async (name, { getId }) => {
        const id = getId(note);

        const { status, body } = await request(app).delete(`/api/notes/${id}`);

        expect(status).toBe(404);

        expect(body).toBeDefined();
        expect(body.error).toBe(`Note with id ${id} not found.`);
        expect(body.details).toBeUndefined();
      });
    });
  });

  describe('Not Allowed Method to /api/notes', () => {
    describe('responds with proper error', () => {
      let note;

      beforeEach(async () => {
        const doc = new NoteModel({
          title: 'Test Title',
          content: '# Test Content',
          tags: ['foo', 'bar', 'baz'],
        });
        const saved = await doc.save();
        note = saved.toObject();
      });

      const testCases = test.each([
        [
          'given POST /api/notes/:id',
          {
            method: (id) => request(app).post(`/api/notes/${id}`),
          },
        ],

        [
          'given PUT /api/notes',
          {
            method: () => request(app).put(`/api/notes`),
          },
        ],
        [
          'given PUT /api/notes/:id',
          {
            method: (id) => request(app).post(`/api/notes/${id}`),
          },
        ],

        [
          'given PATCH /api/notes',
          {
            method: () => request(app).put(`/api/notes`),
          },
        ],

        [
          'given DELETE /api/notes',
          {
            method: () => request(app).delete(`/api/notes`),
          },
        ],
      ]);

      testCases('%s', async (name, { method }) => {
        const { status, body } = await method(note.id);

        expect(status).toBe(405);

        expect(body).toBeDefined();
        expect(body.error).toBe('Method not allowed.');
        expect(body.details).toBeUndefined();
      });
    });
  });
});
