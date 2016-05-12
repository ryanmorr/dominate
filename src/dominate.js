// Create parsing element
const div = document.createElement('div');

export function dominate(html, doc = document) {
    // Parse HTML string
    div.innerHTML = html;
    // Single element
    if (div.firstChild === div.lastChild) {
        return div.removeChild(div.firstChild);
    }
    // Multiple elements
    const frag = doc.createDocumentFragment();
    while (div.firstChild) {
        frag.appendChild(div.firstChild);
    }
    return frag;
}
