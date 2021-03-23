import express from 'express';
import cors from 'cors';

import notesApi from './components/notes/notesApi.js';
import { errorHandler } from './utils/errors.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/notes', notesApi);

app.use(errorHandler);

export { app as default };
