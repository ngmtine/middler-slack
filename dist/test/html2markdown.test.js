"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const html2markdown_1 = require("../util/html2markdown");
const text2HTMLDocument_1 = require("../util/text2HTMLDocument");
const main = () => {
    const filePath = "./src/test/mock.html";
    const text = (0, fs_1.readFileSync)(filePath, "utf-8");
    const html = (0, text2HTMLDocument_1.text2HTMLDocument)(text);
    const div = html.getElementsByTagName("div")[0];
    const result = (0, html2markdown_1.html2markdown)(div);
    console.log("Extracted Text:\n", result);
};
main();
