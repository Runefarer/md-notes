import {
  getNotesFilter,
  getNoteUpdate,
  updateOne,
} from '../notesOperators.js';

describe('notesOperators', () => {
  describe('#getNotesFilter returns proper filter', () => {
    const testCases = test.each([
      [
        'given no title or tags',
        {
          expectedFor: () => ({}),
        },
      ],
      [
        'given a title',
        {
          data: { title: 'This is ' },
          expectedFor: (data) => ({
            $and: [
              { title: new RegExp(data.title.replace(/([^\w ])/g, '\\$1'), 'i') },
            ],
          }),
        },
      ],
      [
        'given array of tags',
        {
          data: { tags: ['foo', 'bar'] },
          expectedFor: () => ({
            $and: [
              { tags: 'foo' },
              { tags: 'bar' },
            ],
          }),
        },
      ],
      [
        'given both title and tags',
        {
          data: {
            title: 'This is ',
            tags: ['foo', 'bar'],
          },
          expectedFor: (data) => ({
            $and: [
              { title: new RegExp(data.title.replace(/([^\w ])/g, '\\$1'), 'i') },
              { tags: 'foo' },
              { tags: 'bar' },
            ],
          }),
        },
      ],
      [
        'include single string as tags',
        {
          data: {
            title: 'This is ',
            tags: 'foobar',
          },
          expectedFor: (data) => ({
            $and: [
              { title: new RegExp(data.title.replace(/([^\w ])/g, '\\$1'), 'i') },
              { tags: 'foobar' },
            ],
          }),
        },
      ],
      [
        'ignore non-string as tags',
        {
          data: {
            title: 'This is ',
            tags: 123,
          },
          expectedFor: (data) => ({
            $and: [
              { title: new RegExp(data.title.replace(/([^\w ])/g, '\\$1'), 'i') },
            ],
          }),
        },
      ],
      [
        'ignore mixed array as tags',
        {
          data: {
            title: 'This is ',
            tags: ['foo', 123],
          },
          expectedFor: (data) => ({
            $and: [
              { title: new RegExp(data.title.replace(/([^\w ])/g, '\\$1'), 'i') },
            ],
          }),
        },
      ],
    ]);

    testCases('%s', async (name, { data, expectedFor }) => {
      expect(getNotesFilter(data)).toEqual(expectedFor(data));
    });
  });

  describe('#getNoteUpdate returns the proper update', () => {
    const testCases = test.each([
      [
        'given no title, content, or tags',
        {
          expectedFor: () => ({}),
        },
      ],
      [
        'given only title',
        {
          data: {
            title: 'New Title',
          },
          expectedFor: (data) => ({
            $set: {
              title: data.title,
            },
          }),
        },
      ],
      [
        'given only content',
        {
          data: {
            content: '# New Content',
          },
          expectedFor: (data) => ({
            $set: {
              content: data.content,
            },
          }),
        },
      ],
      [
        'given only title and content',
        {
          data: {
            title: 'New Title',
            content: '# New Content',
          },
          expectedFor: (data) => ({
            $set: {
              title: data.title,
              content: data.content,
            },
          }),
        },
      ],
      [
        'given only tags with ADD op',
        {
          data: {
            tags: [
              { tag: 'tag', op: 'ADD' },
              { tag: 'second', op: 'add' },
            ],
          },
          expectedFor: () => ({
            $addToSet: {
              tags: {
                $each: ['tag', 'second'],
              },
            },
          }),
        },
      ],
      [
        'given only tags with REMOVE op',
        {
          data: {
            tags: [
              { tag: 'tag', op: 'REMOVE' },
              { tag: 'second', op: 'remove' },
            ],
          },
          expectedFor: () => ({
            $pull: {
              tags: {
                $in: ['tag', 'second'],
              },
            },
          }),
        },
      ],
      [
        'given only tags with with both ADD and REMOVE as op',
        {
          data: {
            tags: [
              { tag: 'alpha', op: 'ADD' },
              { tag: 'gamma', op: 'remove' },
              { tag: 'beta', op: 'add' },
              { tag: 'delta', op: 'REMOVE' },
            ],
          },
          expectedFor: () => ({
            $addToSet: {
              tags: {
                $each: ['alpha', 'beta'],
              },
            },
            $pull: {
              tags: {
                $in: ['gamma', 'delta'],
              },
            },
          }),
        },
      ],
      [
        'given title, content, and tags',
        {
          data: {
            title: 'New Title',
            content: '# New Content',
            tags: [
              { tag: 'alpha', op: 'ADD' },
              { tag: 'gamma', op: 'remove' },
              { tag: 'beta', op: 'add' },
              { tag: 'delta', op: 'REMOVE' },
            ],
          },
          expectedFor: (data) => ({
            $set: {
              title: data.title,
              content: data.content,
            },
            $addToSet: {
              tags: {
                $each: ['alpha', 'beta'],
              },
            },
            $pull: {
              tags: {
                $in: ['gamma', 'delta'],
              },
            },
          }),
        },
      ],
    ]);

    testCases('%s', (name, { data, expectedFor }) => {
      expect(getNoteUpdate(data)).toEqual(expectedFor(data));
    });
  });

  describe('#updateOne', () => {
    describe('should update document properly', () => {
      let note = null;

      beforeEach(() => {
        note = {
          title: 'Test Title',
          content: '# Test Content',
          tags: ['foo', 'bar', 'baz'],

          modfified: {},
          markModified(prop) {
            this.modfified[prop] = true;
          },
          isModified(prop) {
            return !!this.modfified[prop];
          },
        };
      });

      const testCases = test.each([
        [
          'given only title',
          {
            update: {
              $set: { title: 'New Title' },
            },
            expectedFor: (doc) => ({
              ...doc,
              title: 'New Title',
            }),
            modified: ['title'],
          },
        ],
        [
          'given only content',
          {
            update: {
              $set: { content: '# New Content' },
            },
            expectedFor: (doc) => ({
              ...doc,
              content: '# New Content',
            }),
            modified: ['content'],
          },
        ],
        [
          'given only title and content',
          {
            update: {
              $set: {
                title: 'New Title',
                content: '# New Content',
              },
            },
            expectedFor: (doc) => ({
              ...doc,
              title: 'New Title',
              content: '# New Content',
            }),
            modified: ['title', 'content'],
          },
        ],

        [
          'given only tags added',
          {
            update: {
              $addToSet: {
                tags: {
                  $each: ['alpha', 'beta'],
                },
              },
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: [...doc.tags, 'alpha', 'beta'],
            }),
            modified: ['tags'],
          },
        ],
        [
          'given only tags removed',
          {
            update: {
              $pull: {
                tags: {
                  $in: ['foo', 'baz'],
                },
              },
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: [...doc.tags.filter((tag) => !['foo', 'baz'].includes(tag))],
            }),
            modified: ['tags'],
          },
        ],
        [
          'given tags both added and removed',
          {
            update: {
              $addToSet: {
                tags: {
                  $each: ['alpha', 'beta'],
                },
              },
              $pull: {
                tags: {
                  $in: ['foo', 'baz'],
                },
              },
            },
            expectedFor: (doc) => ({
              ...doc,
              tags: [
                ...doc.tags.filter((tag) => !['foo', 'baz'].includes(tag)),
                'alpha',
                'beta',
              ],
            }),
            modified: ['tags'],
          },
        ],

        [
          'given all properties',
          {
            update: {
              $set: {
                title: 'New Title',
                content: '# New Content',
              },
              $addToSet: {
                tags: {
                  $each: ['alpha', 'beta'],
                },
              },
              $pull: {
                tags: {
                  $in: ['foo', 'baz'],
                },
              },
            },
            expectedFor: (doc) => ({
              ...doc,
              title: 'New Title',
              content: '# New Content',
              tags: [
                ...doc.tags.filter((tag) => !['foo', 'baz'].includes(tag)),
                'alpha',
                'beta',
              ],
            }),
            modified: ['title', 'content', 'tags'],
          },
        ],
      ]);

      testCases('%s', (name, { update, expectedFor, modified }) => {
        const expected = expectedFor(note);

        const updated = updateOne(note, update);

        expect(updated.title).toBe(expected.title);
        expect(updated.content).toBe(expected.content);
        expect(updated.tags).toEqual(expected.tags);

        modified.forEach((prop) => expect(updated.isModified(prop)).toBe(true));
      });
    });

    describe('should throw the proper error', () => {
      const testCases = test.each([
        [
          'given no note document',
          {
            update: { a: 'b' },
            expected: 'updateOne needs a note document as first argument',
          },
        ],
        [
          'given no update document',
          {
            note: { a: 'b' },
            expected: 'updateOne needs an update document as second argument',
          },
        ],
      ]);

      testCases('%s', (name, { note, update, expected }) => {
        expect(() => updateOne(note, update)).toThrowError(expected);
      });
    });
  });
});
