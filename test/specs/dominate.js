import dominate from '../../src/dominate';

describe('dominate', () => {
    it('should create an element', () => {
        const el = dominate`<div></div>`;

        expect(el.nodeType).to.equal(1);
        expect(el.outerHTML).to.equal('<div></div>');
        expect(el.ownerDocument).to.equal(document);
    });

    it('should create a text node', () => {
        const node = dominate`foo`;

        expect(node.nodeType).to.equal(3);
        expect(node.nodeName.toLowerCase()).to.equal('#text');
        expect(node.nodeValue).to.equal('foo');
        expect(node.ownerDocument).to.equal(document);
    });

    it('should not render null', () => {
		const el = dominate`<div>${null}</div>`;

		expect(el.innerHTML).to.equal('');
		expect(el.childNodes).to.have.length(0);
	});

	it('should not render undefined', () => {
		const el = dominate`<div>${undefined}</div>`;

		expect(el.innerHTML).to.equal('');
		expect(el.childNodes).to.have.length(0);
	});

	it('should not render boolean true', () => {
		const el = dominate`<div>${true}</div>`;

		expect(el.innerHTML).to.equal('');
		expect(el.childNodes).to.have.length(0);
	});

	it('should not render boolean false', () => {
		const el = dominate`<div>${false}</div>`;

		expect(el.innerHTML).to.equal('');
		expect(el.childNodes).to.have.length(0);
	});

    it('should render NaN as text content', () => {
		const el = dominate`<div>${NaN}</div>`;

		expect(el.innerHTML).to.equal('NaN');
	});

	it('should render zero as text content', () => {
		const el = dominate`<div>${0}</div>`;

		expect(el.innerHTML).to.equal('0');
	});

	it('should render non-zero numbers as text content', () => {
		const el = dominate`<div>${12}</div>`;

		expect(el.innerHTML).to.equal('12');
	});

    it('should create multiple elements and return a document fragment', () => {
        const frag = dominate`<div></div><span></span>`;

        expect(frag.nodeType).to.equal(11);
        expect(frag.childNodes.length).to.equal(2);
        expect(frag.childNodes[0].outerHTML).to.equal('<div></div>');
        expect(frag.childNodes[1].outerHTML).to.equal('<span></span>');
        expect(frag.ownerDocument).to.equal(document);
    });

    it('should support a mix of multiple elements and text nodes', () => {
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

    it('should support a child text node', () => {
        const el = dominate`<div>foo</div>`;

        expect(el.outerHTML).to.equal('<div>foo</div>');
    });

    it('should support a child element', () => {
        let el = dominate`<div><span /></div>`;
        expect(el.outerHTML).to.equal('<div><span></span></div>');

        el = dominate`<div><span></span></div>`;
        expect(el.outerHTML).to.equal('<div><span></span></div>');
    });

    it('should support multiple element children', () => {
        const el = dominate`<div><span /><em /><p></p></div>`;

        expect(el.outerHTML).to.equal('<div><span></span><em></em><p></p></div>');
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

    it('should support an attribute with a dynamic value', () => {
        const el = dominate`<div id=${'foo'}></div>`;

        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support an attribute with a quoted dynamic value', () => {
        let el = dominate`<div id="${'foo'}"></div>`;
        expect(el.outerHTML).to.equal('<div id="foo"></div>');
    });

    it('should support attributes with no value', () => {
        const el = dominate`<div foo></div>`;

        expect(el.outerHTML).to.equal('<div foo="true"></div>');
    });

    it('should support hyphens in attribute names', () => {
        const el = dominate`<div data-foo="bar"></div>`;

        expect(el.dataset.foo).to.equal('bar');
        expect(el.outerHTML).to.equal('<div data-foo="bar"></div>');
    });

    it('should set the class attribute with an array', () => {
        const el = dominate`<div class=${['foo', 'bar', 'baz']}></div>`;
        
        expect(el.className).to.equal('foo bar baz');
    });

    it('should set the class attribute with an object', () => {        
        const el = dominate`<div class=${{foo: true, bar: false, baz: true}}></div>`;
        
        expect(el.className).to.equal('foo baz');
    });

    it('should alias className to class', () => {
        const el = dominate`<div className="foo"></div>`;
        
        expect(el.className).to.equal('foo');
    });

    it('should support CSS styles as an object', () => {
        const styles = {
            width: '2em',
            gridRowStart: 1,
            'padding-top': 5,
            'padding-bottom': '0.7ex',
            top: 100,
            left: '100%'
        };

        const el = dominate`<div style=${styles}></div>`;

        expect(el.style.cssText).to.equal('width: 2em; grid-row-start: 1; padding-top: 5px; padding-bottom: 0.7ex; top: 100px; left: 100%;');
    });

    it('should support CSS styles as a string', () => {
        const el = dominate`<div style=${'background-color: rgb(20, 20, 20); position: static;'}></div>`;

        expect(el.outerHTML).to.equal('<div style="background-color: rgb(20, 20, 20); position: static;"></div>');
    });

    it('should support CSS custom properties', () => {
        const el = dominate`<div style=${{color: 'var(--color)', '--color': 'red'}}></div>`;
        document.body.appendChild(el);

        expect(el.style.color).to.equal('var(--color)');
        expect(window.getComputedStyle(el).getPropertyValue('color')).to.equal('rgb(255, 0, 0)');
        expect(window.getComputedStyle(el).getPropertyValue('--color')).to.equal('red');
        expect(el.outerHTML).to.equal('<div style="color: var(--color); --color: red;"></div>');
        document.body.removeChild(el);
    });

    it('should not add "px" suffix for custom properties', () => {
        const el = dominate`<div style=${{'--foo': '100px', width: 'var(--foo)'}}>test</div>`;
        document.body.appendChild(el);

        expect(el.style.width).to.equal('var(--foo)');
        expect(window.getComputedStyle(el).getPropertyValue('--foo')).to.equal('100px');
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

    it('should support camel-case event names', (done) => {
        const event = new MouseEvent('mousedown');
        const onMouseDown = (e) => {
            expect(e).to.equal(event);
            document.body.removeChild(el);
            done();
        };

        const el = dominate`<div onMouseDown=${onMouseDown}></div>`;
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

    it('should support the form attribute', () => {
		const el = dominate`
			<div>
				<form id="foo" />
				<button form="foo">test</button>
				<input form="foo" />
			</div>
        `;

        document.body.appendChild(el);

		const form = el.childNodes[0];
		const button = el.childNodes[1];
		const input = el.childNodes[2];

		expect(button).to.have.property('form', form);
		expect(input).to.have.property('form', form);

        document.body.removeChild(el);
	});

    it('should clear falsy input values', () => {
		const el = dominate`
			<div>
				<input value=${0} />
				<input value=${false} />
				<input value=${null} />
				<input value=${undefined} />
			</div>
		`;

		expect(el.children[0]).to.have.property('value', '0');
		expect(el.children[1]).to.have.property('value', 'false');
		expect(el.children[2]).to.have.property('value', '');
		expect(el.children[3]).to.have.property('value', '');
	});

    it('should support falsy DOM properties', () => {
        const el1 = dominate`
            <div>
                <input value=${false} />
                <table border=${false} />
            </div>
        `;

        expect(el1.innerHTML).to.equal('<input><table border="false"></table>');

        const el2 = dominate`
            <div>
                <input value=${null} />
                <table border=${null} />
            </div>
        `;

        expect(el2.innerHTML).to.equal('<input><table border=""></table>');

        const el3 = dominate`
            <div>
                <input value=${undefined} />
                <table border=${undefined} />
            </div>
        `;

        expect(el3.innerHTML).to.equal('<input><table border=""></table>');
    });

    it('should set an enumerable boolean attribute', () => {
		const el = dominate`<input spellcheck=${false} />`;

		expect(el.spellcheck).to.equal(false);
	});

	it('should set the download attribute', () => {
		const el1 = dominate`<a download=""></a>`;

		expect(el1.getAttribute('download')).to.equal('');

		const el2 = dominate`<a download=${null}></a>`;

		expect(el2.getAttribute('download')).to.equal(null);
	});

    it('should support false string aria attributes', () => {
		const el = dominate`<div aria-checked="false"></div>`;

		expect(el.getAttribute('aria-checked')).to.equal('false');
	});

	it('should support false aria attributes', () => {
		const el = dominate`<div aria-checked=${false}></div>`;

		expect(el.getAttribute('aria-checked')).to.equal('false');
	});

	it('should support false data attributes', () => {
		const el = dominate`<div data-checked=${false}></div>`;

		expect(el.getAttribute('data-checked')).to.equal('false');
	});

	it('should set checked attribute on custom elements without checked property', () => {
		const el = dominate`<o-checkbox checked />`;

		expect(el.outerHTML).to.equal('<o-checkbox checked="true"></o-checkbox>');
	});

	it('should set value attribute on custom elements without value property', () => {
		const el = dominate`<o-input value="test" />`;

		expect(el.outerHTML).to.equal('<o-input value="test"></o-input>');
	});

	it('should mask value on password input elements', () => {
		const el = dominate`<input value="xyz" type="password" />`;

		expect(el.outerHTML).to.equal('<input type="password">');
	});

	it('should unset href if null or undefined', () => {
		const el = dominate`
			<div>
				<a href="#">href="#"</a>
				<a href=${undefined}>href="undefined"</a>
				<a href=${null}>href="null"</a>
				<a href=${''}>href="''"</a>
			</div>
        `;

		const links = el.querySelectorAll('a');
		expect(links[0].hasAttribute('href')).to.equal(true);
		expect(links[1].hasAttribute('href')).to.equal(false);
		expect(links[2].hasAttribute('href')).to.equal(false);
		expect(links[3].hasAttribute('href')).to.equal(true);
	});

    it('should not set tagName', () => {
		expect(() => dominate`<input tagName="div" />`).not.to.throw();
	});

    it('should not throw when setting size to an invalid value', () => {
		expect(() => dominate`<input size=${undefined} />`).to.not.throw();
		expect(() => dominate`<input size=${null} />`).to.not.throw();
		expect(() => dominate`<input size=${0} />`).to.not.throw();
	});

    it('should escape HTML characters', () => {
        const el = dominate`<div>${'<i id="foo" class=\'bar\'>bar</i>'}</div>`;

        expect(el.outerHTML).to.equal('<div>&lt;i id="foo" class=\'bar\'&gt;bar&lt;/i&gt;</div>');
    });

    it('should support SVG', () => {
        const svg = dominate`<svg><circle class="foo" cx="50" cy="50" r="40" fill="red"></circle></svg>`;

        expect(svg.outerHTML).to.equal('<svg><circle class="foo" cx="50" cy="50" r="40" fill="red"></circle></svg>');

        expect(svg.nodeType).to.equal(1);
        expect(svg.namespaceURI).to.equal('http://www.w3.org/2000/svg');
        expect(svg).to.be.instanceof(SVGElement);

        const circle = svg.querySelector('circle');
        expect(circle.nodeType).to.equal(1);
        expect(circle.getAttribute('class')).to.equal('foo');
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

    it('should not cache elements with identical markup', () => {
        const text = () => dominate`foo`;
        const element = () => dominate`<div></div>`;
        const frag = () => dominate`<div></div><span></span>`;

        expect(dominate`foo`).to.not.equal(dominate`foo`);
        expect(dominate`<div></div>`).to.not.equal(dominate`<div></div>`);
        expect(dominate`<div></div><span></span>`).to.not.equal(dominate`<div></div><span></span>`);
        expect(text()).to.not.equal(text());
        expect(element()).to.not.equal(element());
        expect(frag()).to.not.equal(frag());
    });
});
