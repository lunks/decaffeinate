import getIndent from '../utils/getIndent';
import trimmedNodeRange from '../utils/trimmedNodeRange';

const NEWLINE = '\n';
const SPACE = ' ';
const TAB = '\t';
const HASH = '#';

/**
 * Adds a closing curly brace on a new line after a node with the proper indent.
 *
 * @param {Object} node
 * @param {MagicString} patcher
 * @returns {number}
 */
export default function appendClosingBrace(node, patcher) {
  const source = patcher.original;
  const originalInsertionPoint = trimmedNodeRange(node, source)[1];
  let insertionPoint = seekToEndOfStatementOrLine(source, originalInsertionPoint);

  patcher.insert(
    insertionPoint,
    `\n${getIndent(source, node.range[0])}}`
  );

  return insertionPoint;
}

/**
 * Finds the last character of a statement or, if there is a comment or
 * whitespace following it on the same line, finds the end of the line.
 *
 * @param {string} source
 * @param {number} index
 * @returns {number}
 */
function seekToEndOfStatementOrLine(source, index) {
  let insideComment = false;

  while (index < source.length) {
    let char = source[index];

    if (char === NEWLINE) {
      break;
    } else if (char === HASH) {
      insideComment = true;
    } else if (!insideComment && char !== SPACE && char !== TAB) {
      break;
    }

    index++;
  }

  return index;
}
