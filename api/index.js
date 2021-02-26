import express from 'express';

import connect from './utils/db.js';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

connect().then(() => {
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`Started listening on port ${port}...`);
  });
});
