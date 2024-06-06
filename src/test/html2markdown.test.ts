import { readFileSync } from "fs";
import { html2markdown } from "../util/html2markdown";
import { text2HTMLDocument } from "../util/text2HTMLDocument";

const main = () => {
    const filePath = "./src/test/mock.html";
    const text = readFileSync(filePath, "utf-8");
    const html = text2HTMLDocument(text);
    const div = html.getElementsByTagName("div")[0];
    const result = html2markdown(div);

    console.log("Extracted Text:\n", result);
};

main();
