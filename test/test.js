import { expect } from 'chai';
import { jsdom } from 'jsdom';
import { dominate } from '../src/dominate';

describe('dominate', () => {
    it('should throw a type error if passed an invalid argument', () => {
        [null, undefined, {}, [], () => {}, /foo/].forEach((val) => {
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

    it('should support a document object as an optional second argument', () => {
        const doc = jsdom('<html><body></body></html>');
        const el = dominate('<div></div>', doc);
        expect(el.ownerDocument).to.equal(doc);
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

    it('should parse attributes', () => {
        const el = dominate('<div id="foo" class="bar"></div');
        expect(el.id).to.equal('foo');
        expect(el.className).to.equal('bar');
    });

    it('should support td elements', () => {
        const el = dominate('<td></td>');
        expect(el.nodeName.toLowerCase()).to.equal('td');
    });

    it('should support tr elements', () => {
        const el = dominate('<tr></tr>');
        expect(el.nodeName.toLowerCase()).to.equal('tr');
    });

    it('should support th elements', () => {
        const el = dominate('<th></th>');
        expect(el.nodeName.toLowerCase()).to.equal('th');
    });

    it('should support thead elements', () => {
        const el = dominate('<thead></thead>');
        expect(el.nodeName.toLowerCase()).to.equal('thead');
    });

    it('should support tbody elements', () => {
        const el = dominate('<tbody></tbody>');
        expect(el.nodeName.toLowerCase()).to.equal('tbody');
    });

    it('should support thead elements', () => {
        const el = dominate('<thead></thead>');
        expect(el.nodeName.toLowerCase()).to.equal('thead');
    });

    it('should support tfoot elements', () => {
        const el = dominate('<tfoot></tfoot>');
        expect(el.nodeName.toLowerCase()).to.equal('tfoot');
    });

    it('should support col elements', () => {
        const el = dominate('<col></col>');
        expect(el.nodeName.toLowerCase()).to.equal('col');
    });

    it('should support colgroup elements', () => {
        const el = dominate('<colgroup></colgroup>');
        expect(el.nodeName.toLowerCase()).to.equal('colgroup');
    });

    it('should support caption elements', () => {
        const el = dominate('<caption></caption>');
        expect(el.nodeName.toLowerCase()).to.equal('caption');
    });

    it('should support legend elements', () => {
        const el = dominate('<legend></legend>');
        expect(el.nodeName.toLowerCase()).to.equal('legend');
    });
});
