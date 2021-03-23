import { useState } from 'react';

import './TagsInput.scss';

const TagsInput = ({ placeholder, value, onChange }) => {
  const [text, setText] = useState('');

  const addTag = (tagText) => {
    const oldTags = value ?? [];
    const testText = tagText.toLowerCase();
    if (
      typeof onChange === 'function'
      && !oldTags.find((tag) => tag.toLowerCase() === testText)
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
      {
        (value ?? []).map((tag, index) => (
          <div key={tag} className="tag">
            <div className="tag-content">
              <span>{tag}</span>
              <button
                type="button"
                className="close-tag"
                onClick={() => removeTag(index)}
              >
                &#10060;
                <span className="sr-only">
                  Remove Tag:
                  {tag}
                </span>
              </button>
            </div>
          </div>
        ))
      }
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
