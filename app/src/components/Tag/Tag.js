import './Tag.scss';

const Tag = ({ tag, removable, onRemove }) => {
  const handleRemove = () => {
    if (typeof onRemove === 'function') {
      onRemove();
    }
  };

  return (
    <div className="tag">
      <div className="tag-content">
        <span>{tag}</span>
        {
          (removable ?? true)
          && (
            <button
              type="button"
              className="remove-tag"
              onClick={handleRemove}
            >
              &#10060;
              <span className="sr-only">
                Remove Tag:
                {tag}
              </span>
            </button>
          )
        }
      </div>
    </div>
  );
};

export { Tag as default };
