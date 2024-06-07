"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const html2markdown_1 = require("../src/util/html2markdown");
const text2HTMLDocument_1 = require("../src/util/text2HTMLDocument");
const main = () => {
    const dir = "./test/html";
    const files = (0, node_fs_1.readdirSync)(dir);
    for (const file of files) {
        const ext = node_path_1.default.extname(file);
        if (ext !== ".html")
            continue;
        const filePath = node_path_1.default.join(dir, file);
        const markdownPath = node_path_1.default.join(dir, node_path_1.default.basename(file, ext) + ".md");
        try {
            const text = (0, node_fs_1.readFileSync)(filePath, "utf-8");
            const html = (0, text2HTMLDocument_1.text2HTMLDocument)(text);
            const div = html.getElementsByTagName("div")[0];
            const result = (0, html2markdown_1.html2markdown)(div);
            console.log(`Converted ${file} to Markdown.`);
            console.log(result);
            (0, node_fs_1.writeFileSync)(markdownPath, result);
        }
        catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
};
main();
