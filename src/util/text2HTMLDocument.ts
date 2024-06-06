import { JSDOM } from "jsdom";

// 文字列をHTMLDocumentにパース
export const text2HTMLDocument = (text: string): Document => {
    const jsdom = new JSDOM();
    const parser = new jsdom.window.DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc;
};
