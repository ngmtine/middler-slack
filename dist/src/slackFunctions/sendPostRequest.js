"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPostRequest = void 0;
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
    const responseText = responseData.text;
    if (!responseText)
        throw new Error("cannot get text!!");
    console.log("Response:", responseText);
    return responseText;
};
exports.sendPostRequest = sendPostRequest;
