import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import NoteForm from '../components/NoteForm';
import { createNote, editNote, getNote } from '../utils/api';

const NoteEditor = () => {
  const history = useHistory();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState();

  useEffect(() => {
    if (id && !note?.id) {
      setLoading(true);
      getNote(id)
        .then((data) => {
          setNote(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(`Error getting note with id ${id}: `, err);
          history.push('/notes');
        });
    }
  }, [id]);

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
          history.replace(`/notes/edit/${created.id}`);
        })
        .catch((err) => {
          console.log('Error when creating note: ', err);
        });
    }
  };

  return (
    <>
      {loading && (<div>Loading...</div>)}
      {!loading && (<NoteForm value={note} onSubmit={handleSubmit} />)}
    </>
  );
};

export { NoteEditor as default };
