import { useState } from 'react';

import TagsInput from '../TagsInput';
import Editor from '../Editor';
import Previewer from '../Previewer';

import './NoteForm.scss';

const NoteForm = ({ value, onSubmit }) => {
  const [title, setTitle] = useState(value?.title ?? '');
  const [tags, setTags] = useState(value?.tags ?? []);
  const [content, setContent] = useState(value?.content ?? '');

  const handleSubmit = () => {
    if (!title || !content) {
      // TODO: This should show a proper error!
      console.log('Both title and content should be present!');
      return;
    }

    if (typeof onSubmit === 'function') {
      onSubmit({ title, tags, content });
    }
  };

  return (
    <div className="note-form-container">
      <div className="note-form-section note-form-controls-container">
        <button
          type="submit"
          className="note-form-submit"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      <div className="note-form-section note-form-title-container">
        <input
          className="note-form-title-input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="note-form-section note-form-tags-container">
        <TagsInput
          placeholder="Add a tag!"
          value={tags}
          onChange={setTags}
        />
      </div>
      <div className="note-form-section note-form-content-container">
        <div className="wrapper">
          <Editor
            placeholder="Write a note!"
            value={content}
            onChange={setContent}
          />
        </div>
        <div className="wrapper">
          <Previewer source={content} />
        </div>
      </div>
    </div>
  );
};

export { NoteForm as default };
