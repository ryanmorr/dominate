import { expect } from 'chai';
import dominate from '../../src/dominate';

describe('dominate (XML)', () => {
    it('should support XML elements', () => {
        const el = dominate('<name>foo</name>', {type: 'xml'});
        expect(el.nodeType).to.equal(1);
        expect(el.nodeName.toLowerCase()).to.equal('name');
        expect(el.textContent).to.equal('foo');
        expect(el).to.be.an.instanceof(Element);
        expect(el).to.not.be.an.instanceof(HTMLElement);
    });

    it('should support XML elements with attributes', () => {
        const el = dominate('<name id="foo" class="bar"></name>', {type: 'xml'});
        expect(el.getAttribute('id')).to.equal('foo');
        expect(el.getAttribute('class')).to.equal('bar');
    });

    it('should return an XML element with no parent node', () => {
        const el = dominate('<name>foo</name>', {type: 'xml'});
        expect(el.parentNode).to.equal(null);
    });
});
