import fromMarkdown from 'mdast-util-from-markdown';
import gfmSyntax from 'micromark-extension-gfm';
import gfm from 'mdast-util-gfm';

const parseOptions = {
  extensions: [gfmSyntax()],
  mdastExtensions: [gfm.fromMarkdown],
};

export const parse = (text) => {
  return fromMarkdown(text, parseOptions);
};

export const parseAsLines = (text) => {
  const lines = [];

  const parsed = parse(text);
  parsed.children.forEach((chunk) => {
    const { start, end } = chunk.position;
    for (let i = 0; i <= (end.line - start.line); i++) {
      lines[start.line + i - 1] = chunk;
    }
  });

  return lines;
};

export default {
  parse,
  parseAsLines,
};
