/*! dominate v0.1.0 | https://github.com/ryanmorr/dominate */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dominate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = dominate;
// Regex to extract the tag name
var tagNameRe = /<([\w-]+)/;

// Determine if `DOMParser` supports 'text/html'
var supportsDOMParserHTML = function () {
    try {
        if (new DOMParser().parseFromString('', 'text/html')) {
            return true;
        }
    } catch (e) {
        return false;
    }
}();

// Prevent the parser from ignoring certain
// elements by wrapping them with the necessary
// parent elements to appease XHTML compliance
// (courtesy of jQuery: https://github.com/jquery/jquery/blob/master/src/manipulation/wrapMap.js)
var wrapMap = {
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    _default: [0, '', '']
};
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support SVG elements
'circle ellipse g image line path polygon polyline rect text'.split(' ').forEach(function (tag) {
    wrapMap[tag] = [1, '<svg xmlns="http://www.w3.org/2000/svg">', '</svg>'];
});

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
 * @param {String} tag
 * @param {String} html
 * @return {Element}
 * @api private
 */
function parseHTML(doc, tag, html) {
    var el = doc.createElement(tag);
    el.innerHTML = html;
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
        var _el = parseHTML(doc, 'html', html);
        var xml = parseDocument(html, 'text/xml');
        return copyAttributes(_el, xml);
    }
    // Support <body> and <head> elements
    if (tag === 'head' || tag === 'body') {
        var _el2 = parseHTML(doc, 'html', html);
        return _el2.removeChild(tag === 'head' ? _el2.firstChild : _el2.lastChild);
    }
    // Wrap the element in the appropriate container
    var wrap = wrapMap[tag] || wrapMap._default;
    // Parse HTML string
    var el = parseHTML(doc, 'div', wrap[1] + html + wrap[2]);
    // Descend through wrappers to get the right element
    var depth = wrap[0];
    while (depth--) {
        el = el.lastChild;
    }
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
    var tag = match[1].toLowerCase();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGRvbWluYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7a0JDOEp3QixROztBQTdKeEIsSUFBTSxZQUFZLFdBQWxCOzs7QUFHQSxJQUFNLHdCQUF5QixZQUFNO0FBQ2pDLFFBQUk7QUFDQSxZQUFLLElBQUksU0FBSixFQUFELENBQWtCLGVBQWxCLENBQWtDLEVBQWxDLEVBQXNDLFdBQXRDLENBQUosRUFBd0Q7QUFDcEQsbUJBQU8sSUFBUDtBQUNIO0FBQ0osS0FKRCxDQUlFLE9BQU8sQ0FBUCxFQUFVO0FBQ1IsZUFBTyxLQUFQO0FBQ0g7QUFDSixDQVI2QixFQUE5Qjs7Ozs7O0FBY0EsSUFBTSxVQUFVO0FBQ1osV0FBTyxDQUFDLENBQUQsRUFBSSxTQUFKLEVBQWUsVUFBZixDQURLO0FBRVosU0FBSyxDQUFDLENBQUQsRUFBSSxtQkFBSixFQUF5QixxQkFBekIsQ0FGTztBQUdaLFFBQUksQ0FBQyxDQUFELEVBQUksZ0JBQUosRUFBc0Isa0JBQXRCLENBSFE7QUFJWixRQUFJLENBQUMsQ0FBRCxFQUFJLG9CQUFKLEVBQTBCLHVCQUExQixDQUpRO0FBS1osY0FBVSxDQUFDLENBQUQsRUFBSSxFQUFKLEVBQVEsRUFBUjtBQUxFLENBQWhCO0FBT0EsUUFBUSxLQUFSLEdBQWdCLFFBQVEsS0FBUixHQUFnQixRQUFRLFFBQVIsR0FBbUIsUUFBUSxPQUFSLEdBQWtCLFFBQVEsS0FBN0U7QUFDQSxRQUFRLEVBQVIsR0FBYSxRQUFRLEVBQXJCOzs7QUFHQSw4REFBOEQsS0FBOUQsQ0FBb0UsR0FBcEUsRUFBeUUsT0FBekUsQ0FBaUYsVUFBQyxHQUFELEVBQVM7QUFDdEYsWUFBUSxHQUFSLElBQWUsQ0FBQyxDQUFELEVBQUksMENBQUosRUFBZ0QsUUFBaEQsQ0FBZjtBQUNILENBRkQ7Ozs7Ozs7Ozs7QUFZQSxTQUFTLGNB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c291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gUmVnZXggdG8gZXh0cmFjdCB0aGUgdGFnIG5hbWVcclxuY29uc3QgdGFnTmFtZVJlID0gLzwoW1xcdy1dKykvO1xyXG5cclxuLy8gRGV0ZXJtaW5lIGlmIGBET01QYXJzZXJgIHN1cHBvcnRzICd0ZXh0L2h0bWwnXHJcbmNvbnN0IHN1cHBvcnRzRE9NUGFyc2VySFRNTCA9ICgoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGlmICgobmV3IERPTVBhcnNlcigpKS5wYXJzZUZyb21TdHJpbmcoJycsICd0ZXh0L2h0bWwnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59KSgpO1xyXG5cclxuLy8gUHJldmVudCB0aGUgcGFyc2VyIGZyb20gaWdub3JpbmcgY2VydGFpblxyXG4vLyBlbGVtZW50cyBieSB3cmFwcGluZyB0aGVtIHdpdGggdGhlIG5lY2Vzc2FyeVxyXG4vLyBwYXJlbnQgZWxlbWVudHMgdG8gYXBwZWFzZSBYSFRNTCBjb21wbGlhbmNlXHJcbi8vIChjb3VydGVzeSBvZiBqUXVlcnk6IGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2Jsb2IvbWFzdGVyL3NyYy9tYW5pcHVsYXRpb24vd3JhcE1hcC5qcylcclxuY29uc3Qgd3JhcE1hcCA9IHtcclxuICAgIHRoZWFkOiBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXSxcclxuICAgIGNvbDogWzIsICc8dGFibGU+PGNvbGdyb3VwPicsICc8L2NvbGdyb3VwPjwvdGFibGU+J10sXHJcbiAgICB0cjogWzIsICc8dGFibGU+PHRib2R5PicsICc8L3Rib2R5PjwvdGFibGU+J10sXHJcbiAgICB0ZDogWzMsICc8dGFibGU+PHRib2R5Pjx0cj4nLCAnPC90cj48L3Rib2R5PjwvdGFibGU+J10sXHJcbiAgICBfZGVmYXVsdDogWzAsICcnLCAnJ11cclxufTtcclxud3JhcE1hcC50Ym9keSA9IHdyYXBNYXAudGZvb3QgPSB3cmFwTWFwLmNvbGdyb3VwID0gd3JhcE1hcC5jYXB0aW9uID0gd3JhcE1hcC50aGVhZDtcclxud3JhcE1hcC50aCA9IHdyYXBNYXAudGQ7XHJcblxyXG4vLyBTdXBwb3J0IFNWRyBlbGVtZW50c1xyXG4nY2lyY2xlIGVsbGlwc2UgZyBpbWFnZSBsaW5lIHBhdGggcG9seWdvbiBwb2x5bGluZSByZWN0IHRleHQnLnNwbGl0KCcgJykuZm9yRWFjaCgodGFnKSA9PiB7XHJcbiAgICB3cmFwTWFwW3RhZ10gPSBbMSwgJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPicsICc8L3N2Zz4nXTtcclxufSk7XHJcblxyXG4vKipcclxuICogQ29weSB0aGUgYXR0cmlidXRlcyBmcm9tIG9uZSBub2RlIHRvIGFub3RoZXJcclxuICpcclxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIGNvcHlBdHRyaWJ1dGVzKGVsLCB0YXJnZXQpIHtcclxuICAgIGNvbnN0IGF0dHJzID0gdGFyZ2V0LmF0dHJpYnV0ZXM7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gYXR0cnMubGVuZ3RoLCBhdHRyOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBhdHRyID0gYXR0cnNbaV07XHJcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBzY3JpcHQgZWxlbWVudCB0aGF0IHdpbGwgZXhlY3V0ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBkb2NcclxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxyXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIGNvcHlTY3JpcHQoZG9jLCBlbCkge1xyXG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcclxuICAgIHNjcmlwdC50ZXh0ID0gZWwudGV4dENvbnRlbnQ7XHJcbiAgICByZXR1cm4gY29weUF0dHJpYnV0ZXMoc2NyaXB0LCBlbCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZSBIVE1MIGFuZCBYTUwgZG9jdW1lbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBtYXJrdXBcclxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcclxuICogQHJldHVybiB7RWxlbWVudH1cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZURvY3VtZW50KG1hcmt1cCwgdHlwZSkge1xyXG4gICAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xyXG4gICAgY29uc3QgbmV3RG9jID0gcGFyc2VyLnBhcnNlRnJvbVN0cmluZyhtYXJrdXAsIHR5cGUpO1xyXG4gICAgcmV0dXJuIG5ld0RvYy5yZW1vdmVDaGlsZChuZXdEb2MuZG9jdW1lbnRFbGVtZW50KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnNlIEhUTUwgc3RyaW5nIHVzaW5nIHRoZSBwcm9wZXIgcGFyZW50XHJcbiAqIGVsZW1lbnRcclxuICpcclxuICogQHBhcmFtIHtEb2N1bWVudH0gZG9jXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWdcclxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuICogQHJldHVybiB7RWxlbWVudH1cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZUhUTUwoZG9jLCB0YWcsIGh0bWwpIHtcclxuICAgIGNvbnN0IGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQodGFnKTtcclxuICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICByZXR1cm4gZWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZSBhbiBITVRMIHN0cmluZyBpbnRvIGEgRE9NIG5vZGVcclxuICpcclxuICogQHBhcmFtIHtEb2N1bWVudH0gZG9jXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0YWdcclxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuICogQHJldHVybiB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fVxyXG4gKiBAYXBpIHByaXZhdGVcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlKGRvYywgdGFnLCBodG1sKSB7XHJcbiAgICAvLyBTdXBwb3J0IDxodG1sPiBlbGVtZW50c1xyXG4gICAgaWYgKHRhZyA9PT0gJ2h0bWwnKSB7XHJcbiAgICAgICAgaWYgKHN1cHBvcnRzRE9NUGFyc2VySFRNTCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VEb2N1bWVudChodG1sLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEF0dHJpYnV0ZXMgb2YgdGhlIDxodG1sPiBlbGVtZW50IGRvIG5vdCBnZXRcclxuICAgICAgICAvLyBwYXJzZWQgdXNpbmcgYGlubmVySFRNTGAgaGVyZSwgc28gd2UgcGFyc2UgaXRcclxuICAgICAgICAvLyBhcyBYTUwgYW5kIHRoZW4gY29weSB0aGUgYXR0cmlidXRlc1xyXG4gICAgICAgIGNvbnN0IGVsID0gcGFyc2VIVE1MKGRvYywgJ2h0bWwnLCBodG1sKTtcclxuICAgICAgICBjb25zdCB4bWwgPSBwYXJzZURvY3VtZW50KGh0bWwsICd0ZXh0L3htbCcpO1xyXG4gICAgICAgIHJldHVybiBjb3B5QXR0cmlidXRlcyhlbCwgeG1sKTtcclxuICAgIH1cclxuICAgIC8vIFN1cHBvcnQgPGJvZHk+IGFuZCA8aGVhZD4gZWxlbWVudHNcclxuICAgIGlmICh0YWcgPT09ICdoZWFkJyB8fCB0YWcgPT09ICdib2R5Jykge1xyXG4gICAgICAgIGNvbnN0IGVsID0gcGFyc2VIVE1MKGRvYywgJ2h0bWwnLCBodG1sKTtcclxuICAgICAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQodGFnID09PSAnaGVhZCcgPyBlbC5maXJzdENoaWxkIDogZWwubGFzdENoaWxkKTtcclxuICAgIH1cclxuICAgIC8vIFdyYXAgdGhlIGVsZW1lbnQgaW4gdGhlIGFwcHJvcHJpYXRlIGNvbnRhaW5lclxyXG4gICAgY29uc3Qgd3JhcCA9IHdyYXBNYXBbdGFnXSB8fCB3cmFwTWFwLl9kZWZhdWx0O1xyXG4gICAgLy8gUGFyc2UgSFRNTCBzdHJpbmdcclxuICAgIGxldCBlbCA9IHBhcnNlSFRNTChkb2MsICdkaXYnLCB3cmFwWzFdICsgaHRtbCArIHdyYXBbMl0pO1xyXG4gICAgLy8gRGVzY2VuZCB0aHJvdWdoIHdyYXBwZXJzIHRvIGdldCB0aGUgcmlnaHQgZWxlbWVudFxyXG4gICAgbGV0IGRlcHRoID0gd3JhcFswXTtcclxuICAgIHdoaWxlIChkZXB0aC0tKSB7XHJcbiAgICAgICAgZWwgPSBlbC5sYXN0Q2hpbGQ7XHJcbiAgICB9XHJcbiAgICAvLyBTdXBwb3J0IGV4ZWN1dGFibGUgPHNjcmlwdD4gZWxlbWVudHNcclxuICAgIGlmICh0YWcgPT09ICdzY3JpcHQnKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvcHlTY3JpcHQoZG9jLCBlbC5maXJzdENoaWxkKTtcclxuICAgIH1cclxuICAgIC8vIFNpbmdsZSBlbGVtZW50XHJcbiAgICBpZiAoZWwuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCk7XHJcbiAgICB9XHJcbiAgICAvLyBVc2UgYSBkb2N1bWVudCBmcmFnbWVudCBmb3IgbXVsdGlwbGUgZWxlbWVudHNcclxuICAgIGNvbnN0IGZyYWcgPSBkb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICBmcmFnLmFwcGVuZENoaWxkKGVsLmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZyYWc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgc3RyaW5nIGludG8gYSBET00gbm9kZVxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBvcHRpb25zLmNvbnRleHRcclxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMudHlwZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuc2NyaXB0c1xyXG4gKiBAcmV0dXJuIHtFbGVtZW50fFRleHROb2RlfERvY3VtZW50RnJhZ21lbnR9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkb21pbmF0ZShodG1sLCB7Y29udGV4dCA9IGRvY3VtZW50LCB0eXBlID0gJ2h0bWwnLCBzY3JpcHRzID0gdHJ1ZX0gPSB7fSkge1xyXG4gICAgLy8gUmV0dXJuIGFuIFhNTCBlbGVtZW50IGlmIHRoZSB0eXBlIHBhcmFtIGlzICd4bWwnXHJcbiAgICBpZiAodHlwZS50b0xvd2VyQ2FzZSgpID09PSAneG1sJykge1xyXG4gICAgICAgIHJldHVybiBwYXJzZURvY3VtZW50KGh0bWwsICd0ZXh0L3htbCcpO1xyXG4gICAgfVxyXG4gICAgLy8gUGFyc2UgdGhlIEhUTUwgc3RyaW5nIGZvciBhIHRhZyBuYW1lXHJcbiAgICBjb25zdCBtYXRjaCA9IHRhZ05hbWVSZS5leGVjKGh0bWwpO1xyXG4gICAgLy8gSWYgbm8gdGFnIG5hbWUgZXhpc3RzLCB0cmVhdCBpdCBhcyBwbGFpbiB0ZXh0XHJcbiAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbnRleHQuY3JlYXRlVGV4dE5vZGUoaHRtbCk7XHJcbiAgICB9XHJcbiAgICAvLyBHZXQgdGhlIHRhZyBuYW1lXHJcbiAgICBjb25zdCB0YWcgPSBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgLy8gUGFyc2UgdGhlIEhUTUwgc3RyaW5nIGludG8gYSBET00gbm9kZVxyXG4gICAgY29uc3QgZWwgPSBwYXJzZShjb250ZXh0LCB0YWcsIGh0bWwudHJpbSgpKTtcclxuICAgIC8vIElmIGl0J3MgYSBzY3JpcHQgZWxlbWVudCwgcmV0dXJuIGl0IGFzIGl0XHJcbiAgICAvLyBzaG91bGQgYWx3YXlzIGV4ZWN1dGUgcmVnYXJkbGVzcyBvZiB0aGVcclxuICAgIC8vIGBzY3JpcHRzYCBwYXJhbVxyXG4gICAgaWYgKHRhZyA9PT0gJ3NjcmlwdCcpIHtcclxuICAgICAgICByZXR1cm4gZWw7XHJcbiAgICB9XHJcbiAgICAvLyBJZiBgc2NyaXB0c2AgcGFyYW0gaXMgdHJ1ZSwgcmVwbGFjZSBhbGwgc2NyaXB0XHJcbiAgICAvLyBlbGVtZW50cyB3aXRoIGEgbmV3IHNjcmlwdCBlbGVtZW50IHRvIGVuYWJsZVxyXG4gICAgLy8gZXhlY3V0aW9uLCBvdGhlcndpc2UgcmVtb3ZlIHRoZSBzY3JpcHQgZWxlbWVudHNcclxuICAgIGNvbnN0IGVsZW1lbnRzID0gZWwucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0Jyk7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZWxlbWVudHMubGVuZ3RoLCBzY3JpcHQsIHBhcmVudDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgc2NyaXB0ID0gZWxlbWVudHNbaV07XHJcbiAgICAgICAgcGFyZW50ID0gc2NyaXB0LnBhcmVudE5vZGU7XHJcbiAgICAgICAgaWYgKHNjcmlwdHMgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChzY3JpcHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQoY29weVNjcmlwdChjb250ZXh0LCBzY3JpcHQpLCBzY3JpcHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBlbDtcclxufVxyXG4iXX0=
