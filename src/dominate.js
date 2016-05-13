// Regex to detect HTML string
const htmlRe = /<[a-z][\s\S]*>/;

/**
 * Validate an HTML string
 *
 * @param {*} obj
 * @return {Boolean}
 * @api private
 */
function isValid(obj) {
    const type = typeof obj;
    return type === 'string' ||
        type === 'boolean' ||
        (type === 'number' && obj === obj); // eslint-disable-line no-self-compare
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
    // If the html param is not an HTML string,
    // return a text node
    if (!htmlRe.test(html)) {
        return doc.createTextNode(html);
    }
    // Trim HTML string
    html = html.trim();
    // Create parsing element
    const el = doc.createElement('div');
    // Parse HTML string
    el.innerHTML = html;
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
