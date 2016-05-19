import { expect } from 'chai';
import dominate from '../../src/dominate';

describe('dominate (SVG)', () => {
    const toString = {}.toString;

    const tags = [
        'circle',
        'ellipse',
        'g',
        'image',
        'line',
        'path',
        'polygon',
        'polyline',
        'rect',
        'text'
    ];

    tags.forEach((tag) => {
        it(`should support ${tag} elements`, () => {
            const el = dominate(`<${tag}></${tag}>`);
            expect(el.nodeName.toLowerCase()).to.equal(tag);
            expect(toString.call(el)).to.match(/^\[object SVG\w+Element\]$/);
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
