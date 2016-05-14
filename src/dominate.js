// Regex to extract the tag name
const tagNameRe = /<([\w:]+)/;

// Prevent the parser from ignoring certain
// elements by wrapping them with the necessary
// parent elements to appease XHTML
// (courtesy of jQuery)
const wrapMap = {
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    default: [0, '', '']
};
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

/**
 * Validate an HTML string
 *
 * @param {*} obj
 * @return {Boolean}
 * @api private
 */
function isValid(obj) {
    const type = typeof obj;
    // eslint-disable-next-line no-self-compare
    return type === 'string' || type === 'boolean' || (type === 'number' && obj === obj);
}

/**
 * Convert a string into a DOM node
 *
 * @param {String} html
 * @param {Document} doc
 * @return {Element|TextNode|DocumentFragment}
 * @api public
 */
export function dominate(html, doc = document) {
    // Validate html param
    if (!isValid(html)) {
        throw new TypeError('Invalid input, string/number/boolean expected');
    }
    // Get the tag name
    const match = tagNameRe.exec(html);
    // If no tag name exists, treat it as plain text
    if (!match) {
        return doc.createTextNode(html);
    }
    // Wrap the element in the appropriate container
    const tag = match[1];
    const wrap = wrapMap[tag] || wrapMap.default;
    html = wrap[1] + html.trim() + wrap[2];
    // Get the depth of the element in the DOM tree
    let depth = wrap[0];
    // Create parsing element
    let el = doc.createElement('div');
    // Parse HTML string
    el.innerHTML = html;
    // Descend through wrappers to get the right element
    while (depth--) {
        el = el.lastChild;
    }
    // Single element
    if (el.childNodes.length === 1) {
        return el.removeChild(el.firstChild);
    }
    // Use a document fragment for multiple elements
    const frag = doc.createDocumentFragment();
    while (el.firstChild) {
        frag.appendChild(el.firstChild);
    }
    return frag;
}
