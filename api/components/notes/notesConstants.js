export const TAG_OP_ADD = 'ADD';
export const TAG_OP_REMOVE = 'REMOVE';
export const TAG_OP_REGEX = new RegExp(`^(?:${TAG_OP_ADD}|${TAG_OP_REMOVE})$`, 'i');

export const INVALID_TITLE = `'title' should be a non-empty string`;
export const INVALID_CONTENT = `'content' should be a non-empty string`;
export const INVALID_TAGS = `'tags' should be an array of strings`;
export const INVALID_TAG_CHANGES = `'tags' should be an array of type { tag: string, op: '${TAG_OP_ADD}'|'${TAG_OP_REMOVE}' }`;
export const INVALID_PARTIAL = `At least one of 'title', 'content', or 'tags' properties should be present with valid a value`;

export default {
  TAG_OP_ADD,
  TAG_OP_REMOVE,
  TAG_OP_REGEX,

  INVALID_TITLE,
  INVALID_CONTENT,
  INVALID_TAGS,
  INVALID_TAG_CHANGES,
  INVALID_PARTIAL,
};
