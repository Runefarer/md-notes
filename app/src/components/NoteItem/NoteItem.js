import TagsList from '../TagsList';

const NoteItem = ({ note, onClick }) => {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick(note.id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Enter') {
      handleClick();
    }
  };

  return (
    <div
      className="note-item-container"
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="note-item-title">
        {note.title}
      </div>
      <div className="note-item-tags">
        <TagsList tags={note.tags} removable={false} />
      </div>
    </div>
  );
};

export { NoteItem as default };
