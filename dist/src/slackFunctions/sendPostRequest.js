"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPostRequest = void 0;
const node_fs_1 = require("node:fs");
const { env } = process;
// ローカルのapiサーバーに投げる
const sendPostRequest = async ({ url = env.apiUrl, text }) => {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });
    if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
    const responseData = await response.json();
    const { text: responseText, html: responseHtml } = responseData;
    // htmlをローカルに保存
    if (responseHtml) {
        const filepath = "./response.html";
        (0, node_fs_1.writeFileSync)(filepath, responseHtml);
        console.log(`HTML saved to ${filepath}`);
    }
    if (!responseText)
        throw new Error("cannot get text!!");
    console.log("Response:", responseText);
    return responseText;
};
exports.sendPostRequest = sendPostRequest;
