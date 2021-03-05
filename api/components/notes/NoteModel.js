import mongoose from 'mongoose';

import {
  isValidTitle,
  isValidContent,
  isValidTags,
  validateTitle,
  validateContent,
  validateTags,
} from './notesValidators.js';

const { Schema, model } = mongoose;

const toValue = {
  versionKey: false,
  transform: (doc, ret) => {
    /* eslint-disable no-param-reassign, no-underscore-dangle */
    ret.id = ret._id;
    delete ret.__v;
    delete ret._id;
    /* eslint-enable no-param-reassign, no-underscore-dangle */
  },
};

const noteSchema = new Schema({
  title: {
    type: String,
    index: true,
    default: '',
    validate: {
      validator: isValidTitle,
      message: (props) => validateTitle(props.value),
    },
  },
  content: {
    type: String,
    default: '',
    validate: {
      validator: isValidContent,
      message: (props) => validateContent(props.value),
    },
  },
  tags: {
    type: [String],
    default: [],
    index: true,
    validate: {
      validator: isValidTags,
      message: (props) => validateTags(props.value),
    },
  },
}, {
  timestamps: true,
  toJSON: toValue,
  toObject: toValue,
});

noteSchema.pre('save', function preSave(next) {
  if (this.tags === undefined || this.tags === null) {
    this.tags = [];
  } else {
    this.tags = [...new Set(this.tags)];
  }

  next();
});

const NoteModel = model('Note', noteSchema);

export { NoteModel as default };
