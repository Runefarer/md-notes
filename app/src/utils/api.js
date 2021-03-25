import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
});

const send = async (fn) => {
  try {
    const { data } = await fn();
    return data;
  } catch (err) {
    throw err.response.data;
  }
};

export const getNote = (id) => {
  return send(() => request.get(`/notes/${id}`));
};

export const getNotes = (query) => {
  return send(() => request.get(`/notes${query ? `?${query}` : ``}`));
};

export const createNote = (data) => {
  return send(() => request.post('/notes', data));
};

export const editNote = (id, data) => {
  return send(() => request.patch(`/notes/${id}`, data));
};

export default {
  getNote,
  getNotes,
  createNote,
  editNote,
};
