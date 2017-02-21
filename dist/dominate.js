/*! dominate v0.2.1 | https://github.com/ryanmorr/dominate */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dominate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = dominate;
/**
 * Regular expression to extract the tag name
 */
var tagNameRe = /<([\w-]+)/;

/**
 * Check if the browser supports the <template> element
 */
var supportsTemplate = 'content' in document.createElement('template');

/**
 * Determine if `DOMParser` supports 'text/html'
 */
var supportsDOMParserHTML = function () {
    try {
        if (new DOMParser().parseFromString('', 'text/html')) {
            return true;
        }
    } catch (e) {
        return false;
    }
}();

/**
 * Prevent the parser from ignoring certain
 * elements by wrapping them with the necessary
 * parent elements to appease XHTML compliance
 * courtesy of jQuery: https://github.com/jquery/jquery/blob/master/src/manipulation/wrapMap.js
 */
var wrapMap = {
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    _default: [0, '', '']
};
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

/**
 * SVG elements
 */
var svgTags = ['animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'defs', 'desc', 'ellipse', 'foreignObject', 'filter', 'g', 'gradient', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use', 'view'];

/**
 * Add wrap to support SVG elements
 */
var svgWrap = [1, '<svg xmlns="http://www.w3.org/2000/svg">', '</svg>'];
svgTags.reduce(function (wrap, tag) {
    return wrapMap[tag] = wrap;
}, svgWrap);

/**
 * Is the tag an SVG tag
 *
 * @param {String} tag
 * @return {Boolean}
 * @api private
 */
function isSVG(tag) {
    return svgTags.indexOf(tag) !== -1;
}

/**
 * Copy the attributes from one node to another
 *
 * @param {Element} el
 * @param {Element} target
 * @return {Element}
 * @api private
 */
function copyAttributes(el, target) {
    var attrs = target.attributes;
    for (var i = 0, len = attrs.length, attr; i < len; i++) {
        attr = attrs[i];
        el.setAttribute(attr.name, attr.value);
    }
    return el;
}

/**
 * Create a script element that will execute
 *
 * @param {Document} doc
 * @param {Element} el
 * @return {Element}
 * @api private
 */
function copyScript(doc, el) {
    var script = doc.createElement('script');
    script.async = true;
    script.text = el.textContent;
    return copyAttributes(script, el);
}

/**
 * Parse HTML and XML documents
 *
 * @param {String} markup
 * @param {String} type
 * @return {Element}
 * @api private
 */
function parseDocument(markup, type) {
    var parser = new DOMParser();
    var newDoc = parser.parseFromString(markup, type);
    return newDoc.removeChild(newDoc.documentElement);
}

/**
 * Parse HTML string using the proper parent
 * element
 *
 * @param {Document} doc
 * @param {String} html
 * @param {String} tag
 * @return {Element}
 * @api private
 */
function parseHTML(doc, html) {
    var tag = arguments.length <= 2 || arguments[2] === undefined ? 'div' : arguments[2];

    var el = doc.createElement(tag);
    el.innerHTML = html;
    return el;
}

/**
 * Parse HTML elements
 *
 * @param {Document} doc
 * @param {String} tag
 * @param {String} html
 * @return {Element}
 * @api private
 */
function parseElements(doc, tag, html) {
    // Use the <template> element if it is supported and
    // the tag is not an SVG element
    if (supportsTemplate && !isSVG(tag)) {
        // Create a template element to parse the HTML string
        var template = doc.createElement('template');
        template.innerHTML = html;
        // Clone and return the document fragment within
        // the template
        return doc.importNode(template.content, true);
    }
    // Wrap the element in the appropriate container
    var wrap = wrapMap[tag] || wrapMap._default;
    // Parse HTML string
    var el = parseHTML(doc, wrap[1] + html + wrap[2]);
    // Descend through wrappers to get the right element
    var depth = wrap[0];
    while (depth--) {
        el = el.lastChild;
    }
    return el;
}

/**
 * Parse an HMTL string into a DOM node
 *
 * @param {Document} doc
 * @param {String} tag
 * @param {String} html
 * @return {Element|DocumentFragment}
 * @api private
 */
function parse(doc, tag, html) {
    // Support <html> elements
    if (tag === 'html') {
        if (supportsDOMParserHTML) {
            return parseDocument(html, 'text/html');
        }
        // Attributes of the <html> element do not get
        // parsed using `innerHTML` here, so we parse it
        // as XML and then copy the attributes
        var _el = parseHTML(doc, html, 'html');
        var xml = parseDocument(html, 'text/xml');
        return copyAttributes(_el, xml);
    }
    // Support <body> and <head> elements
    if (tag === 'head' || tag === 'body') {
        var _el2 = parseHTML(doc, html, 'html');
        return _el2.removeChild(tag === 'head' ? _el2.firstChild : _el2.lastChild);
    }
    // Support every other element
    var el = parseElements(doc, tag, html);
    // Support executable <script> elements
    if (tag === 'script') {
        return copyScript(doc, el.firstChild);
    }
    // Single element
    if (el.childNodes.length === 1) {
        return el.removeChild(el.firstChild);
    }
    // Use a document fragment for multiple elements
    var frag = doc.createDocumentFragment();
    while (el.firstChild) {
        frag.appendChild(el.firstChild);
    }
    return frag;
}

/**
 * Convert a string into a DOM node
 *
 * @param {String} html
 * @param {Object} options
 * @param {Document} options.context
 * @param {String} options.type
 * @param {Boolean} options.scripts
 * @return {Element|TextNode|DocumentFragment}
 * @api public
 */
function dominate(html) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$context = _ref.context;
    var context = _ref$context === undefined ? document : _ref$context;
    var _ref$type = _ref.type;
    var type = _ref$type === undefined ? 'html' : _ref$type;
    var _ref$scripts = _ref.scripts;
    var scripts = _ref$scripts === undefined ? true : _ref$scripts;

    // Return an XML element if the type param is 'xml'
    if (type.toLowerCase() === 'xml') {
        return parseDocument(html, 'text/xml');
    }
    // Parse the HTML string for a tag name
    var match = tagNameRe.exec(html);
    // If no tag name exists, treat it as plain text
    if (!match) {
        return context.createTextNode(html);
    }
    // Get the tag name
    var tag = match[1];
    // Parse the HTML string into a DOM node
    var el = parse(context, tag, html.trim());
    // If it's a script element, return it as it
    // should always execute regardless of the
    // `scripts` param
    if (tag === 'script') {
        return el;
    }
    // If `scripts` param is true, replace all script
    // elements with a new script element to enable
    // execution, otherwise remove the script elements
    var elements = el.querySelectorAll('script');
    for (var i = 0, len = elements.length, script, parent; i < len; i++) {
        script = elements[i];
        parent = script.parentNode;
        if (scripts === false) {
            parent.removeChild(script);
        } else {
            parent.replaceChild(copyScript(context, script), script);
        }
    }
    return el;
}
module.exports = exports['default'];

},{}]},{},[1])(1)
});

