import { useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

import TagsList from '../TagsList';

const TAG_REGEX = /(?<=^|\s)#([^\s]+)\s/g;
const LAST_TAG_REGEX = /(?<=^|\s)#([^\s]+)(?:\s|$)/g;

function extractTags(text, last = false) {
  const tags = [];
  const extracted = text
    .replace(last ? LAST_TAG_REGEX : TAG_REGEX, (match, capture) => {
      tags.push(capture);
      return '';
    })
    .replace(/(\s){2,}/g, '$1');

  return [extracted, tags];
}

const SearchInput = ({ value, onChange, onSearch }) => {
  const valueRef = useRef(value);
  const setDebounce = useDebounce();

  const triggerSearch = (immediate = false) => {
    if (typeof onSearch === 'function') {
      setDebounce(() => onSearch(valueRef.current), immediate ? 0 : 500);
    }
  };

  const handleTitleChange = (title, trigger = false) => {
    const [newTitle, tags] = extractTags(title, trigger);

    const newTags = [...(value?.tags ?? [])];
    for (let i = 0; i < tags.length; i++) {
      const testTag = tags[i].toLowerCase();
      if (newTags.every((t) => t.toLowerCase() !== testTag)) {
        newTags.push(tags[i]);
      }
    }

    valueRef.current = {
      ...value,
      title: newTitle,
      tags: newTags,
    };

    if (typeof onChange === 'function') {
      onChange(valueRef.current);
    }

    triggerSearch(trigger);
  };

  const handleTagsChange = (tags) => {
    valueRef.current = { ...value, tags };

    if (typeof onChange === 'function') {
      onChange(valueRef.current);
    }

    triggerSearch();
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Enter') {
      handleTitleChange(e.target.value, true);
    }
  };

  return (
    <div className="search-input-container">
      <div className="search-input-title">
        <input
          type="text"
          value={value?.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="search-input-tags">
        <TagsList
          tags={value?.tags}
          onChange={handleTagsChange}
        />
      </div>
    </div>
  );
};

export { SearchInput as default };
