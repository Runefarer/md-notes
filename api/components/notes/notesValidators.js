import {
  TAG_OP_REGEX,

  INVALID_TITLE,
  INVALID_CONTENT,
  INVALID_TAGS,
  INVALID_TAG_CHANGES,
  INVALID_PARTIAL,
} from './notesConstants.js';

// TODO: Clean this up with a better understanding later

const EMPTY_REGEX = /^\s+$/;

const isNonEmptyString = (str) => {
  return !!(str && typeof str === 'string' && !EMPTY_REGEX.test(str));
};

export const isValidTitle = (title) => {
  return isNonEmptyString(title);
};

export const isValidContent = (content) => {
  return isNonEmptyString(content);
};

export const isValidTags = (tags) => {
  return !!(
    !tags || (Array.isArray(tags) && tags.every((tag) => isNonEmptyString(tag)))
  );
};

export const isValidTagChange = (tagChange) => {
  return !!(
    tagChange && isNonEmptyString(tagChange.tag) && TAG_OP_REGEX.test(tagChange.op)
  );
};

export const isValidTagChanges = (tagChanges) => {
  return !!(Array.isArray(tagChanges) && tagChanges.every(isValidTagChange));
};

export const validateTitle = (title) => {
  return isValidTitle(title) ? undefined : INVALID_TITLE;
};

export const validateContent = (content) => {
  return isValidContent(content) ? undefined : INVALID_CONTENT;
};

export const validateTags = (tags) => {
  return isValidTags(tags) ? undefined : INVALID_TAGS;
};

export const validateTagChanges = (tagChanges) => {
  return isValidTagChanges(tagChanges) ? undefined : INVALID_TAG_CHANGES;
};

export const validateNote = (data) => {
  if (!data) {
    return {
      title: INVALID_TITLE,
      content: INVALID_CONTENT,
    };
  }

  return {
    title: validateTitle(data.title),
    content: validateContent(data.content),
    tags: validateTags(data.tags),
  };
};

export const validatePartial = (data) => {
  if (!data || !Object.keys(data).some((prop) => ['title', 'content', 'tags'].includes(prop))) {
    return {
      required: INVALID_PARTIAL,
    };
  }

  return {
    title: data.title !== undefined ? validateTitle(data.title) : undefined,
    content: data.content !== undefined ? validateContent(data.content) : undefined,
    tags: data.tags !== undefined ? validateTagChanges(data.tags) : undefined,
  };
};

export default {
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
};
