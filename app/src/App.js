import { useState } from 'react';

import NoteForm from './components/NoteForm';
import { createNote, editNote } from './utils/api';

const App = () => {
  const [note, setNote] = useState();

  const handleSubmit = (value) => {
    if (note?.id) {
      const tags = [];
      value.tags.forEach((tag) => {
        if (note.tags.indexOf(tag) === -1) {
          tags.push({ tag, op: 'ADD' });
        }
      });
      note.tags.forEach((tag) => {
        if (value.tags.indexOf(tag) === -1) {
          tags.push({ tag, op: 'REMOVE' });
        }
      });

      editNote(note.id, { ...value, tags })
        .then((edited) => {
          console.log('edited note: ', edited);
          setNote(edited);
        })
        .catch((err) => {
          console.log('Error when editing note: ', err);
        });
    } else {
      createNote(value)
        .then((created) => {
          console.log('created note: ', created);
          setNote(created);
        })
        .catch((err) => {
          console.log('Error when creating note: ', err);
        });
    }
  };

  return (<NoteForm value={note} onSubmit={handleSubmit} />);
};

export { App as default };
