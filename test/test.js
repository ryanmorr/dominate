import { expect } from 'chai';
import { dominate } from '../src/dominate';

describe('dominate', () => {
    it('should throw error if passed an invalid argument', () => {
        // Invalid input
        [null, undefined, 0 / 0, {}, [], () => {}, /foo/].forEach((val) => {
            const fn = () => dominate(val);
            expect(fn).to.throw(TypeError, 'Invalid input, string/number/boolean expected');
        });
        // Valid input
        ['foo', 123, true].forEach((val) => {
            const fn = () => dominate(val);
            expect(fn).to.not.throw();
        });
    });

    it('should convert plain text, booleans, and numbers to a DOM text node', () => {
        ['foo', 123, true].forEach((val) => {
            const node = dominate(val);
            expect(node.nodeType).to.equal(3);
            expect(node.nodeName.toLowerCase()).to.equal('#text');
            expect(node.nodeValue).to.equal(val + '');
        });
    });

    it('should convert a single element HTML string into a DOM element', () => {
        const el = dominate('<div></div>');
        expect(el.nodeType).to.equal(1);
        expect(el.nodeName.toLowerCase()).to.equal('div');
    });

    it('should convert a multiple element HTML string into a DOM fragment', () => {
        const frag = dominate('<div></div><span></span>');
        expect(frag.nodeType).to.equal(11);
        expect(frag.nodeName.toLowerCase()).to.equal('#document-fragment');
        expect(frag.querySelectorAll('*')).to.have.lengthOf(2);
        expect(frag.querySelectorAll('div')).to.have.lengthOf(1);
        expect(frag.querySelectorAll('span')).to.have.lengthOf(1);
    });
});
