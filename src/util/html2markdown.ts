// htmlDocumentをmarkdownに変換
export const html2markdown = (div: HTMLDivElement): string => {
    let out = "";
    const children = [...div.children];

    while (children.length) {
        const elm = children.shift();
        if (!elm) break;

        switch (elm.tagName) {
            case "P": {
                const content = elm.innerHTML.replaceAll(/<br>/g, "\n");
                out += content.replaceAll(/<code>(.*?)<\/code>/g, "`$1`");
                out += "\n";
                break;
            }
            case "PRE": {
                const lang = elm.getElementsByTagName("span")?.[0]?.textContent ?? "";
                const code = elm.getElementsByTagName("code")?.[0]?.textContent ?? "";
                out += `\n\`\`\`${lang}\n${code}\`\`\`\n\n`;
                break;
            }
            case "OL":
            case "LI": {
                for (const child of elm.children) {
                    children.unshift(child);
                }
                break;
            }
            default: {
                out += elm.textContent + "\n";
            }
        }
    }
    return out;
};
