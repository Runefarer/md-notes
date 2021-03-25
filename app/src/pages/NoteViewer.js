import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Previewer from '../components/Previewer';

import TagsList from '../components/TagsList';
import { getNote } from '../utils/api';

const NoteViewer = () => {
  const history = useHistory();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState();

  useEffect(() => {
    if (!id) {
      history.push('/notes');
    }

    getNote(id)
      .then((data) => {
        setNote(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(`Error getting note with id: ${id}: `, err);
        history.push('/notes');
      });
  }, [id]);

  return (
    <>
      {loading && <div>Loading...</div>}
      {
        !loading
        && (
          <div className="note-viewer-container">
            <div className="note-viewer-title">
              {note.title}
            </div>
            <div className="note-viewer-tags">
              <TagsList tags={note.tags} removable={false} />
            </div>
            <div className="note-viewer-content">
              <Previewer source={note.content} />
            </div>
          </div>
        )
      }
    </>
  );
};

export { NoteViewer as default };
