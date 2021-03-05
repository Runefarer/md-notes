import app from './app.js';
import connect from './utils/db.js';

connect().then(() => {
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`Started listening on port ${port}...`);
  });
});
