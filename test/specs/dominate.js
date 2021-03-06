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

    it('should support an attribute with a static value', () => {
        const el = dominate`<div id="foo"></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support an attribute with an empty value', () => {
        const el = dominate`<div id=""></div>`;

        expect(el.outerHTML).to.equal('<div id=""></div>');
    });

    it('should support an attribute with a dyanmic value', () => {
        const el = dominate`<div id=${'foo'}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support an attribute with a quoted dynamic value', () => {
        let el = dominate`<div id="${'foo'}"></div>`;
        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support hyphens in attribute names', () => {
        const el = dominate`<div data-foo="bar"></div>`;

        expect(el.dataset.foo).to.equal('bar');
        expect(el.outerHTML).to.equal('<div data-foo="bar"></div>');
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
        let el = dominate`<div ...${{ id: 'foo', class: 'bar' }}></div>`;
        expect(el.outerHTML).to.equal('<div id="foo" class="bar"></div>');
    });

    it('should support event listeners', (done) => {
        const event = new MouseEvent('click');
        const onClick = (e) => {
            expect(e).to.equal(event);
            document.body.removeChild(el);
            done();
        };

        const el = dominate`<div onclick=${onClick}></div>`;
        document.body.appendChild(el);
        el.dispatchEvent(event);
    });

    it('should support custom events', (done) => {
        let event = new CustomEvent('foo');

        const callback = sinon.spy((e) => {
            expect(e).to.equal(event);
            document.body.removeChild(el);
            done();
        });

        const el = dominate`<div onfoo=${callback}></div>`;
        document.body.appendChild(el);
        el.dispatchEvent(event);
    });

    it('should support a child text node', () => {
        const el = dominate`<div>foo</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should support NUL characters in a child text node', () => {
        let el = dominate`<div>\0</div>`;
        expect(el.outerHTML).to.equal('<div>\0</div>');

        el = dominate`<div>\0${'foo'}</div>`;
        expect(el.outerHTML).to.equal('<div>\0foo</div>');
    });

    it('should support a child element', () => {
        let el = dominate`<div><span /></div>`;
        expect(el.outerHTML).to.equal('<div><span></span></div>');

        el = dominate`<div><span></span></div>`;
        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should support multiple element children', () => {
        let el = dominate`<div><span /><em /><p></p></div>`;
        expect(el.outerHTML).to.equal('<div><span></span><em></em><p></p></div>');

        el = dominate`<div a><span b /><em c /></div>`;
        expect(el.outerHTML).to.equal('<div a=""><span b=""></span><em c=""></em></div>');

        el = dominate`<div x=1><span y=2 /><em z=3 /></div>`;
        expect(el.outerHTML).to.equal('<div x="1"><span y="2"></span><em z="3"></em></div>');

        el = dominate`<div x=${1}><span y=${2} /><em z=${3} /></div>`;
        expect(el.outerHTML).to.equal('<div x="1"><span y="2"></span><em z="3"></em></div>');
    });

    it('should support a dynamic text node', () => {
        const el = dominate`<div>${'foo'}</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should support a dynamic element', () => {
        let el = dominate`<div>${document.createElement('span')}</div>`;
        expect(el.outerHTML).to.equal('<div><span></span></div>');

        el = dominate`<div>${dominate`<span></span>`}</div>`;
        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should escape HTML characters', () => {
        const el = dominate`<div>${'<i id="foo" class=\'bar\'>bar</i>'}</div>`;

        expect(el.outerHTML).to.equal('<div>&lt;i id="foo" class=\'bar\'&gt;bar&lt;/i&gt;</div>');
    });

    it('should support mixed type children', () => {
        let el = dominate`<div>${'foo'}bar</div>`;
        expect(el.outerHTML).to.equal('<div>foobar</div>');

        el = dominate`<div>before${'foo'}after</div>`;
        expect(el.outerHTML).to.equal('<div>beforefooafter</div>');

        el = dominate`<div>foo<span /></div>`;
        expect(el.outerHTML).to.equal('<div>foo<span></span></div>');

        el = dominate`<div><span />foo</div>`;
        expect(el.outerHTML).to.equal('<div><span></span>foo</div>');

        el = dominate`<div>foo<span />bar</div>`;
        expect(el.outerHTML).to.equal('<div>foo<span></span>bar</div>');

        el = dominate`<div>foo<span a="b" /></div>`;
        expect(el.outerHTML).to.equal('<div>foo<span a="b"></span></div>');

        el = dominate`<div>before${document.createElement('span')}</div>`;
        expect(el.outerHTML).to.equal('<div>before<span></span></div>');

        el = dominate`<div>${document.createElement('span')}after</div>`;
        expect(el.outerHTML).to.equal('<div><span></span>after</div>');

        el = dominate`<div>before${document.createElement('span')}after</div>`;
        expect(el.outerHTML).to.equal('<div>before<span></span>after</div>');

        el = dominate`<div>before${dominate`<span></span>`}</div>`;
        expect(el.outerHTML).to.equal('<div>before<span></span></div>');

        el = dominate`<div>${dominate`<span></span>`}after</div>`;
        expect(el.outerHTML).to.equal('<div><span></span>after</div>');

        el = dominate`<div>before${dominate`<span></span>`}after</div>`;
        expect(el.outerHTML).to.equal('<div>before<span></span>after</div>');

        el = dominate`
            <div>
                foo
                ${'bar'}
                <em />
                ${'<span></span>'}
                baz
                ${document.createElement('p')}
                ${dominate`<i />`}
                qux
            </div>
        `;
        expect(el.outerHTML).to.equal('<div>foobar<em></em>&lt;span&gt;&lt;/span&gt;baz<p></p><i></i>qux</div>');
    });

    it('should support an array of children', () => {
        const children = [
            'foo',
            dominate`<div>bar</div>`,
            document.createElement('span'),
        ];

        const el = dominate`<div>${children}</div>`;
        expect(el.outerHTML).to.equal('<div>foo<div>bar</div><span></span></div>');
    });

    it('should support SVG', () => {
        const svg = dominate`<svg><circle cx="50" cy="50" r="40" fill="red"></circle></svg>`;

        expect(svg.outerHTML).to.equal('<svg><circle cx="50" cy="50" r="40" fill="red"></circle></svg>');

        expect(svg.nodeType).to.equal(1);
        expect(svg.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(svg).to.be.instanceof(SVGElement);

        const circle = svg.querySelector('circle');
        expect(circle.nodeType).to.equal(1);
        expect(circle.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(circle).to.be.instanceof(SVGElement);
    });

    it('should execute scripts', () => {
        const el = dominate`<script>window.foo = "foo";</script>`;
        expect(window.foo).to.not.exist;
        document.body.appendChild(el);
        expect(window.foo).to.exist;
        delete window.foo;
    });

    it('should support custom elements', () => {
        const customElementSpy = sinon.spy();

        customElements.define('foo-bar', class FooBar extends HTMLElement {
            constructor() {
                super();
                customElementSpy();
            }
        });

        const el = dominate`
            <foo-bar></foo-bar>
        `;

        expect(el.nodeType).to.equal(1);
        expect(el.nodeName).to.equal('FOO-BAR');
        expect(el.outerHTML).to.equal('<foo-bar></foo-bar>');
        expect(customElementSpy.callCount).to.equal(1);
    });

    it('should ignore leading/trailing line breaks', () => {
        const el = dominate`
            <div></div>
        `;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
    });

    it('should support functional components', () => {
        const Component = (attributes, children) => {
            expect(attributes).to.deep.equal({id: 'foo', class: 'bar'});
            expect(children).to.be.an('array');
            expect(children).to.have.length(1);
            expect(children[0].outerHTML).to.equal('<span>baz</span>');
            return dominate`<div ...${attributes}>${children[0]}</div>`;
        };

        const el = dominate`
            <${Component} id="foo" class="bar">
                <span>baz</span>
            <//>
        `;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div id="foo" class="bar"><span>baz</span></div>');
    });

    it('should support returning multiple elements via ref attributes', () => {
        const { foo, bar, baz } = dominate`
            <div ref="foo">
                <span ref="bar"></span>
                <em ref="baz"></em>
            </div>
        `;

        expect(foo.outerHTML).to.equal('<div><span></span><em></em></div>');
        expect(bar.outerHTML).to.equal('<span></span>');
        expect(baz.outerHTML).to.equal('<em></em>');
    });

    it('should support refs for document fragments', () => {
        const { foo, bar } = dominate`
            <div ref="foo"></div>
            <span ref="bar"></span>
        `;

        expect(foo.outerHTML).to.equal('<div></div>');
        expect(bar.outerHTML).to.equal('<span></span>');
    });

    it('should support inner refs', () => {
        const Component = () => dominate`<i ref="baz"></i>`;

        const { foo, bar, baz } = dominate`
            <div ref="foo">
                ${dominate`<span><em ref="bar" /></span>`}
                <${Component} />
            </div>
        `;

        expect(foo.outerHTML).to.equal('<div><span><em></em></span><i></i></div>');
        expect(bar.outerHTML).to.equal('<em></em>');
        expect(baz.outerHTML).to.equal('<i></i>');
    });
});
