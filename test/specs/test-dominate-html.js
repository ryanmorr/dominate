import { expect } from 'chai';
import dominate from '../../src/dominate';

const toString = {}.toString;

function isElementSupported(tag) {
    const el = document.createElement(tag);
    return toString.call(el) !== '[object HTMLUnknownElement]';
}

describe('dominate - HTML', () => {
    const tags = [
        'a',
        'abbr',
        'address',
        'article',
        'aside',
        'audio',
        'b',
        'bdi',
        'bdo',
        'blockquote',
        'body',
        'button',
        'canvas',
        'caption',
        'cite',
        'code',
        'col',
        'colgroup',
        'command',
        'content',
        'data',
        'datalist',
        'dd',
        'decorator',
        'del',
        'details',
        'dfn',
        'dialog',
        'div',
        'dl',
        'dt',
        'em',
        'fieldset',
        'figcaption',
        'figure',
        'footer',
        'form',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'head',
        'header',
        'html',
        'i',
        'ins',
        'kbd',
        'keygen',
        'label',
        'legend',
        'li',
        'main',
        'map',
        'mark',
        'menu',
        'menuitem',
        'meter',
        'nav',
        'noscript',
        'object',
        'ol',
        'optgroup',
        'option',
        'output',
        'p',
        'pre',
        'progress',
        'q',
        'rb',
        'rp',
        'rt',
        'rtc',
        'ruby',
        's',
        'samp',
        'script',
        'section',
        'select',
        'shadow',
        'small',
        'source',
        'span',
        'strong',
        'style',
        'sub',
        'summary',
        'sup',
        'table',
        'tbody',
        'td',
        'template',
        'textarea',
        'tfoot',
        'th',
        'thead',
        'time',
        'title',
        'tr',
        'u',
        'ul',
        'var',
        'video'
    ];

    const selfCLosingTags = [
        'area',
        'base',
        'br',
        'embed',
        'hr',
        'iframe',
        'img',
        'input',
        'link',
        'meta',
        'param',
        'track',
        'wbr'
    ];

    function testElement(tag, html, htmlWithAttr) {
        it(`should support ${tag} elements`, () => {
            const el = dominate(html);
            expect(el.nodeName.toLowerCase()).to.equal(tag);
        });

        it(`should support ${tag} elements with attributes`, () => {
            const el = dominate(htmlWithAttr);
            expect(el.id).to.equal('foo');
            expect(el.className).to.equal('bar');
        });

        it(`should return a ${tag} element with no parent node`, () => {
            const el = dominate(html);
            expect(el.parentNode).to.equal(null);
        });
    }

    tags.filter(tag => isElementSupported(tag)).forEach((tag) => {
        testElement(tag, `<${tag}></${tag}>`, `<${tag} id="foo" class="bar"></${tag}>`);
    });

    selfCLosingTags.filter(tag => isElementSupported(tag)).forEach((tag) => {
        testElement(tag, `<${tag} />`, `<${tag} id="foo" class="bar" />`);
    });

    it('should load script src', (done) => {
        const src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js';
        const el = dominate(`<script src="${src}"></script>`);
        expect(el.nodeName.toLowerCase()).to.equal('script');
        /* eslint-disable no-unused-expressions */
        expect(window.jQuery).to.not.exist;
        el.onload = function onLoad() {
            expect(window.jQuery).to.exist;
            delete window.$;
            delete window.jQuery;
            done();
        };
        document.body.appendChild(el);
        /* eslint-enable no-unused-expressions */
    });

    it('should execute embedded script by default', () => {
        const code = 'window.foo = "foo";';
        const el = dominate(`<div><script>${code}</script></div>`);
        /* eslint-disable no-unused-expressions */
        expect(window.foo).to.not.exist;
        document.body.appendChild(el);
        expect(window.foo).to.exist;
        /* eslint-enable no-unused-expressions */
        delete window.foo;
    });

    it('should load embedded script src by default', (done) => {
        const src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js';
        const el = dominate(`<div><script src="${src}"></script></div>`);
        /* eslint-disable no-unused-expressions */
        expect(window.jQuery).to.not.exist;
        el.firstChild.onload = function onLoad() {
            expect(window.jQuery).to.exist;
            delete window.$;
            delete window.jQuery;
            done();
        };
        document.body.appendChild(el);
        /* eslint-enable no-unused-expressions */
    });

    it('should remove embedded scripts if provided false as third argument', () => {
        const el = dominate('<div><script></script></div>', document, false);
        expect(el.childNodes.length).to.equal(0);
    });
});
