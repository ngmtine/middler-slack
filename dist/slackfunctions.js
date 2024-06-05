"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPostRequest = exports.postSlack = exports.monitorSlack = void 0;
const promises_1 = require("node:timers/promises");
const { env } = process;
// slackの新規質問の投稿を待つ
const monitorSlack = async ({ page }) => {
    let text = "";
    const interval = env.waitingInterval;
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            page.bringToFront();
            // 最後の質問の要素を取得
            const messageContentList = await page.$$("div.p-rich_text_section");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 最後の質問の要素のテキストを取得
            text = (await lastMessageSection.evaluate((el) => el.innerText)) ?? "";
            // "-"ならばループ継続
            if (text === "-")
                continue;
            // "-"以外が来たらループ終了
            break;
        }
        catch (error) {
            console.error(error);
        }
    }
    return text;
};
exports.monitorSlack = monitorSlack;
// 回答をslackに投げる
const postSlack = async ({ page, text }) => {
    page.bringToFront();
    // ql-editorクラス要素にテキストを入力
    const inputArea = await page.$("div.ql-editor");
    if (!inputArea)
        throw new Error("inputArea undefined!!");
    await inputArea.type(text);
    // 送信ボタン押下
    const button = await page.$("button[data-qa='texty_send_button']");
    if (!button)
        throw new Error("sendbutton undefined!!");
    await button.click();
};
exports.postSlack = postSlack;
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
