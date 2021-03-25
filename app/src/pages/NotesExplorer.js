import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import NotesList from '../components/NotesList';
import SearchInput from '../components/SearchInput';

import { getNotes } from '../utils/api';

function getQuery(input) {
  const parts = [];
  if (input.title) {
    parts.push(`title=${encodeURIComponent(input.title)}`);
  }

  if (input.tags?.length) {
    parts.push(`tags=${encodeURIComponent(input.tags.join(','))}`);
  }

  return parts.join('&');
}

const NotesExplorer = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ title: '', tags: [] });
  const [notes, setNotes] = useState();

  const handleView = (id) => {
    history.push(`/notes/${id}`);
  };

  const handleSearch = (value) => {
    const query = getQuery(value);
    setLoading(true);
    getNotes(query)
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log('Error fetching searched notes: ', err);
      });
  };

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

  return (
    <div>
      <SearchInput
        value={search}
        onChange={setSearch}
        onSearch={handleSearch}
      />
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
    </div>
  );
};

export { NotesExplorer as default };
