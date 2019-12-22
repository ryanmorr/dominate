import dominate from '../../src/dominate';

describe('dominate', () => {
    it('should support a single root element', () => {
        const el = dominate`<div></div>`;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
        expect(el.ownerDocument).to.equal(document);
    });

    it('should support a root text node', () => {
        const node = dominate`foo`;

        expect(node.nodeType).to.equal(3);
        expect(node.nodeName.toLowerCase()).to.equal('#text');
        expect(node.nodeValue).to.equal('foo');
        expect(node.ownerDocument).to.equal(document);
    });

    it('should support multiple root elements by returning a document fragment', () => {
        const frag = dominate`<div></div><span></span>`;

        expect(frag.nodeType).to.equal(11);
        expect(frag.childNodes.length).to.equal(2);
        expect(frag.childNodes[0].outerHTML).to.equal('<div></div>');
        expect(frag.childNodes[1].outerHTML).to.equal('<span></span>');
        expect(frag.ownerDocument).to.equal(document);
    });

    it('should support a mix of multiple root elements and text nodes', () => {
        const frag = dominate`foo<div></div>bar`;

        expect(frag.nodeType).to.equal(11);
        expect(frag.childNodes.length).to.equal(3);
        expect(frag.childNodes[0].nodeValue).to.equal('foo');
        expect(frag.childNodes[1].outerHTML).to.equal('<div></div>');
        expect(frag.childNodes[2].nodeValue).to.equal('bar');
    });
});
