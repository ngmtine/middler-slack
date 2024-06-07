import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { html2markdown } from "../src/util/html2markdown";
import { text2HTMLDocument } from "../src/util/text2HTMLDocument";

const main = () => {
    const dir = "./test/html";
    const files = readdirSync(dir);

    for (const file of files) {
        const ext = path.extname(file);
        if (ext !== ".html") continue;

        const filePath = path.join(dir, file);
        const markdownPath = path.join(dir, path.basename(file, ext) + ".md");

        try {
            const text = readFileSync(filePath, "utf-8");
            const html = text2HTMLDocument(text);
            const div = html.getElementsByTagName("div")[0];
            const result = html2markdown(div);
            console.log(`Converted ${file} to Markdown.`);
            console.log(result);
            writeFileSync(markdownPath, result);
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }
};

main();
