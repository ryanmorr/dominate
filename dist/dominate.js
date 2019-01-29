/*! @ryanmorr/dominate v0.3.1 | https://github.com/ryanmorr/dominate */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ryanmorrdominate = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dominate;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
 * Are the passed arguments a result of a
 * tagged template literal invocation
 *
 * @param {Arguments} args
 * @return {Boolean}
 * @api private
 */


function isTaggedTemplate(args) {
  if (!args || _typeof(args) !== 'object') {
    return false;
  }

  var strings = args[0];
  return strings && Array.isArray(strings) && Array.isArray(strings.raw) && typeof strings[0] === 'string' && typeof strings.raw[0] === 'string' || false;
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
  var tag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'div';
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
  if (supportsTemplate && !isSVG(tag)) {
    var template = doc.createElement('template');
    template.innerHTML = html;
    return doc.importNode(template.content, true);
  }

  var wrap = wrapMap[tag] || wrapMap._default;
  var el = parseHTML(doc, wrap[1] + html + wrap[2]);
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
  if (tag === 'html') {
    if (supportsDOMParserHTML) {
      return parseDocument(html, 'text/html');
    }

    var _el = parseHTML(doc, html, 'html');

    var xml = parseDocument(html, 'text/xml');
    return copyAttributes(_el, xml);
  }

  if (tag === 'head' || tag === 'body') {
    var _el2 = parseHTML(doc, html, 'html');

    return _el2.removeChild(tag === 'head' ? _el2.firstChild : _el2.lastChild);
  }

  var el = parseElements(doc, tag, html);

  if (tag === 'script') {
    return copyScript(doc, el.firstChild);
  }

  if (el.childNodes.length === 1) {
    return el.removeChild(el.firstChild);
  }

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
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$context = _ref.context,
      context = _ref$context === void 0 ? document : _ref$context,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? 'html' : _ref$type,
      _ref$scripts = _ref.scripts,
      scripts = _ref$scripts === void 0 ? true : _ref$scripts;

  if (isTaggedTemplate(arguments)) {
    var _arguments = Array.prototype.slice.call(arguments),
        strings = _arguments[0],
        values = _arguments.slice(1);

    return dominate(strings.raw.reduce(function (acc, str, i) {
      return acc + values[i - 1].join('') + str;
    }));
  }

  if (type.toLowerCase() === 'xml') {
    return parseDocument(html, 'text/xml');
  }

  var match = tagNameRe.exec(html);

  if (!match) {
    return context.createTextNode(html);
  }

  var tag = match[1];
  var el = parse(context, tag, html.trim());

  if (tag === 'script') {
    return el;
  }

  Array.from(el.querySelectorAll('script')).forEach(function (script) {
    var parent = script.parentNode;

    if (scripts === false) {
      parent.removeChild(script);
    } else {
      parent.replaceChild(copyScript(context, script), script);
    }
  });
  return el;
}

module.exports = exports.default;

},{}]},{},[1])(1)
});

