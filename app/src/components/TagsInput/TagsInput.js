import { useState } from 'react';

import './TagsInput.scss';

import TagsList from '../TagsList';

const TagsInput = ({ placeholder, value, onChange }) => {
  const [text, setText] = useState('');

  const addTag = (tagText) => {
    if (!tagText) {
      return;
    }

    const oldTags = value ?? [];
    const testText = tagText.toLowerCase();
    if (
      typeof onChange === 'function'
      && oldTags.every((tag) => tag.toLowerCase() !== testText)
    ) {
      onChange([...oldTags, tagText]);
    }
  };

  const removeTag = (index) => {
    if (typeof onChange === 'function') {
      const oldTags = value ?? [];
      onChange([
        ...oldTags.slice(0, index),
        ...oldTags.slice(index + 1),
      ]);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.code) {
      case 'Space':
      case 'Enter':
        addTag(text);
        setText('');
        e.preventDefault();
        break;

      case 'Backspace':
        if (text === '' && Array.isArray(value) && value.length) {
          removeTag(value.length - 1);
          e.preventDefault();
        }
        break;

      default:
        break;
    }
  };

  return (
    <div className="tags-input-container">
      <TagsList tags={value} onChange={onChange} />
      <input
        className="tags-text-input"
        type="text"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export { TagsInput as default };
