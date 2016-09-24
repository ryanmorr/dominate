import { expect } from 'chai';
import dominate from '../../src/dominate';

describe('SVG', () => {
    const toString = {}.toString;

    const tags = [
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
        'switch',
        'symbol',
        'text',
        'textPath',
        'tref',
        'tspan',
        'use',
        'view'
    ];

    tags.forEach((tag) => {
        it(`should support ${tag} elements`, () => {
            const el = dominate(`<${tag}></${tag}>`);
            expect(el.nodeName.toLowerCase()).to.equal(tag.toLowerCase());
            expect(el.namespaceURI).to.equal('http://www.w3.org/2000/svg');
            expect(toString.call(el)).to.match(/^\[object SVG\w*Element\]$/);
        });

        it(`should support ${tag} elements with attributes`, () => {
            const el = dominate(`<${tag} id="foo" class="bar"></${tag}>`);
            expect(el.getAttribute('id')).to.equal('foo');
            expect(el.getAttribute('class')).to.equal('bar');
        });

        it(`should return a ${tag} element with no parent node`, () => {
            const el = dominate(`<${tag}></${tag}>`);
            expect(el.parentNode).to.equal(null);
        });
    });
});
