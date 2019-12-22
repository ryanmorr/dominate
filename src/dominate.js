import htm from 'htm';

const html = htm.bind(createElement);

function getNode(node) {
    if (typeof node === 'number') {
        node = String(node);
    }
    return (typeof node === 'string') ? document.createTextNode(node) : node;
}

function createElement(nodeName, attributes, ...children) {
    return document.createElement(nodeName);
}

export default function dom(...args) {
    const result = html(...args);
    if (Array.isArray(result)) {
        if (result.length === 1) {
            return getNode(result[0]);
        }
        const frag = document.createDocumentFragment();
        result.forEach((node) => frag.appendChild(getNode(node)));
        return frag;
    }
    return getNode(result);
}