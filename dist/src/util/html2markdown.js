"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.html2markdown = void 0;
// htmlDocumentをmarkdownに変換
const html2markdown = (div) => {
    let out = "";
    for (const child of div.children) {
        switch (child.tagName) {
            case "P": {
                const content = child.innerHTML.replaceAll(/<br>/g, "\n");
                out += content.replaceAll(/<code>(.*?)<\/code>/g, "`$1`");
                out += "\n";
                break;
            }
            case "PRE": {
                const lang = child.getElementsByTagName("span")?.[0]?.textContent ?? "";
                const code = child.getElementsByTagName("code")?.[0]?.textContent ?? "";
                out += `\n\`\`\`${lang}\n${code}\`\`\`\n\n`;
                break;
            }
            default: {
                out += child.textContent + "\n";
            }
        }
    }
    return out;
};
exports.html2markdown = html2markdown;
