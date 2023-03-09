import htm from 'htm';

const html = htm.bind(createElement);
const REF_KEY = Symbol('ref');
const RESULT_KEY = Symbol('result');

const SVG_TAGS =  [
    'svg',
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'color-profile',
    'cursor',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'font',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-src',
    'font-face-uri',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'hkern',
    'image',
    'line',
    'linearGradient',
    'marker',
    'mask',
    'metadata',
    'missing-glyph',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'set',
    'stop',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tref',
    'tspan',
    'use',
    'view',
    'vkern'
];

function arrayToFrag(nodes) {
    return nodes.reduce((frag, node) => frag.appendChild(getNode(node)) && frag, document.createDocumentFragment());
}

function getNode(node) {
    if (typeof node === 'object' && RESULT_KEY in node) {
        return node[RESULT_KEY];
    }
    if (Array.isArray(node)) {
        return arrayToFrag(node);
    }
    if (typeof node === 'number') {
        node = String(node);
    }
    return (typeof node === 'string') ? document.createTextNode(node) : node;
}

function setAttribute(element, name, value) {
    if (name === 'ref') {
        element[REF_KEY] = value;
        return;
    }
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
    this[0] = 3; // Disable htm caching
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
        element.appendChild(arrayToFrag(children));
    }
    return element;
}

export default function dominate(...args) {
    let result = html(...args);
    result = Array.isArray(result) ? arrayToFrag(result) : getNode(result);
    if (result.nodeType !== 3) {
        const refs = {};
        [result, ...result.querySelectorAll('*')].forEach((el) => {
            if (REF_KEY in el) {
                refs[el[REF_KEY]] = el;
            }
        });
        const hasRefs = Object.keys(refs).length > 0;
        if (hasRefs) {
            refs[RESULT_KEY] = result;
            return refs;
        }
    }
    return result;
}
