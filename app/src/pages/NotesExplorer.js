import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import NotesList from '../components/NotesList';

import { getNotes } from '../utils/api';

const NotesExplorer = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState();

  useEffect(() => {
    getNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log('Error fetching notes: ', err);
      });
  }, []);

  const handleView = (id) => {
    history.push(`/notes/${id}`);
  };

  return (
    <>
      {loading && (<div>Loading...</div>)}
      {
        !loading
        && (
          <NotesList notes={notes} onView={handleView}>
            <p>
              There are no notes, yet!
              Maybe you&apos;d like to create one!
            </p>
          </NotesList>
        )
      }
    </>
  );
};

export { NotesExplorer as default };
