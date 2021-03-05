import {
  isValidTitle,
  isValidContent,
  isValidTags,
  isValidTagChange,
  isValidTagChanges,
  validateTitle,
  validateContent,
  validateTags,
  validateTagChanges,
  validateNote,
  validatePartial,
} from '../notesValidators.js';

const EXPECTED_INVALID_TITLE = `'title' should be a non-empty string`;
const EXPECTED_INVALID_CONTENT = `'content' should be a non-empty string`;
const EXPECTED_INVALID_TAGS = `'tags' should be an array of strings`;
const EXPECTED_INVALID_TAG_CHANGES = `'tags' should be an array of type { tag: string, op: 'ADD'|'REMOVE' }`;
const EXPECTED_INVALID_PARTIAL = `At least one of 'title', 'content', or 'tags' properties should be present with valid a value`;

const expectToValidate = (fn, testCases) => {
  testCases('%s', (name, { check, expected }) => {
    expect(fn(check)).toEqual(expected);
  });
};

describe('notesValidators', () => {
  describe('#isValidTitle properly validates', () => {
    const testCases = test.each([
      [
        'given proper title',
        { check: 'Proper Title', expected: true },
      ],
      [
        'given null title',
        { check: null, expected: false },
      ],
      [
        'given empty title',
        { check: '', expected: false },
      ],
      [
        'given non-string title',
        { check: { a: 'b' }, expected: false },
      ],
    ]);

    expectToValidate(isValidTitle, testCases);
  });

  describe('#isValidContent properly validates', () => {
    const testCases = test.each([
      [
        'given proper content',
        { check: '# Proper Content', expected: true },
      ],
      [
        'given null content',
        { check: null, expected: false },
      ],
      [
        'given empty content',
        { check: '', expected: false },
      ],
      [
        'given non-string content',
        { check: { a: 'b' }, expected: false },
      ],
    ]);

    expectToValidate(isValidContent, testCases);
  });

  describe('#isValidTags validates properly', () => {
    const testCases = test.each([
      [
        'given proper tags',
        { check: ['test', 'tag'], expected: true },
      ],
      [
        'given null as tags',
        { check: null, expected: true },
      ],
      [
        'given undefined as tags',
        { check: undefined, expected: true },
      ],
      [
        'given empty array as tags',
        { check: [], expected: true },
      ],
      [
        'given non-array as tags',
        { check: 'test', expected: false },
      ],
      [
        'given mixed array as tags',
        { check: ['test', 123], expected: false },
      ],
    ]);

    expectToValidate(isValidTags, testCases);
  });

  describe('#isValidTagChange validates properly', () => {
    const testCases = test.each([
      [
        'given proper tag change with ADD op',
        { check: { tag: 'foo', op: 'add' }, expected: true },
      ],
      [
        'given proper tag change with REMOVE op',
        { check: { tag: 'foo', op: 'REMOVE' }, expected: true },
      ],

      [
        'given invalid tag change without tag',
        { check: { op: 'ADD' }, expected: false },
      ],
      [
        'given invalid tag change with empty tag',
        { check: { tag: '', op: 'ADD' }, expected: false },
      ],
      [
        'given invalid tag change with non-string tag',
        { check: { tag: 123, op: 'ADD' }, expected: false },
      ],
      [
        'given invalid tag change without op',
        { check: { tag: 'foo' }, expected: false },
      ],
      [
        'given invalid tag change with invalid op',
        { check: { tag: 'foo', op: 'bar' }, expected: false },
      ],

      [
        'given no tag change',
        { expected: false },
      ],
      [
        'given null tag change',
        { check: null, expected: false },
      ],
    ]);

    expectToValidate(isValidTagChange, testCases);
  });

  describe('#isValidTagChanges properly validates', () => {
    const testCases = test.each([
      [
        'given valid tag changes with only ADD op',
        {
          check: [
            { tag: 'foo', op: 'add' },
            { tag: 'bar', op: 'ADD' },
          ],
          expected: true,
        },
      ],
      [
        'given valid tag changes with only REMOVE op',
        {
          check: [
            { tag: 'foo', op: 'REMOVE' },
            { tag: 'bar', op: 'remove' },
          ],
          expected: true,
        },
      ],
      [
        'given valid tag changes with both ADD and REMOVE ops',
        {
          check: [
            { tag: 'foo', op: 'add' },
            { tag: 'bar', op: 'REMOVE' },
            { tag: 'alpha', op: 'ADD' },
            { tag: 'beta', op: 'remove' },
          ],
          expected: true,
        },
      ],

      [
        'given invalid tag changes',
        {
          check: [
            { tag: 'foo', op: 'add' },
            { tag: 'bar', op: 'OMEGA' },
          ],
          expected: false,
        },
      ],
      [
        'given no tag changes',
        {
          expected: false,
        },
      ],
      [
        'given null tag changes',
        {
          check: null,
          expected: false,
        },
      ],
    ]);

    expectToValidate(isValidTagChanges, testCases);
  });

  describe('#validateTitle validates properly', () => {
    const testCases = test.each([
      [
        'given valid title',
        {
          check: 'Test Title',
          expected: undefined,
        },
      ],
      [
        'given invalid title',
        {
          check: 123,
          expected: EXPECTED_INVALID_TITLE,
        },
      ],
    ]);

    expectToValidate(validateTitle, testCases);
  });

  describe('#validateContent validates properly', () => {
    const testCases = test.each([
      [
        'given valid content',
        {
          check: '# Test Content',
          expected: undefined,
        },
      ],
      [
        'given invalid content',
        {
          check: '',
          expected: EXPECTED_INVALID_CONTENT,
        },
      ],
    ]);

    expectToValidate(validateContent, testCases);
  });

  describe('#validateTags validates properly', () => {
    const testCases = test.each([
      [
        'given valid tags',
        {
          check: ['foo', 'bar'],
          expected: undefined,
        },
      ],
      [
        'given invalid tags',
        {
          check: 'foobar',
          expected: EXPECTED_INVALID_TAGS,
        },
      ],
    ]);

    expectToValidate(validateTags, testCases);
  });

  describe('#validateTagChanges validates properly', () => {
    const testCases = test.each([
      [
        'given valid tags',
        {
          check: [
            { tag: 'foo', op: 'ADD' },
            { tag: 'bar', op: 'remove' },
          ],
          expected: undefined,
        },
      ],
      [
        'given invalid tags',
        {
          check: [
            { op: 'ADD' },
            { tag: 'foo', op: 'bar' },
          ],
          expected: EXPECTED_INVALID_TAG_CHANGES,
        },
      ],
    ]);

    expectToValidate(validateTagChanges, testCases);
  });

  describe('#validateNote validates properly', () => {
    const testCases = test.each([
      [
        'given all valid properties',
        {
          check: {
            title: 'Test Title',
            content: '# Test Content',
            tags: ['foo', 'bar', 'baz'],
          },
          expected: {},
        },
      ],
      [
        'given all valid properties without tags',
        {
          check: {
            title: 'Test Title',
            content: '# Test Content',
          },
          expected: {},
        },
      ],

      [
        'given no title',
        {
          check: {
            content: '# Test Content',
            tags: ['foo', 'bar', 'baz'],
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
          },
        },
      ],
      [
        'given only invalid title',
        {
          check: {
            title: 123,
            content: '# Test Content',
            tags: ['foo', 'bar', 'baz'],
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
          },
        },
      ],
      [
        'given no content',
        {
          check: {
            title: 'Test Title',
            tags: ['foo', 'bar', 'baz'],
          },
          expected: {
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
      [
        'given only invalid content',
        {
          check: {
            title: 'Test Title',
            content: '',
            tags: ['foo', 'bar', 'baz'],
          },
          expected: {
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
      [
        'given invalid tags',
        {
          check: {
            title: 'Test Title',
            content: '# Test Content',
            tags: ['foo', 123, 'baz'],
          },
          expected: {
            tags: EXPECTED_INVALID_TAGS,
          },
        },
      ],
      [
        'given invalid title and content',
        {
          check: {
            title: 123,
            content: '',
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
      [
        'given invalid title and tags',
        {
          check: {
            title: 123,
            content: '# Test Content',
            tags: 'barbaz',
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
            tags: EXPECTED_INVALID_TAGS,
          },
        },
      ],
      [
        'given invalid content and tags',
        {
          check: {
            title: 'Test Title',
            content: 123,
            tags: 'barbaz',
          },
          expected: {
            content: EXPECTED_INVALID_CONTENT,
            tags: EXPECTED_INVALID_TAGS,
          },
        },
      ],
      [
        'given all invalid properties',
        {
          check: {
            title: 123,
            content: '',
            tags: ['barbaz', 123],
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
            content: EXPECTED_INVALID_CONTENT,
            tags: EXPECTED_INVALID_TAGS,
          },
        },
      ],
      [
        'given no data',
        {
          expected: {
            title: EXPECTED_INVALID_TITLE,
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
      [
        'given null data',
        {
          check: null,
          expected: {
            title: EXPECTED_INVALID_TITLE,
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
      [
        'given data with missing properties',
        {
          check: {
            foo: 'bar',
            baz: 42,
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
    ]);

    expectToValidate(validateNote, testCases);
  });

  describe('#validatePartial validates properly', () => {
    const testCases = test.each([
      [
        'given only valid title',
        {
          check: {
            title: 'Test Title',
          },
          expected: {},
        },
      ],
      [
        'given only valid content',
        {
          check: {
            content: '# Test Content',
          },
          expected: {},
        },
      ],
      [
        'given only valid tag changes',
        {
          check: {
            tags: [
              { tag: 'foo', op: 'ADD' },
              { tag: 'bar', op: 'remove' },
            ],
          },
          expected: {},
        },
      ],
      [
        'given only valid properties',
        {
          check: {
            title: 'Test Title',
            content: '# Test Content',
            tags: [
              { tag: 'foo', op: 'ADD' },
              { tag: 'bar', op: 'remove' },
            ],
          },
          expected: {},
        },
      ],

      [
        'given only invalid title',
        {
          check: {
            title: 123,
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
          },
        },
      ],
      [
        'given only invalid content',
        {
          check: {
            content: ['foo'],
          },
          expected: {
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
      [
        'given only invalid tag changes',
        {
          check: {
            tags: [
              { tag: 'foo', op: 'ADD' },
              { tag: 'bar', op: 'BLAST' },
            ],
          },
          expected: {
            tags: EXPECTED_INVALID_TAG_CHANGES,
          },
        },
      ],
      [
        'given invalid title and content',
        {
          check: {
            title: 123,
            content: ['123'],
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
            content: EXPECTED_INVALID_CONTENT,
          },
        },
      ],
      [
        'given invalid title and tags',
        {
          check: {
            title: 123,
            tags: [
              { tag: 'foo', op: 'ADD' },
              { op: 'remove' },
            ],
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
            tags: EXPECTED_INVALID_TAG_CHANGES,
          },
        },
      ],
      [
        'given invalid content and tags',
        {
          check: {
            content: 123,
            tags: [
              { foo: 'bar' },
              { tag: 'baz', op: 'remove' },
            ],
          },
          expected: {
            content: EXPECTED_INVALID_CONTENT,
            tags: EXPECTED_INVALID_TAG_CHANGES,
          },
        },
      ],
      [
        'given all invalid properties',
        {
          check: {
            title: 123,
            content: ['42'],
            tags: [
              { op: 'ADD' },
              { foo: 'bar', op: 'BLAST' },
            ],
          },
          expected: {
            title: EXPECTED_INVALID_TITLE,
            content: EXPECTED_INVALID_CONTENT,
            tags: EXPECTED_INVALID_TAG_CHANGES,
          },
        },
      ],

      [
        'given no data',
        {
          expected: {
            required: EXPECTED_INVALID_PARTIAL,
          },
        },
      ],
      [
        'given null data',
        {
          check: null,
          expected: {
            required: EXPECTED_INVALID_PARTIAL,
          },
        },
      ],
      [
        'given data with missing properties',
        {
          check: {
            foo: 'bar',
            baz: 42,
          },
          expected: {
            required: EXPECTED_INVALID_PARTIAL,
          },
        },
      ],
    ]);

    expectToValidate(validatePartial, testCases);
  });
});
