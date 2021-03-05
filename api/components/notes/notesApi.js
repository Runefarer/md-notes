import express from 'express';
import mongoose from 'mongoose';

import {
  validateNote, validatePartial,
} from './notesValidators.js';

import {
  getNote,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from './notesService.js';

import {
  invalidRequestError,
  notFoundError,
  methodNotAllowedError,
} from '../../utils/errors.js';

const api = express.Router();

const Error = {
  NoteNotFound(id) {
    return notFoundError(`Note with id ${id} not found.`);
  },

  InvalidData(details) {
    return invalidRequestError('Invalid request.', details);
  },

  ResourceNotFound() {
    return notFoundError('Resource not found.');
  },
};

api.get('/', async (req, res) => {
  const { title, tags } = req.query;

  const notes = await getNotes({ title, tags });

  res.json(notes);
});

api.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const note = await getNote(id);

    if (!note) {
      return next(Error.NoteNotFound(id));
    }

    return res.json(note);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      err.api = Error.NoteNotFound(id);
    }

    return next(err);
  }
});

api.post('/', async (req, res, next) => {
  const data = req.body;

  const invalid = validateNote(data);
  if (Object.values(invalid).some((err) => err)) {
    return next(Error.InvalidData(invalid));
  }

  try {
    const note = await createNote(data);

    return res.status(201).json(note);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      err.api = Error.InvalidData(Object.fromEntries(
        Object.entries(err.errors).map(([prop, trace]) => [prop, trace.message]),
      ));
    }

    return next(err);
  }
});

api.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const changes = req.body;

  const invalid = validatePartial(changes);
  if (Object.values(invalid).some((err) => err)) {
    return next(Error.InvalidData(invalid));
  }

  try {
    const updated = await updateNote(id, changes);
    if (!updated) {
      return next(Error.NoteNotFound(id));
    }

    return res.json(updated);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      err.api = Error.NoteNotFound(id);
    }

    return next(err);
  }
});

api.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const deleted = await deleteNote(id);
    if (!deleted) {
      return next(Error.NoteNotFound(id));
    }

    return res.json(deleted);
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      err.api = Error.NoteNotFound(id);
    }

    return next(err);
  }
});

api.use((req, res, next) => {
  next(methodNotAllowedError());
});

export { api as default };
