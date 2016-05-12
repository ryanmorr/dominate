// Detect HTML string
const htmlRe = /<[a-z][\s\S]*>/;

// Validate param
function isValid(obj) {
    const type = typeof obj;
    return type === 'string' ||
        type === 'boolean' ||
        (type === 'number' && obj === obj); // eslint-disable-line no-self-compare
}

export function dominate(html, doc = document) {
    // Validate html param
    if (!isValid(html)) {
        throw new TypeError('Invalid input, string/number/boolean expected');
    }
    // Coerce html param to string if it's not a string
    if (typeof html !== 'string') {
        html = html + '';
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
