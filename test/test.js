import { expect } from 'chai';
import { dominate } from '../src/dominate';

describe('dominate', () => {
    it('should throw a type error if passed an invalid argument', () => {
        [null, undefined, 0 / 0, {}, [], () => {}, /foo/].forEach((val) => {
            const fn = () => dominate(val);
            expect(fn).to.throw(TypeError, 'Invalid input, string/number/boolean expected');
        });
    });

    it('should convert a single element HTML string into a DOM element', () => {
        const el = dominate('<div>foo</div>');
        expect(el.nodeType).to.equal(1);
        expect(el.nodeName.toLowerCase()).to.equal('div');
        expect(el.textContent).to.equal('foo');
    });

    it('should convert a multiple element HTML string into a DOM fragment', () => {
        const frag = dominate('<div>foo</div><span>bar</span><em>baz</em>');
        expect(frag.nodeType).to.equal(11);
        expect(frag.nodeName.toLowerCase()).to.equal('#document-fragment');
        expect(frag.querySelectorAll('*')).to.have.lengthOf(3);
        expect(frag.querySelectorAll('div')).to.have.lengthOf(1);
        expect(frag.querySelectorAll('span')).to.have.lengthOf(1);
        expect(frag.querySelectorAll('em')).to.have.lengthOf(1);
        expect(frag.textContent).to.equal('foobarbaz');
    });

    it('should convert plain text to a DOM text node', () => {
        const node = dominate('foo');
        expect(node.nodeType).to.equal(3);
        expect(node.nodeName.toLowerCase()).to.equal('#text');
        expect(node.nodeValue).to.equal('foo');
    });

    it('should ignore leading/trailing whitespace for an HTML string', () => {
        const el = dominate(' <i>foo</i> ');
        expect(el.nodeName.toLowerCase()).to.equal('i');
        expect(el.textContent).to.equal('foo');
    });

    it('should preserve leading/trailing whitespace for plain text', () => {
        const node = dominate(' some random text  ');
        expect(node.nodeName.toLowerCase()).to.equal('#text');
        expect(node.nodeValue).to.equal(' some random text  ');
    });
});
