"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait4answer = void 0;
const promises_1 = require("node:timers/promises");
const { env } = process;
// slackの新規質問の投稿を待つ
const wait4answer = async ({ page }) => {
    let text = "";
    const interval = env.waitingInterval;
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            page.bringToFront();
            // 最後の質問の要素を取得
            const messageContentList = await page.$$("div[data-qa='virtual-list-item']");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 投稿者
            const senderName = await lastMessageSection.evaluate((elm) => elm.querySelector("div[data-qa='message_content'] span.offscreen")?.textContent);
            // 最後の質問の要素のテキストを取得
            // @ts-ignore
            text = await lastMessageSection.evaluate((elm) => elm.querySelector("div.c-message_kit__blocks")?.innerText ?? "");
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
exports.wait4answer = wait4answer;
