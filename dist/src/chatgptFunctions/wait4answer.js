"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait4answer = void 0;
const promises_1 = require("node:timers/promises");
const html2markdown_1 = require("../util/html2markdown");
const text2HTMLDocument_1 = require("../util/text2HTMLDocument");
const { env } = process;
let prevConversationTurn = "";
// chatgptの回答を待つ
const wait4answer = async ({ page }) => {
    console.log(`prevConversationTurn: ${prevConversationTurn}`);
    let text = "";
    let html = "";
    let loopCounter = 0;
    const interval = env.waitingInterval ?? 1000;
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            // 応答がない場合強制終了
            loopCounter++;
            if (loopCounter > 100) {
                text = "timeout!! No response from chatgpt!!";
                break;
            }
            // ヘッドレスで起動している場合は不要
            page.bringToFront();
            // 最後の回答の要素を取得
            const messageContentList = await page.$$("div[data-testid]");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 最後の回答の要素の平文htmlを取得
            const htmlText = await lastMessageSection.evaluate((div) => div.outerHTML);
            // HTMLDivElementに変換
            const doc = (0, text2HTMLDocument_1.text2HTMLDocument)(htmlText);
            const div = doc.getElementsByTagName("div")?.[0];
            if (!div)
                continue;
            // 前回の回答を取得した場合はループ継続
            const conversationTurn = div.dataset.testid ?? "";
            if (prevConversationTurn === conversationTurn)
                continue;
            // 回答の親要素取得
            const answerDiv = div.querySelector("div.markdown");
            if (!answerDiv)
                continue;
            // 回答生成中ならばループ継続
            const isGenerating = answerDiv.classList.contains("result-streaming");
            if (isGenerating)
                continue;
            // markdownテキストを取得
            text = (0, html2markdown_1.html2markdown)(answerDiv);
            // 回答完了したらループ終了
            prevConversationTurn = conversationTurn;
            html = htmlText;
            break;
        }
        catch (error) {
            console.error(error);
        }
    }
    return { text, html };
};
exports.wait4answer = wait4answer;
