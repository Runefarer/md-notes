import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
});

const doRequest = async (fn) => {
  try {
    const { data } = await fn();
    return data;
  } catch (err) {
    throw err.response.data;
  }
};

export const createNote = (data) => {
  return doRequest(() => request.post('/notes', data));
};

export const editNote = (id, data) => {
  return doRequest(() => request.patch(`/notes/${id}`, data));
};

export default {
  createNote,
};
