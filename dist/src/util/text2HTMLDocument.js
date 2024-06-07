"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.text2HTMLDocument = void 0;
const jsdom_1 = require("jsdom");
// 文字列をHTMLDocumentにパース
const text2HTMLDocument = (text) => {
    const jsdom = new jsdom_1.JSDOM();
    const parser = new jsdom.window.DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc;
};
exports.text2HTMLDocument = text2HTMLDocument;
