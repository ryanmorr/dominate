import dominate from '../../src/dominate';
import { type } from '../setup';

describe('dominate', () => {
    it('should convert a single element HTML string into a DOM element', () => {
        const el = dominate('<div>foo</div>');
        expect(el.nodeType).to.equal(1);
        expect(el.nodeName.toLowerCase()).to.equal('div');
        expect(type(el)).to.equal('HTMLDivElement');
        expect(el.textContent).to.equal('foo');
        expect(el.ownerDocument).to.equal(document);
    });

    it('should convert a multiple element HTML string into a DOM fragment', () => {
        const frag = dominate('<div>foo</div><span>bar</span><em>baz</em>');
        expect(frag.nodeType).to.equal(11);
        expect(frag.nodeName.toLowerCase()).to.equal('#document-fragment');
        expect(type(frag)).to.equal('DocumentFragment');
        expect(frag.querySelectorAll('*')).to.have.lengthOf(3);
        expect(frag.querySelectorAll('div')).to.have.lengthOf(1);
        expect(frag.querySelectorAll('span')).to.have.lengthOf(1);
        expect(frag.querySelectorAll('em')).to.have.lengthOf(1);
        expect(frag.textContent).to.equal('foobarbaz');
        expect(frag.ownerDocument).to.equal(document);
    });

    it('should convert plain text to a DOM text node', () => {
        const node = dominate('foo');
        expect(node.nodeType).to.equal(3);
        expect(node.nodeName.toLowerCase()).to.equal('#text');
        expect(type(node)).to.equal('Text');
        expect(node.nodeValue).to.equal('foo');
        expect(node.ownerDocument).to.equal(document);
    });

    it('should support a document object provided via the `context` option', () => {
        const context = document.implementation.createHTMLDocument('');
        const el = dominate('<div></div>', {context});
        expect(el.ownerDocument).to.equal(context);
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

    it('should support tagged template literal invocation', () => {
        const items = ['foo', 'bar', 'baz'];
        const el = dominate`
            <div>
                <ul>
                    ${items.map(item => `<li>${item}</li>`)}
                </ul>
            </div>
        `;
        expect(el.nodeType).to.equal(1);
        expect(el.nodeName.toLowerCase()).to.equal('div');
        Array.from(el.querySelectorAll('li'), (li, i) => {
            expect(li.textContent).to.equal(items[i]);
        });
    });
});
