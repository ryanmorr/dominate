import htm from 'htm';

const html = htm.bind(createElement);

const SVG_TAGS = [
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'defs',
    'desc',
    'ellipse',
    'foreignObject',
    'filter',
    'g',
    'gradient',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'set',
    'stop',
    'svg',
    'switch',
    'symbol',
    'text',
    'textPath',
    'tref',
    'tspan',
    'use',
    'view'
];

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
    } else if (name.substring(0, 2) === 'on' && typeof value === 'function') {
        element.addEventListener(name.slice(2).toLowerCase(), value);
    } else {
        if (value === true) {
            value = '';
        }
        element.setAttribute(name, value);
    }
}

function createElement(nodeName, attributes, ...children) {
    if (typeof nodeName === 'function') {
        return nodeName(attributes, children);
    }
    const element = SVG_TAGS.includes(nodeName)
        ? document.createElementNS('http://www.w3.org/2000/svg', nodeName)
        : document.createElement(nodeName);
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

export default function dominate(...args) {
    let result = html(...args);
    if (Array.isArray(result)) {
        if (result.length > 1) {
            return arrayToFrag(result);
        }
        result = result[0];
    }
    return getNode(result);
}