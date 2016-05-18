import { expect } from 'chai';
import dominate from '../../src/dominate';

describe('dominate - HTML', () => {
    it('should support body elements', () => {
        const el = dominate('<body></body>');
        expect(el.nodeName.toLowerCase()).to.equal('body');
    });

    it('should support head elements', () => {
        const el = dominate('<head></head>');
        expect(el.nodeName.toLowerCase()).to.equal('head');
    });

    it('should support html elements', () => {
        const el = dominate('<html></html>');
        expect(el.nodeName.toLowerCase()).to.equal('html');
    });

    it('should support html elements with attributes', () => {
        const el = dominate('<html id="foo" class="bar"></html>');
        expect(el.nodeName.toLowerCase()).to.equal('html');
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

    it('should execute script content', () => {
        const el = dominate('<script>window.foo = "foo";</script>');
        expect(el.nodeName.toLowerCase()).to.equal('script');
        /* eslint-disable no-unused-expressions */
        expect(window.foo).to.not.exist;
        document.body.appendChild(el);
        expect(window.foo).to.exist;
        /* eslint-enable no-unused-expressions */
        delete window.foo;
    });

    it('should load and execute script src', (done) => {
        const el = dominate('<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>');
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
});
