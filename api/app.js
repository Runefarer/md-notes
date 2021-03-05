import express from 'express';

import notesApi from './components/notes/notesApi.js';
import { errorHandler } from './utils/errors.js';

const app = express();

app.use(express.json());

app.use('/api/notes', notesApi);

app.use(errorHandler);

export { app as default };
