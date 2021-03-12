# Markdown Notes Project

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

### Tasks
  - [x] Decide app structure
    - [x] Create api and app folders
    - [x] npm init both api and app
    - [x] npm install Express, Mongoose, and Dotenv on api
    - [x] Add .gitignore
  - [x] Setup Express project and structure
  - [x] Setup database
    - [x] Install MongoDB
    - [x] Setup Mongoose connection
  - [x] Setup React project and structure
    - [x] Setup initial Babel and Webpack
    - [x] Add SCSS support
  - [x] Setup ESLint
    - [x] Install ESLint for api
    - [x] Install ESLint for app
  - [x] Setup testing frameworks
    - [x] Setup testing for Express
    - [x] Setup testing for React
  - [x] (API) Setup basic notes endpoints
    - [x] Create schema/model for notes
    - [x] Create service for CRUD actions on notes
    - [x] Create api for notes
    - [x] Ensure everything is well tested 
  - [ ] Setup basic app
    - [ ] Setup note editor
      - [ ] Parsing
        - [x] Remark to parse Markdown
        - [x] Go through line by line / block by block
        - [ ] Fix mix of lazy/non-lazy block-quotes
      - [ ] Editor UI
        - [x] DraftJS to implement editor
        - [x] Act upon transformed markdown and proces it
        - [x] Handle edge cases where content disappears
        - [ ] Make sure editor works for all markdown types
        - [ ] Make sure editor works with pasting
        - [ ] Make editing smooth and fast / fix any lag
        - [ ] Make sure parse processing is better
        - [ ] Make sure multiline definitions are processed/decorated properly
        - [ ] Format table properly while editing
        - [ ] Indicate list indentation for both singleline and spread
        - [ ] Make sure there are no editing issues
        - [ ] Handle HTML entitites
      - [ ] Syntax highlighting
        - [ ] Headings
        - [ ] Bold, Italic, Underline, Strikethrough
        - [ ] Images
        - [ ] Links
        - [ ] Lists
        - [ ] Code inline and blocks
        - [ ] Quotes
        - [ ] Tables
        - [ ] Checkboxes
        - [ ] Horizontal Lines
        - [ ] Languages inside code blocks
      - [ ] Toolbar for formatting
      - [ ] Numbered lines with folding
      - [ ] Autocomplete
    - [ ] Setup note previewer
  - [ ] Setup frontend-backend communication
  - [ ] Setup notes CRUD
    - [ ] Setup CRUD UI
    - [ ] Setup CRUD functionality
    - [ ] Ensure everything is well tested
  - [ ] Setup note links
  - [ ] Setup view and searching notes
  - [ ] Setup tags for notes
  - [ ] Setup searching notes by tags
  - [ ] Explore Swagger to improve/standardize API

### App Structure
  - api
    - package.json
      - Express
      - Mongoose
      - Dotenv
    - components
      - notes
        - NoteModel.js
        - NotesService.js
        - NotesApi.js
        * tests
          - NotesService.test.js
          
  - app
    - package.json
      - React
