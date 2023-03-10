import htm from 'htm';

const html = htm.bind(createElement);

const REF_KEY = Symbol('ref');
const RESULT_KEY = Symbol('result');
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
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

function createClass(obj) {
    let output = '';
    if (typeof obj === 'string') {
        return obj;
    }
    if (Array.isArray(obj) && obj.length > 0) {
        for (let i = 0, len = obj.length, tmp; i < len; i++) {
            if ((tmp = createClass(obj[i])) !== '') {
                output += (output && ' ') + tmp;
            }
        }
    } else {
        for (const cls in obj) {
            if (obj[cls]) {
                output += (output && ' ') + cls;
            }
        }
    }
    return output;
}

function arrayToFrag(nodes) {
    return nodes.filter((node) => {
        return node != null && typeof node !== 'boolean';
    }).reduce((frag, node) => {
        frag.appendChild(getNode(node));
        return frag;
    }, document.createDocumentFragment());
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
    if (typeof node === 'string') {
        return document.createTextNode(node);
    }
    return node;
}

function setStyle(element, name, value) {
    if (name.includes('-')) {
        element.style.setProperty(name, value == null ? '' : value);
    } else if (value == null) {
        element.style[name] = '';
    } else if (typeof value != 'number' || IS_NON_DIMENSIONAL.test(name)) {
        element.style[name] = value;
    } else {
        element.style[name] = value + 'px';
    }
}

function setAttribute(element, name, value, isSvg) {
    if (name === 'ref') {
        element[REF_KEY] = value;
        return;
    }
    if (!isSvg && (name === 'class' || name === 'className')) {
		element.className = createClass(value);
    } else if (name === 'style') {
        if (typeof value === 'string') {
            element.style.cssText = value;
        } else if (value) {
            for (const key in value) {
                setStyle(element, key, value[key]);
            }
        }
    } else if (name.startsWith('on') && typeof value === 'function') {
        name = (name.toLowerCase() in element) ? name.toLowerCase().slice(2) : name.slice(2);
        element.addEventListener(name, value);
    } else {
        if (
            !isSvg &&
			name !== 'width' &&
			name !== 'height' &&
			name !== 'href' &&
			name !== 'list' &&
			name !== 'form' &&
			name !== 'tabIndex' &&
			name !== 'download' &&
			name in element
		) {
			try {
				element[name] = value == null ? '' : value;
				return;
			} catch (e) {} // eslint-disable-line no-empty
		}
		if (value != null && (value !== false || name.indexOf('-') != -1)) {
			element.setAttribute(name, value);
		}
    }
}

function createElement(nodeName, attributes, ...children) {
    this[0] = 3; // Disable htm caching
    if (typeof nodeName === 'function') {
        return nodeName(attributes, children);
    }
    const isSvg = SVG_TAGS.includes(nodeName);
    const element = isSvg
        ? document.createElementNS('http://www.w3.org/2000/svg', nodeName)
        : document.createElement(nodeName);
    if (attributes) {
        for (const name in attributes) {
            setAttribute(element, name, attributes[name], isSvg);
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
