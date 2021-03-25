import NoteModel from './NoteModel.js';
import {
  getNotesFilter,
  getNoteUpdate,
  updateOne,
} from './notesOperators.js';

export const getNote = async (id) => {
  return NoteModel.findById(id);
};

export const getNotes = async ({ title, tags } = {}) => {
  return NoteModel
    .find(getNotesFilter({ title, tags }));
};

export const createNote = async ({ title, content, tags } = {}) => {
  const doc = new NoteModel({ title, content, tags });
  return doc.save();
};

export const updateNote = async (id, changes) => {
  const update = getNoteUpdate(changes);

  if (update.$addToSet && update.$pull) {
    const note = await NoteModel.findById(id);
    if (!note) {
      return null;
    }

    return updateOne(note, update).save();
  }

  return NoteModel.findByIdAndUpdate(id, update, { new: true });
};

export const deleteNote = async (id) => {
  return NoteModel.findByIdAndDelete(id);
};

export default {
  getNote,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};
