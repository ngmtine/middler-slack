"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTextIgnored = void 0;
// 改行を無視してテキストを比較
const isTextIgnored = ({ text, ignoreTextList }) => {
    const normalizedText = text.replace(/\s+/g, "");
    return ignoreTextList.some((ignoreText) => normalizedText === ignoreText.replace(/\s+/g, ""));
};
exports.isTextIgnored = isTextIgnored;
