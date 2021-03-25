import Tag from '../Tag';

const TagsList = ({ tags, onChange, removable }) => {
  const handleRemove = (index) => {
    if (typeof onChange === 'function') {
      onChange([
        ...tags.slice(0, index),
        ...tags.slice(index + 1),
      ]);
    }
  };

  return (
    <>
      {
        (tags ?? []).map((tag, index) => (
          <Tag
            key={tag}
            tag={tag}
            removable={removable ?? true}
            onRemove={() => handleRemove(index)}
          />
        ))
      }
    </>
  );
};

export { TagsList as default };
