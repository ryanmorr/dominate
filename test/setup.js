export const externalScriptSrc = 'https://code.jquery.com/jquery-3.3.1.slim.min.js';

export function type(obj) {
    return {}.toString.call(obj).slice(8, -1);
}

export function isElementSupported(tag) {
    const el = document.createElement(tag);
    return type(el) !== 'HTMLUnknownElement';
}