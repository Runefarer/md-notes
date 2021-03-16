import React, { useState } from 'react';
import { List, Map } from 'immutable';
import {
  ContentState,
  Editor as DraftEditor,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import { diffLines } from 'diff';

import 'draft-js/dist/Draft.css';
import './Editor.scss';

import { parseAsLines } from '../utils/parser';

const MarkdownHighlight = ({ type, children }) => {
  return (
    <span className={type}>
      { children }
    </span>
  );
};

const getTextWithBlock = (contentState, contentBlock) => {
  let blockLine = null;
  let line = 0;

  const text = contentState
    .getBlockMap()
    .map((block) => {
      line += 1;

      if (!block) {
        return '';
      }

      if (block.getKey() === contentBlock.getKey()) {
        blockLine = line;
        return contentBlock.getText();
      }

      return block.getText();
    })
    .join('\n');

  return { text, blockLine };
};

function setKey(from, to, key, processed) {
  return [
    ...processed.slice(0, from),
    ...processed.slice(from, to).map((old) => (old ? `${old} ${key}` : key)),
    ...processed.slice(to),
  ];
}

function processDefinition(chunk, blockText, blockLine, decorations) {
  // TODO: When split into multiple lines and url is same as label
  // not handling processing properly

  let processed = [...decorations];
  let index = 0;

  const labelLines = chunk.label.split('\n').map((line, idx, arr) => {
    let ret = line;
    if (idx === 0) {
      ret = `[${ret}`;
    }

    if (idx === arr.length - 1) {
      ret = `${ret}]:`;
    }

    return ret;
  });
  for (let i = 0; i < labelLines.length; i++) {
    const labelIndex = blockText.indexOf(labelLines[i]);
    if (labelIndex >= index) {
      index = labelIndex + labelLines[i].length;

      processed = setKey(
        labelIndex,
        index,
        `definition definition-label`,
        processed,
      );

      break;
    }
  }

  const urlIndex = blockText.indexOf(chunk.url);
  if (urlIndex >= index) {
    index = urlIndex + chunk.url.length;
    processed = setKey(
      urlIndex,
      index,
      `definition definition-url`,
      processed,
    );
  }

  const titleIndex = blockText.indexOf(chunk.title);
  if (titleIndex >= index + 1) {
    processed = setKey(
      titleIndex - 1,
      titleIndex + chunk.title.length + 1,
      `definition definition-title`,
      processed,
    );
  }

  return processed;
}

function processTable(chunk, blockText, blockLine, decorations) {
  let processed = [...decorations];

  const sepRegex = /\s*(?<=^|[^\\])\|\s*/g;
  const rowIndex = chunk.children.findIndex((row) => row.position.start.line === blockLine);

  let key = null;
  if (rowIndex === -1) {
    key = `table table-delimiter`;
  } else if (rowIndex === 0) {
    key = `table table-header`;
  } else {
    key = `table table-content`;
  }

  processed = new Array(processed.length).fill(key);
  let match = sepRegex.exec(blockText);
  while (match !== null) {
    processed = setKey(
      match.index,
      match.index + match[0].length,
      `table-separator`,
      processed,
    );
    match = sepRegex.exec(blockText);
  }

  return processed;
}

function processListItem(chunk, blockText, blockLine, decorations, from, to) {
  let processed = [...decorations];

  processed = setKey(from, to, `list-item`, processed);

  if (blockLine === chunk.position.start.line) {
    const start = chunk.position.start.column - 1;
    let end = null;

    if (chunk.checked !== null) {
      const match = blockText.match(/\[(.+)\]/);
      if (match !== null) {
        const openIndex = match.index;
        const closeIndex = match.index + match[0].length - 1;

        const outerKey = `tasklist${chunk.checked ? ' checked' : ''}`;
        const innerKey = `tasklist tasklist-inner${chunk.checked ? ' checked' : ''}`;

        processed[openIndex] = `${processed[openIndex]} ${outerKey}`;
        processed[closeIndex] = `${processed[closeIndex]} ${outerKey}`;
        processed = setKey(openIndex + 1, closeIndex, innerKey, processed);

        end = match.index;
      } else {
        end = blockText.length;
      }
    } else {
      end = chunk.children.length
        ? chunk.children[0].position.start.column - 1
        : blockText.length;
    }

    processed = setKey(start, end, `list-item-pre`, processed);
  }

  processed = processChunkChildren(chunk, blockText, blockLine, processed);

  return processed;
}

function processLink(chunk, blockText, blockLine, decorations, from, to) {
  let processed = [...decorations];

  processed = setKey(from, to, `link`, processed);

  let linkEndLine;
  let linkEndIndex = from;

  if (chunk.children.length) {
    const lastChild = chunk.children[chunk.children.length - 1];
    linkEndLine = lastChild.position.end.line;

    if (blockLine === linkEndLine) {
      linkEndIndex = lastChild.position.end.column;

      if (
        chunk.children.length === 1
        && lastChild.type === 'text'
        && chunk.url.indexOf(lastChild.value) !== -1
      ) {
        return setKey(
          lastChild.position.start.column - 1,
          lastChild.position.end.column - 1,
          'link-url',
          processed,
        );
      }
    }
  } else {
    linkEndLine = chunk.position.start.line;

    if (blockLine === linkEndLine) {
      linkEndIndex = blockText.match(/\]\(/).index + 1;
    }
  }

  if (blockLine >= linkEndLine) {
    const escapedUrl = chunk.url.replace(/([^\w])/g, '\\$1');
    const urlRegex = new RegExp(`<${escapedUrl}>|${escapedUrl}`);
    const urlMatch = blockText.substring(linkEndIndex).match(urlRegex);

    if (urlMatch !== null && urlMatch[0].length) {
      processed = setKey(
        linkEndIndex + urlMatch.index,
        linkEndIndex + urlMatch.index + urlMatch[0].length,
        `link-url`,
        processed,
      );
    }

    if (chunk.title) {
      const escapedTitle = chunk.title.replace(/([^\w])/g, '\\$1');
      const titleRegex = new RegExp(`\\"${escapedTitle}\\"|\\'${escapedTitle}\\'|\\(${escapedTitle}\\)`);
      const titleMatch = blockText.substring(linkEndIndex).match(titleRegex);

      if (titleMatch !== null && titleMatch[0].length) {
        processed = setKey(
          linkEndIndex + titleMatch.index,
          linkEndIndex + titleMatch.index + titleMatch[0].length,
          `link-title`,
          processed,
        );
      }
    }
  }

  processed = processChunkChildren(chunk, blockText, blockLine, processed);

  return processed;
}

function processLinkReference(chunk, blockText, blockLine, decorations, from, to) {
  let processed = [...decorations];

  processed = setKey(from, to, `link-reference`, processed);

  let linkEndLine;
  let linkEndIndex = from;

  if (chunk.children.length) {
    const lastChild = chunk.children[chunk.children.length - 1];
    linkEndLine = lastChild.position.end.line;

    if (blockLine === linkEndLine) {
      linkEndIndex = lastChild.position.end.column;
    }
  } else {
    linkEndLine = chunk.position.start.line;

    if (blockLine === linkEndLine) {
      linkEndIndex = blockText.match(/\]\[/).index + 1;
    }
  }

  if (chunk.referenceType !== 'full') {
    const labelLines = chunk.label.split('\n').map((line, idx, arr) => {
      let ret = line;
      if (idx === 0) {
        ret = `[${ret}`;
      }

      if (idx === arr.length - 1) {
        ret = `${ret}]`;
      }

      return ret;
    });
    for (let i = 0; i < labelLines.length; i++) {
      const labelIndex = blockText.indexOf(labelLines[i]);
      if (labelIndex !== -1) {
        processed = setKey(
          labelIndex,
          labelIndex + labelLines[i].length,
          `link-reference-ref`,
          processed,
        );

        break;
      }
    }
  } else if (blockLine >= linkEndLine) {
    const labelLines = chunk.label.split('\n').map((line, idx, arr) => {
      let ret = line;
      if (idx === 0) {
        ret = `[${ret}`;
      }

      if (idx === arr.length - 1) {
        ret = `${ret}]`;
      }

      return ret;
    });
    for (let i = 0; i < labelLines.length; i++) {
      const labelIndex = blockText.substring(linkEndIndex).indexOf(labelLines[i]);
      if (labelIndex !== -1) {
        processed = setKey(
          linkEndIndex + labelIndex,
          linkEndIndex + labelIndex + labelLines[i].length,
          `link-reference-ref`,
          processed,
        );

        break;
      }
    }
  }

  processed = processChunkChildren(chunk, blockText, blockLine, processed);

  return processed;
}

function processImage(chunk, blockText, blockLine, decorations) {
  // TODO: When split into multiple lines and url is same as label
  // not handling processing properly

  let processed = [...decorations];
  let index = 0;

  const altLines = chunk.alt.split('\n').map((line, idx, arr) => {
    let ret = line;
    if (idx === 0) {
      ret = `![${ret}`;
    }

    if (idx === arr.length - 1) {
      ret = `${ret}]`;
    }

    return ret;
  });
  for (let i = 0; i < altLines.length; i++) {
    const altIndex = blockText.indexOf(altLines[i]);
    if (altIndex >= index) {
      index = altIndex + altLines[i].length;

      processed = setKey(
        altIndex,
        index,
        `image image-alt`,
        processed,
      );

      break;
    }
  }

  const urlIndex = blockText.indexOf(chunk.url);
  if (urlIndex >= index) {
    index = urlIndex + chunk.url.length;
    processed = setKey(
      urlIndex,
      index,
      `image image-url`,
      processed,
    );
  }

  const titleIndex = blockText.indexOf(chunk.title);
  if (titleIndex >= index + 1) {
    processed = setKey(
      titleIndex - 1,
      titleIndex + chunk.title.length + 1,
      `image image-title`,
      processed,
    );
  }

  return processed;
}

function processImageReference(chunk, blockText, blockLine, decorations, from, to) {
  let processed = [...decorations];

  processed = setKey(from, to, `image-reference`, processed);

  const linkEndLine = chunk.position.start.line + chunk.alt.split('\n').length - 1;
  let linkEndIndex = from;

  if (blockLine === linkEndLine) {
    linkEndIndex = (blockText.match(/\]\[/)?.index ?? (from - 1)) + 1;
  }

  if (chunk.referenceType !== 'full') {
    const labelLines = chunk.label.split('\n').map((line, idx, arr) => {
      let ret = line;
      if (idx === 0) {
        ret = `[${ret}`;
      }

      if (idx === arr.length - 1) {
        ret = `${ret}]`;
      }

      return ret;
    });
    for (let i = 0; i < labelLines.length; i++) {
      const labelIndex = blockText.indexOf(labelLines[i]);
      if (labelIndex !== -1) {
        processed = setKey(
          labelIndex,
          labelIndex + labelLines[i].length,
          `image-reference-ref`,
          processed,
        );

        break;
      }
    }
  } else if (blockLine >= linkEndLine) {
    const labelLines = chunk.label.split('\n').map((line, idx, arr) => {
      let ret = line;
      if (idx === 0) {
        ret = `[${ret}`;
      }

      if (idx === arr.length - 1) {
        ret = `${ret}]`;
      }

      return ret;
    });
    for (let i = 0; i < labelLines.length; i++) {
      const labelIndex = blockText.substring(linkEndIndex).indexOf(labelLines[i]);
      if (labelIndex !== -1) {
        processed = setKey(
          linkEndIndex + labelIndex,
          linkEndIndex + labelIndex + labelLines[i].length,
          `image-reference-ref`,
          processed,
        );

        break;
      }
    }
  }

  processed = processChunkChildren(chunk, blockText, blockLine, processed);

  return processed;
}

function processChunkChildren(chunk, blockText, blockLine, decorations) {
  let processed = [...decorations];

  if (chunk.children) {
    for (let i = 0; i < chunk.children.length; i++) {
      if (chunk.children[i].position) {
        const { start: startPos, end: endPos } = chunk.children[i].position;
        if (startPos.line <= blockLine && endPos.line >= blockLine) {
          processed = processChunk(chunk.children[i], blockText, blockLine, processed);
        }
      }
    }
  }

  return processed;
}

function processChunk(chunk, blockText, blockLine, decorations) {
  if (chunk.type === 'text' || chunk.type === 'html') {
    return decorations;
  }

  let processed = [...decorations];

  const { start, end } = chunk.position;
  const from = start.line < blockLine ? { line: blockLine, column: 1 } : start;
  const to = end.line > blockLine ? { line: blockLine, column: blockText.length + 1 } : end;

  let key = null;
  switch (chunk.type) {
    case 'thematicBreak':
      key = `thematic-break`;
      break;

    case 'heading':
      key = `heading heading-${chunk.depth}`;
      break;

    case 'definition':
      processed = processDefinition(chunk, blockText, blockLine, processed);
      break;

    case 'table':
      processed = processTable(chunk, blockText, blockLine, processed);
      break;

    case 'listItem':
      processed = processListItem(
        chunk, blockText, blockLine, processed, from.column - 1, to.column - 1,
      );
      break;

    case 'inlineCode':
      key = `inline-code`;
      break;

    case 'link':
      processed = processLink(
        chunk, blockText, blockLine, processed, from.column - 1, to.column - 1,
      );
      break;

    case 'linkReference':
      processed = processLinkReference(
        chunk, blockText, blockLine, processed, from.column - 1, to.column - 1,
      );
      break;

    case 'image':
      processed = processImage(chunk, blockText, blockLine, processed);
      break;

    case 'imageReference':
      processed = processImageReference(
        chunk, blockText, blockLine, processed, from.column - 1, to.column - 1,
      );
      break;

    default:
      key = chunk.type;
      break;
  }

  if (key === null) {
    return processed;
  }

  processed = setKey(from.column - 1, to.column - 1, key, processed);
  processed = processChunkChildren(chunk, blockText, blockLine, processed);

  return processed;
}

class MarkdownDecorator {
  constructor(state) {
    this.state = state || {};

    if (this.state.decorations) {
      this.state.decorated = new Array(this.state.decorations.length).fill(false);
    }
  }

  static getComponentForKey(__key) {
    return MarkdownHighlight;
  }

  static getPropsForKey(key) {
    return { type: key };
  }

  getDecorations(block, contentState) {
    const { text, blockLine } = getTextWithBlock(contentState, block);

    if (this.state.text !== text) {
      this.generateDecorations(text, contentState);
    }

    if (blockLine === null) {
      this.state.decorated.push(false);
      return List(new Array(block.getText().length).fill(null));
    }

    this.state.decorated[blockLine - 1] = true;

    return List(this.state.decorations[blockLine - 1]);
  }

  isFullyDecorated() {
    return !this.state.decorated || this.state.decorated.every((dec) => dec);
  }

  generateDecorations(text) {
    const oldBlocks = this.state.blocks ?? [];

    const oldLines = this.state.lines;
    const oldDecorations = this.state.decorations;
    const oldDecorated = this.state.decorated;

    // TODO: Parsing entire text each time is laggy

    // Find difference in text from last time
    // Find in previous parse where new changes are - multiple cases to consider
    // Generate block of text to be parsed in this go
    // block, line 5 column 1 to line 10 column 8
    // Parse and process block of text
    // Decorate the correct lines

    console.time('diff');
    const diff = diffLines(this.state.text || '', text);
    console.timeEnd('diff');

    let linesAdded = 0;
    let linesRemoved = 0;
    let lineCount = 0;
    let changed = false;
    let changeFrom = 0;

    diff.forEach((part) => {
      if (part.removed) {
        linesRemoved = part.count;
        changed = true;
      } else if (part.added) {
        linesAdded = part.count;
        changed = true;
      } else if (!changed) {
        lineCount += part.count;
      }
    });

    changeFrom = lineCount + 1;

    // we need to construct source to be parsed
    console.log(`${linesRemoved} lines removed from line ${changeFrom}`);
    console.log(`${linesAdded} lines added at line ${changeFrom}`);
    // only considering adding
    const lineSpan = { from: changeFrom, to: changeFrom + linesAdded };
    for (let i = 0; i < oldBlocks.length; i++) {
      const block = oldBlocks[i];
      if (block.from <= lineSpan.from && block.to >= lineSpan.from) {
        lineSpan.from = block.from;
      }

      if (block.from <= lineSpan.to && block.to >= lineSpan.to) {
        lineSpan.to = block.to;
      }
    }

    console.time('parse');
    const parsedLines = parseAsLines(text);
    console.timeEnd('parse');
    const lines = text.split('\n');

    const newDecorations = new Array(lines.length);
    const newDecorated = new Array(lines.length);

    const blocks = [];
    let lineNum = 1;
    let lastBlock = null;

    console.time('generate');
    for (let i = 0; i < lines.length; i++) {
      let decorations = new Array(lines[i].length).fill(null);

      if (parsedLines[i]) {
        for (let j = 0; j < parsedLines[i].length; j++) {
          const chunk = parsedLines[i][j];
          const [startLine, endLine] = [chunk.position.start.line, chunk.position.end.line];

          if (!lastBlock || lastBlock.endLine < startLine) {
            for (let l = lineNum; l < startLine; l++) {
              blocks.push({
                type: 'empty',
                from: l,
                to: l,
              });
            }

            blocks.push({
              type: chunk.type,
              from: startLine,
              to: endLine,
            });

            lineNum = endLine + 1;
            lastBlock = { startLine, endLine };
          }

          decorations = processChunk(chunk, lines[i], i + 1, decorations);
        }
      }

      newDecorations[i] = decorations;
      if (
        oldLines
        && oldLines[i] === lines[i]
        && JSON.stringify(oldDecorations[i]) === JSON.stringify(decorations)
      ) {
        newDecorated[i] = oldDecorated[i];
      } else {
        newDecorated[i] = decorations.length
          ? decorations.every((dec) => dec === null)
          : true;
      }
    }
    console.timeEnd('generate');

    console.log('blocks: ', blocks);

    this.state.decorations = newDecorations;
    this.state.decorated = newDecorated;

    this.state.lines = lines;
    this.state.text = text;
  }
}

MarkdownDecorator.prototype.getComponentForKey = MarkdownDecorator.getComponentForKey;
MarkdownDecorator.prototype.getPropsForKey = MarkdownDecorator.getPropsForKey;

const decorator = new MarkdownDecorator();

const Editor = () => {
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(decorator),
  );

  const handleChange = (state) => {
    setEditorState((__prevState) => {
      if (!decorator.isFullyDecorated()) {
        const contentState = state.getCurrentContent();
        const blocks = contentState.getBlocksAsArray();

        let newContentState = contentState;

        const selection = state.getSelection();
        const anchorKey = selection.getAnchorKey();
        const focusKey = selection.getFocusKey();
        let anchorBlockIndex = null;
        let focusBlockIndex = null;

        for (let i = 0; i < blocks.length; i++) {
          const key = blocks[i].getKey();

          if (
            !decorator.state.decorated[i]
            || decorator.state.decorations[i] === undefined
          ) {
            const data = blocks[i].getData().size ? Map() : Map({ flag: true });
            newContentState = Modifier.setBlockData(
              newContentState,
              SelectionState.createEmpty(key),
              data,
            );
          }

          if (anchorKey === key) {
            anchorBlockIndex = i;
          }

          if (focusKey === key) {
            focusBlockIndex = i;
          }
        }

        const newBlocksArray = newContentState.getBlocksAsArray();
        const newSelection = selection.merge({
          anchorKey: newBlocksArray[anchorBlockIndex].getKey(),
          focusKey: newBlocksArray[focusBlockIndex].getKey(),
        });

        console.time('decorate');
        const newState = EditorState.set(state, { currentContent: newContentState });
        console.timeEnd('decorate');

        return EditorState.forceSelection(newState, newSelection);
      }

      return state;
    });
  };

  const handlePastedText = (text, html, state) => {
    const pastedBlocks = ContentState.createFromText(text).getBlockMap();
    const newState = Modifier.replaceWithFragment(
      state.getCurrentContent(),
      state.getSelection(),
      pastedBlocks,
    );

    handleChange(EditorState.push(state, newState, 'insert-fragment'));

    return true;
  };

  return (
    <DraftEditor
      editorState={editorState}
      onChange={handleChange}
      handlePastedText={handlePastedText}
    />
  );
};

export { Editor as default };
