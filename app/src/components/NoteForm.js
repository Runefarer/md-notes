import { useState } from 'react';

import Editor from './Editor';
import Previewer from './Previewer';

import './NoteForm.scss';

const TEMP_SEED = `# Markdown Notes Project

| Heads | Tails  | Evens   | Odds   |
| ----- | :----- | :-----: | -----: |
| Stuff | Here   | I       | don't  |
| care  | too    | much    | about  | at all |

## Initial Concept
  * Basic
    - People can add progress tracking in the markdown
    - People can view notes
    - People can search for notes by title or tags
    - People can login
    - People can create/edit/delete notes
    - People can share notes (links or <datadev> QR codes)
    - People can make notes private
    - People can manage notes by tagging them
    - People can react to notes and like them or favorite them
  * Advanced
    - <lance> People can run code blocks of JavaScript
    - <lance> People can reference other notes in their notes
    - <lance> People can aggregate notes/topics and share aggregates (boards)
    - People can create and manage teams
    - People can work on notes collaborating with others
    - People can create Kanban boards to manage tasks, both individualy and in teams
    - People can manage history of notes and revert to older or newer version
      + <guruguhan> People can see differences between versions easily/visually
    - People can put HTML in markdown: [https://gist.github.com/seanh/13a93686bf4c2cb16e658b3cf96807f2] <kwantuum>
  * More Advanced
    - <guruguhan> People can use different themes to personalize app/notes
    - Notes forming a 'website'/'blog'
      + One note can link to other notes / can have 'main' page that links to certain notes

## First Pass
  * Create notes
  * View notes
  * Edit and delete notes
  * Add tags to notes
  * Search notes by tags or title

\`\`\`javascript
for(let i = 0; i < 5; i++) {
     console.log(i);
}
\`\`\`

### Tasks
  - [ ] Decide app structure
    - [x] Create api and app folders
    - [ ] npm init both api and app
    - [x] npm install Express, Mongoose, and Dotenv on api
    - [ ] Add .gitignore
  - [x] Setup Express project and structure
  - [ ] Setup database`;

const NoteForm = () => {
  const [noteContent, setNoteContent] = useState(TEMP_SEED);

  return (
    <div className="note-form-container">
      <div className="note-form-header">
        I am the header!
      </div>
      <div className="note-form-body">
        <div className="wrapper">
          <Editor value={noteContent} onChange={setNoteContent} />
        </div>
        <div className="wrapper">
          <Previewer source={noteContent} />
        </div>
      </div>
    </div>
  );
};

export { NoteForm as default };
