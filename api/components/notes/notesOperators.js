import {
  TAG_OP_ADD,
  TAG_OP_REMOVE,
} from './notesConstants.js';

import {
  isValidContent,
  isValidTags,
  isValidTitle,
  isValidTagChanges,
} from './notesValidators.js';

// TODO: Change these to not mutate?

export const getNotesFilter = ({ title, tags } = {}) => {
  const filter = {};

  if (title) {
    filter.$and = filter.$and || [];
    filter.$and.push({
      title: new RegExp(title.replace(/([^\w ])/g, '\\$1'), 'i'),
    });
  }

  if (typeof tags === 'string') {
    filter.$and = (filter.$and || []).concat({ tags });
  } else if (tags && isValidTags(tags)) {
    filter.$and = filter.$and || [];
    tags.forEach((tag) => filter.$and.push({ tags: tag }));
  }

  return filter;
};

export const getNoteUpdate = ({ title, content, tags } = {}) => {
  const update = {};

  if (isValidTitle(title)) {
    update.$set = update.$set || {};
    update.$set.title = title;
  }

  if (isValidContent(content)) {
    update.$set = update.$set || {};
    update.$set.content = content;
  }

  if (isValidTagChanges(tags)) {
    tags.forEach(({ tag, op }) => {
      const checkOp = typeof op === 'string' ? op.toUpperCase() : null;
      if (checkOp === TAG_OP_ADD) {
        update.$addToSet = update.$addToSet || {};
        update.$addToSet.tags = update.$addToSet.tags || {};
        update.$addToSet.tags.$each = update.$addToSet.tags.$each || [];

        update.$addToSet.tags.$each.push(tag);
      } else if (checkOp === TAG_OP_REMOVE) {
        update.$pull = update.$pull || {};
        update.$pull.tags = update.$pull.tags || {};
        update.$pull.tags.$in = update.$pull.tags.$in || [];

        update.$pull.tags.$in.push(tag);
      }
    });
  }

  return update;
};

export const updateOne = (note, update) => {
  if (!note) {
    throw new Error('updateOne needs a note document as first argument');
  }

  if (!update) {
    throw new Error('updateOne needs an update document as second argument');
  }

  const updated = note;

  if (update.$set) {
    Object.entries(update.$set).forEach(([prop, value]) => {
      updated[prop] = value;
      updated.markModified(prop);
    });
  }

  if (update.$addToSet) {
    updated.tags.push(...update.$addToSet.tags.$each);
    updated.markModified('tags');
  }

  if (update.$pull) {
    updated.tags = updated.tags.filter((tag) => !update.$pull.tags.$in.includes(tag));
    updated.markModified('tags');
  }

  return updated;
};

export default {
  getNotesFilter,
  getNoteUpdate,
  updateOne,
};
