"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringTest = void 0;
const promises_1 = require("node:timers/promises");
const functions_1 = require("../src/functions");
const html2markdown_1 = require("../src/util/html2markdown");
const text2HTMLDocument_1 = require("../src/util/text2HTMLDocument");
const { env } = process;
const monitoringTest = async ({ page }) => {
    let generatingText = "";
    const interval = env.waitingInterval; // 短すぎると回答完了前にreturnしてしまう事に注意
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            // ヘッドレスで起動している場合は不要
            page.bringToFront();
            // 最後の回答の要素を取得
            const messageContentList = (await page.$$("message-content"));
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 最後の回答の要素のinnerHtmlを取得
            const htmlText = await lastMessageSection.evaluate((div) => div.innerHTML);
            // HTMLDivElementに変換
            const doc = (0, text2HTMLDocument_1.text2HTMLDocument)(htmlText);
            const div = doc.getElementsByTagName("div")[0];
            if (!div)
                throw new Error("cannot get div!!");
            // markdownテキストに変換
            const text = (0, html2markdown_1.html2markdown)(div);
            // 回答生成中ならばループ継続
            if (text !== generatingText) {
                generatingText = text;
                continue;
            }
            // 回答完了したらループ終了
            break;
        }
        catch (error) {
            console.error(error);
        }
    }
    return generatingText;
};
exports.monitoringTest = monitoringTest;
(async () => {
    const geminiPage = await (0, functions_1.startBrowser)(env.geminiUrl);
    const answerText = await (0, exports.monitoringTest)({ page: geminiPage });
    console.log(answerText || "ループ終了済み");
})();
