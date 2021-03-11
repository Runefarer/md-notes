import unified from 'unified';
import markdown from 'remark-parse';
import gfm from 'remark-gfm';

const parser = unified().use(markdown).use(gfm);

export const parseAsLines = (text) => {
  const lines = [];

  const parsed = parser.parse(text);
  parsed.children.forEach((chunk) => {
    const { start, end } = chunk.position;
    for (let i = 0; i <= (end.line - start.line); i++) {
      lines[start.line + i - 1] = lines[start.line + i - 1] ?? [];
      lines[start.line + i - 1].push(chunk);
    }
  });

  return lines;
};

export { parser as default };
