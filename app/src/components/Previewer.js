import { Fragment, useEffect, useState } from 'react';
import Prism from 'prismjs';

import 'prismjs/themes/prism-dark.css';
import './Previewer.scss';

import { parse } from '../utils/parser';

function renderCode(chunk, key) {
  if (!chunk.lang || !Prism.languages[chunk.lang]) {
    return (
      <code key={key} className="code-block">
        {chunk.value}
      </code>
    );
  }

  const tokens = Prism.tokenize(chunk.value, Prism.languages[chunk.lang]);

  return (
    <code key={key} className="code-block">
      {
        tokens.map((token, index) => {
          return renderCodeToken(token, `token-${index + 1}`);
        })
      }
    </code>
  );
}

function renderCodeToken(token, key, path = []) {
  if (!token.type) {
    return (
      <Fragment key={key}>{token}</Fragment>
    );
  }

  path.push(token.type);

  if (!Array.isArray(token.content)) {
    return (
      <span key={key} className={`token${path ? ` ${path.join(' ')}` : ``}`}>
        {token.content}
      </span>
    );
  }

  return (
    <Fragment key={key}>
      {
        token.content.map((tok, index) => {
          return renderCodeToken(
            tok,
            `${key}-${index + 1}`,
            path,
          );
        })
      }
    </Fragment>
  );
}

function renderLinkReference(chunk, key, children, definitions) {
  const data = definitions[chunk.identifier];
  if (!data) {
    return null;
  }

  return (
    <a key={key} href={data.url} title={data.title}>
      {children}
    </a>
  );
}

function renderImageReference(chunk, key, children, definitions) {
  const data = definitions[chunk.identifier];
  if (!data) {
    return null;
  }

  return (
    <img key={key} src={data.url} alt={chunk.alt} title={data.title} />
  );
}

function renderTable(chunk, key, children, definitions) {
  if (!chunk.children?.length) {
    return (<table key={key} />);
  }

  const head = (
    <tr>
      {renderTableCells(chunk.children[0].children, chunk.align, true, definitions)}
    </tr>
  );

  const body = [];
  for (let i = 1; i < chunk.children.length; i++) {
    const row = chunk.children[i];
    body.push(
      <tr key={`${row.type}-${i}`}>
        {renderTableCells(row.children, chunk.align, false, definitions)}
      </tr>,
    );
  }

  return (
    <table key={key}>
      <thead>{head}</thead>
      <tbody>{body}</tbody>
    </table>
  );
}

function renderTableCells(cells, align, header, definitions) {
  return cells.map((cell, index) => {
    const alignClass = align[index] ? `align-${align[index]}` : ``;

    if (header) {
      return (
        <th key={`${cell.type}-${index + 1}`} className={alignClass}>
          {renderChunkChildren(cell, definitions)}
        </th>
      );
    }

    return (
      <td key={`${cell.type}-${index + 1}`} className={alignClass}>
        {renderChunkChildren(cell, definitions)}
      </td>
    );
  });
}

function renderChunkChildren(chunk, definitions) {
  if (!chunk.children?.length) {
    return null;
  }

  return chunk.children.map((child) => renderChunk(child, definitions));
}

function renderChunk(chunk, definitions) {
  let output = null;

  let key;
  if (chunk.position) {
    const { start, end } = chunk.position;
    key = `${chunk.type}-${start.line},${start.column}-${end.line},${end.column}`;
  } else {
    key = `${chunk.type}-${Math.random() * 1000000}`;
  }

  let children = null;
  if (chunk.type !== 'table') {
    children = renderChunkChildren(chunk, definitions);
  }

  switch (chunk.type) {
    case 'paragraph':
      output = (<p key={key}>{children}</p>);
      break;

    case 'heading':
      switch (chunk.depth) {
        default:
        case 1:
          output = (<h1 key={key}>{children}</h1>);
          break;
        case 2:
          output = (<h2 key={key}>{children}</h2>);
          break;
        case 3:
          output = (<h3 key={key}>{children}</h3>);
          break;
        case 4:
          output = (<h4 key={key}>{children}</h4>);
          break;
        case 5:
          output = (<h5 key={key}>{children}</h5>);
          break;
        case 6:
          output = (<h6 key={key}>{children}</h6>);
          break;
      }
      break;

    case 'thematicBreak':
      output = (<hr key={key} />);
      break;

    case 'blockquote':
      output = (<blockquote key={key}>{children}</blockquote>);
      break;

    case 'list':
      if (chunk.ordered) {
        output = (<ol key={key} start={chunk.start || 1}>{children}</ol>);
      } else {
        output = (<ul key={key}>{children}</ul>);
      }
      break;

    case 'listItem':
      output = (
        <li key={key}>
          {
            chunk.checked !== null
            && (
              <input
                type="checkbox"
                className="tasklist-checkbox"
                disabled
                checked={chunk.checked}
              />
            )
          }
          {children}
        </li>
      );
      break;

    case 'html':
      output = (<Fragment key={key}>{chunk.value}</Fragment>);
      break;

    case 'code':
      output = renderCode(chunk, key, children, definitions);
      break;

    case 'text':
      output = (
        <Fragment key={key}>
          {
            chunk.value.split('\n').map(
              (line, index, arr) => (
                <Fragment key={`text-content-${index + 1}`}>
                  {line}
                  {(index !== arr.length - 1) && (<br />)}
                </Fragment>
              ),
            )
          }
        </Fragment>
      );
      break;

    case 'emphasis':
      output = (<em key={key}>{children}</em>);
      break;

    case 'strong':
      output = (<strong key={key}>{children}</strong>);
      break;

    case 'delete':
      output = (<span key={key} className="delete">{children}</span>);
      break;

    case 'inlineCode':
      output = (
        <code key={key} className="code-inline">
          {chunk.value}
        </code>
      );
      break;

    case 'link':
      output = (
        <a key={key} href={chunk.url} title={chunk.title}>
          {children}
        </a>
      );
      break;

    case 'image':
      output = (
        <img
          key={key}
          src={chunk.url}
          alt={chunk.alt}
          title={chunk.title}
        />
      );
      break;

    case 'linkReference':
      output = renderLinkReference(chunk, key, children, definitions);
      break;

    case 'imageReference':
      output = renderImageReference(chunk, key, children, definitions);
      break;

    case 'table':
      output = renderTable(chunk, key, children, definitions);
      break;

    default:
      break;
  }

  return output;
}

const Previewer = ({ source }) => {
  const [output, setOutput] = useState(null);

  useEffect(() => {
    if (!source) {
      setOutput(null);
      return;
    }

    const parsed = parse(source);

    const chunks = [];
    const definitions = {};
    for (let i = 0; i < parsed.children.length; i++) {
      const chunk = parsed.children[i];
      if (chunk.type === 'definition') {
        definitions[chunk.identifier] = chunk;
      } else {
        chunks.push(chunk);
      }
    }

    const jsx = [];

    // TODO: Maybe add <br> for line breaks? If no definition?
    for (let i = 0; i < chunks.length; i++) {
      const result = renderChunk(chunks[i], definitions);
      if (result) {
        jsx.push(result);
      }
    }
    setOutput(jsx);
  }, [source]);

  return (
    <div>{output}</div>
  );
};

export default Previewer;
