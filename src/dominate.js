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
 * Convert a string into a DOM node
 *
 * @param {String} html
 * @param {Document} doc
 * @return {Element|TextNode|DocumentFragment}
 * @api public
 */
export default function dominate(html, doc = document) {
    // Validate html param
    if (~~('string boolean number').indexOf(typeof html)) {
        throw new TypeError('Invalid input, string/number/boolean expected');
    }
    // Parse the HTML string for a tag name
    const match = tagNameRe.exec(html);
    // If no tag name exists, treat it as plain text
    if (!match) {
        return doc.createTextNode(html);
    }
    // Get the tag name
    const tag = match[1].toLowerCase();
    // Wrap the element in the appropriate container
    const wrap = wrapMap[tag] || wrapMap.default;
    html = wrap[1] + html.trim() + wrap[2];
    // Parse HTML string
    let el = doc.createElement('div');
    el.innerHTML = html;
    // Descend through wrappers to get the right element
    let depth = wrap[0];
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
