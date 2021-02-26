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
  - [] Setup frontend-backend communication
  - [] Setup CRUD for notes
  - [] Setup note editor
  - [] Setup note previewer
  - [] Setup note links
  - [] Setup view and searching notes
  - [] Setup tags for notes
  - [] Setup searching notes by tags

### App Structure
  > api
    - package.json
      * Express
      * Mongoose
      * Dotenv

  > app
    - package.json
      * React
