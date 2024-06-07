import { setInterval as promiseSetInterval } from "node:timers/promises";

import { ElementHandle, Page } from "puppeteer-core";
import { startBrowser } from "../src/functions";
import { text2HTMLDocument } from "../src/util/text2HTMLDocument";
import { html2markdown } from "../src/util/html2markdown";

const { env }: { env: any } = process;

export const monitoringTest = async ({ page }: { page: Page }): Promise<string> => {
    let generatingText = "";

    const interval = env.waitingInterval; // 短すぎると回答完了前にreturnしてしまう事に注意
    const timer = promiseSetInterval(interval);

    for await (const _ of timer) {
        try {
            // ヘッドレスで起動している場合は不要
            page.bringToFront();

            // 最後の回答の要素を取得
            const messageContentList = (await page.$$("message-content")) as ElementHandle<HTMLDivElement>[];
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection) continue;

            // 最後の回答の要素のinnerHtmlを取得
            const htmlText = await lastMessageSection.evaluate((div) => div.innerHTML);

            // HTMLDivElementに変換
            const doc = text2HTMLDocument(htmlText);
            const div = doc.getElementsByTagName("div")[0];
            if (!div) throw new Error("cannot get div!!");

            // markdownテキストに変換
            const text = html2markdown(div);

            // 回答生成中ならばループ継続
            if (text !== generatingText) {
                generatingText = text;
                continue;
            }

            // 回答完了したらループ終了
            break;
        } catch (error) {
            console.error(error);
        }
    }

    return generatingText;
};

(async () => {
    const geminiPage = await startBrowser(env.geminiUrl);

    const answerText = await monitoringTest({ page: geminiPage });

    console.log(answerText || "ループ終了済み");
})();
