import htm from 'htm';

const html = htm.bind(createElement);

const EVENTS = [];
for (const prop in document) {
    if (prop.substring(0, 2) === 'on' && (document[prop] === null || typeof document[prop] === 'function')) {
        EVENTS.push(prop);
    }
}

function arrayToFrag(nodes) {
    return nodes.reduce((frag, node) => frag.appendChild(getNode(node)) && frag, document.createDocumentFragment());
}

function getNode(node) {
    if (Array.isArray(node)) {
        return arrayToFrag(node);
    }
    if (typeof node === 'number') {
        node = String(node);
    }
    return (typeof node === 'string') ? document.createTextNode(node) : node;
}

function setAttribute(element, name, value) {
    if (name === 'style') {
        if (typeof value === 'string') {
            element.style.cssText = value;
        } else {
            for (const key in value) {
                const style = value == null || value[key] == null ? '' : value[key];
                if (key[0] === '-') {
                    element.style.setProperty(key, style);
                } else {
                    element.style[key] = style;
                }
            }
        }
    } else if (EVENTS.includes(name)) {
        element.addEventListener(name.slice(2).toLowerCase(), value);
    } else {
        if (value === true) {
            value = '';
        }
        element.setAttribute(name, value);
    }
}

function createElement(nodeName, attributes, ...children) {
    const element = document.createElement(nodeName);
    if (attributes) {
        for (const name in attributes) {
            setAttribute(element, name, attributes[name]);
        }
    }
    if (children) {
        children.forEach((child) => element.appendChild(getNode(child)));
    }
    return element;
}

export default function dom(...args) {
    const result = html(...args);
    if (Array.isArray(result)) {
        if (result.length === 1) {
            return getNode(result[0]);
        }
        return arrayToFrag(result);
    }
    return getNode(result);
}