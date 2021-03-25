import { Suspense, lazy } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const NotesExplorer = lazy(() => import('./pages/NotesExplorer'));
const NoteViewer = lazy(() => import('./pages/NoteViewer'));
const NoteEditor = lazy(() => import('./pages/NoteEditor'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route path={['/notes/create', '/notes/edit/:id']}>
            <NoteEditor />
          </Route>
          <Route path="/notes/:id">
            <NoteViewer />
          </Route>
          <Route path="/notes">
            <NotesExplorer />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Suspense>
    </Router>
  );
};

export { App as default };
