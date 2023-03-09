# dominate

[![Version Badge][version-image]][project-url]
[![License][license-image]][license-url]
[![Build Status][build-image]][build-url]

> Declarative DOM building

## Install

Download the [CJS](https://github.com/ryanmorr/dominate/raw/master/dist/cjs/dominate.js), [ESM](https://github.com/ryanmorr/dominate/raw/master/dist/esm/dominate.js), [UMD](https://github.com/ryanmorr/dominate/raw/master/dist/umd/dominate.js) versions or install via NPM:

``` sh
npm install @ryanmorr/dominate
```

## Usage

Import the library:

``` javascript
import dominate from '@ryanmorr/dominate';
```

Convert a single element HTML string into a DOM element:

``` javascript
const div = dominate`<div></div>`;
```

Convert multiple elements into a document fragment:

``` javascript
const fragment = dominate`<div></div><span></span>`;
```

Convert plain text to a DOM text node:

``` javascript
const text = dominate`This is plain text.`;
```

Supports self-closing and auto-closing tags:

``` javascript
const div = dominate`<div />`;
const span = dominate`<span><//>`;
```

Set attributes:

``` javascript
const div = dominate`<div id="foo" class=${'bar'} />`;
```

Set the class with an array or object:

``` javascript
const div = dominate`<div class=${['foo', 'bar', 'baz']}></div>`;
const span = dominate`<span class=${{foo: true, bar: false, baz: true}}></span>`;
```

Set CSS styles as a string or an object:

``` javascript
const div = dominate`<div style=${{width: '100px', height: '100px'}}></div>`;
const span = dominate`<span style=${'color: red; position: static;'}></span>`;
```

Add event listeners:

``` javascript
const div = dominate`<div onclick=${(e) => console.log('clicked!')}></div>`;
```

Inject DOM nodes:

``` javascript
const div = dominate`<div>${dominate`<span />`}</div>`;
```

Supports SVG elements:

``` javascript
const rect = dominate`<rect x="10" y="10" width="100" height="100"/>`;
```

Supports functional components:

``` javascript
const Component = (attributes, children) => {
    return dominate`<div ...${attributes}>${children}</div>`
};

const div = dominate`<${Component} id="foo">bar<//>`;
```

Can return multiple element references via the `ref` attribute:

``` javascript
const { foo, bar, baz } = dominate`
    <div ref="foo">
        <span ref="bar"></span>
        <em ref="baz"></em>
    </div>
`;
```

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/dominate
[version-image]: https://img.shields.io/github/package-json/v/ryanmorr/dominate?color=blue&style=flat-square
[build-url]: https://github.com/ryanmorr/dominate/actions
[build-image]: https://img.shields.io/github/actions/workflow/status/ryanmorr/dominate/node.js.yml?style=flat-square
[license-image]: https://img.shields.io/github/license/ryanmorr/dominate?color=blue&style=flat-square
[license-url]: UNLICENSE