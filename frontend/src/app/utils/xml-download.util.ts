export const formatXmlForDownload = (xml: string): string => {
  const normalized = xml
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  const compact = normalized.replace(/>\s+</g, '><');
  const tokens = compact.match(/<[^>]+>|[^<]+/g) || [];
  let indent = 0;

  const lines = tokens.flatMap(token => {
    const current = token.trim();

    if (!current) {
      return [];
    }

    if (current.startsWith('</')) {
      indent = Math.max(indent - 1, 0);
      return [`${'  '.repeat(indent)}${current}`];
    }

    if (current.startsWith('<?')) {
      return [current];
    }

    if (current.startsWith('<')) {
      const formattedTag = formatTag(current, indent);

      if (!current.endsWith('/>')) {
        indent += 1;
      }

      return formattedTag;
    }

    return [`${'  '.repeat(indent)}${current}`];
  });

  return `${lines.join('\r\n')}\r\n`;
};

const formatTag = (tag: string, indent: number): string[] => {
  const baseIndent = '  '.repeat(indent);
  const match = tag.match(/^<([^\s/>]+)([\s\S]*?)(\/?)>$/);

  if (!match) {
    return [`${baseIndent}${tag}`];
  }

  const [, tagName, rawAttrs, slash] = match;
  const attrs = Array.from(rawAttrs.matchAll(/([\w:]+)="([^"]*)"/g));

  if (attrs.length === 0) {
    return [`${baseIndent}<${tagName}${slash}>`];
  }

  const lines = [`${baseIndent}<${tagName}`];
  attrs.forEach((attr, index) => {
    const suffix = index === attrs.length - 1 ? `${slash}>` : '';
    lines.push(`${baseIndent}    ${attr[1]}="${attr[2]}"${suffix}`);
  });

  return lines;
};
