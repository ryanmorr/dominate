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

    it('should support self-closing tags', () => {
        const el1 = dominate`<div />`;
        const el2 = dominate`<div/>`;

        expect(el1.outerHTML).to.equal('<div></div>');
        expect(el2.outerHTML).to.equal('<div></div>');
    });

    it('should support auto-closing tags', () => {
        const el = dominate`<div><//>`;

        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should support dynamic tag names', () => {
        const el = dominate`<${'div'} />`;

        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should support a boolean attribute', () => {
        const el = dominate`<input disabled />`;

        expect(el.disabled).to.equal(true);
        expect(el.outerHTML).to.equal('<input disabled="">');
    });

    it('should support multiple boolean attributes', () => {
        const el = dominate`<input disabled required />`;

        expect(el.disabled).to.equal(true);
        expect(el.required).to.equal(true);
        expect(el.outerHTML).to.equal('<input disabled="" required="">');
    });

    it('should support an attribute with a static value', () => {
        const el = dominate`<div id="foo"></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support an attribute with a static value followed by a boolean attribute', () => {
        const el = dominate`<input type="checkbox" checked />`;

        expect(el.checked).to.equal(true);
        expect(el.outerHTML).to.equal('<input type="checkbox" checked="">');
    });

    it('should support multiple attributes with a static value', () => {
        const el = dominate`<div id="foo" class="bar"></div>`;

        expect(el.outerHTML).to.equal('<div id="foo" class="bar"></div>');
    });

    it('should support an attribute with an empty value', () => {
        const el = dominate`<div id=""></div>`;

        expect(el.outerHTML).to.equal('<div id=""></div>');
    });

    it('should support multiple attributes with empty values', () => {
        const el = dominate`<div id="" class=""></div>`;

        expect(el.outerHTML).to.equal('<div id="" class=""></div>');
    });

    it('should support an attribute with a dyanmic value', () => {
        const el = dominate`<div id=${'foo'}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support multiple attributes with a dynamic value', () => {
        const el = dominate`<div id=${'foo'} class=${'bar'}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo" class="bar"></div>');
    });

    it('should support an attribute with a quoted dynamic value', () => {
        let el = dominate`<div id="${'foo'}"></div>`;
        expect(el.outerHTML).to.equal('<div id="foo"></div>');

        // eslint-disable-next-line quotes
        el = dominate`<div id='${"foo"}'></div>`;
        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support hyphens in attribute names', () => {
        const el = dominate`<div data-foo="bar"></div>`;

        expect(el.dataset.foo).to.equal('bar');
        expect(el.outerHTML).to.equal('<div data-foo="bar"></div>');
    });

    it('should support NUL characters in attribute values', () => {
        const el = dominate`<div id="\0"></div>`;

        expect(el.outerHTML).to.equal('<div id="\0"></div>');
    });

    it('should support CSS styles as a key/value map', () => {
        const el = dominate`<div style=${{width: '100px', height: '100px'}}></div>`;

        expect(el.outerHTML).to.equal('<div style="width: 100px; height: 100px;"></div>');
    });

    it('should support CSS styles as a string', () => {
        const el = dominate`<div style=${'background-color: rgb(20, 20, 20); position: static;'}></div>`;

        expect(el.outerHTML).to.equal('<div style="background-color: rgb(20, 20, 20); position: static;"></div>');
    });

    it('should support CSS variables', () => {
        const el = dominate`<div style=${{color: 'var(--color)', '--color': 'red'}}></div>`;
        document.body.appendChild(el);

        expect(el.style.color).to.equal('var(--color)');
        expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(255, 0, 0)');
        expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('red');
        expect(el.outerHTML).to.equal('<div style="color: var(--color); --color:red;"></div>');
        document.body.removeChild(el);
    });

    it('should support DOM properties', () => {
        const el = dominate`<input type="text" value="foo" />`;

        expect(el.value).to.equal('foo');
    });

    it('should support spread attributes', () => {
        let el = dominate`<div ...${{ id: 'foo' }}></div>`;
        expect(el.outerHTML).to.equal('<div id="foo"></div>');

        el = dominate`<div a ...${{ id: 'foo' }}></div>`;
        expect(el.outerHTML).to.equal('<div a="" id="foo"></div>');

        el = dominate`<div a b ...${{ id: 'foo' }}></div>`;
        expect(el.outerHTML).to.equal('<div a="" b="" id="foo"></div>');

        el = dominate`<div ...${{ id: 'foo' }} a></div>`;
        expect(el.outerHTML).to.equal('<div id="foo" a=""></div>');

        el = dominate`<div ...${{ id: 'foo' }} a b></div>`;
        expect(el.outerHTML).to.equal('<div id="foo" a="" b=""></div>');

        el = dominate`<div a="1" ...${{ id: 'foo' }}></div>`;
        expect(el.outerHTML).to.equal('<div a="1" id="foo"></div>');

        el = dominate`<div a="1"><span b="2" ...${{ c: '3' }}/></div>`;
        expect(el.outerHTML).to.equal('<div a="1"><span b="2" c="3"></span></div>');

        el = dominate`<div a=${1} ...${{ b: 2 }}>c: ${3}</div>`;
        expect(el.outerHTML).to.equal('<div a="1" b="2">c: 3</div>');

        el = dominate`<div ...${{ a: '1' }}><span ...${{ b: '2' }}/></div>`;
        expect(el.outerHTML).to.equal('<div a="1"><span b="2"></span></div>');
    });

    it('should support multiple spread attributes in one element', () => {
        const el = dominate`<div ...${{ id: 'foo' }} ...${{ class: 'bar' }}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo" class="bar"></div>');
    });

    it('should not mutate the spread variables', () => {
        const obj = {};
        dominate`<div ...${obj}></div>`;

        expect(obj).to.deep.equal({});
    });
});
