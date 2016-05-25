# dominate [![Build Status](https://travis-ci.org/ryanmorr/dominate.svg)](https://travis-ci.org/ryanmorr/dominate)

> Convert HTML, SVG, and XML markup strings into DOM objects.

## Usage

Convert a single element HTML string into a DOM element:

``` javascript
const div = dominate('<div>foo</div>');
console.log(div.nodeName); // DIV
```

Convert a multiple element HTML string into a document fragment:

``` javascript
const frag = dominate('<strong>Hello</strong> <em>World</em>');
console.log(frag.nodeName); // #document-fragment
```

Convert plain text to a DOM text node:

``` javascript
const text = dominate('This is plain text.');
console.log(text.nodeName); // #text
```

Convert an SVG element into a DOM element:

``` javascript
const rect = dominate('<rect x="10" y="10" width="100" height="100"/>');
console.log(rect.nodeName); // RECT
```

Executes script tags within an HTML string by default:

``` javascript
const script = dominate('<script>console.log("foo");</script>');
document.body.appendChild(script); // console outputs "foo"
```

Remove script tags to prevent execution:

``` javascript
const el = dominate('<section><script src="foo.js"></script></section>', {scripts: false});
const script = el.querySelector('script'); // null
```

Use a custom document instead of the default (`window.document`)

``` javascript
import { jsdom } from 'jsdom';
const doc = jsdom('<html><body></body></html>');
const el = dominate('<div></div>', {context: doc});
console.log(el.ownerDocument === doc); // true
```

Convert XML string into a DOM element:

``` javascript
const xml = dominate('<name>foo</name>', {type: 'xml'});
console.log(xml instanceof Element); // true
console.log(xml instanceof HTMLElement); // false
```

## Installation

Dominate is [CommonJS](http://www.commonjs.org/) and [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) compatible with no dependencies. You can download the [development](http://github.com/ryanmorr/dominate/raw/master/dist/dominate.js) or [minified](http://github.com/ryanmorr/dominate/raw/master/dist/dominate.min.js) version, or install it in one of the following ways:

``` sh
npm install ryanmorr/dominate

bower install ryanmorr/dominate
```

## Tests

Open `test/runner.html` in your browser or test with PhantomJS by issuing the following commands:

``` sh
npm install
npm install -g gulp
gulp test
```

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).