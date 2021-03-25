import NoteItem from '../NoteItem';

const NotesList = ({ children, notes, onView }) => {
  const handleClick = (id) => {
    if (typeof onView === 'function') {
      onView(id);
    }
  };

  return (
    <>
      {!notes?.length && children}
      {
        !!(notes?.length)
        && (
          <div>
            {
              notes.map((note, index) => (
                <NoteItem
                  key={`note-${index + 1}`}
                  note={note}
                  onClick={handleClick}
                />
              ))
            }
          </div>
        )
      }
    </>
  );
};

export { NotesList as default };
