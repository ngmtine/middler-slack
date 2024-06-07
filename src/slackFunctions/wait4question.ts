import { setInterval as promiseSetInterval } from "node:timers/promises";
import type { Page } from "puppeteer-core";

const { env }: { env: any } = process;

// slackの新規質問の投稿を待つ
export const wait4question = async ({ page }: { page: Page }): Promise<string> => {
    let text = "";

    const interval = env.waitingInterval ?? 500;
    const timer = promiseSetInterval(interval);

    for await (const _ of timer) {
        try {
            page.bringToFront();

            // 最後の質問の要素を取得
            const messageContentList = await page.$$("div[data-qa='virtual-list-item']");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection) continue;

            // 投稿者が環境変数で指定された名前なら無視してループ継続
            const senderName = await lastMessageSection.evaluate((elm) => elm.querySelector("div[data-qa='message_content'] span.offscreen")?.textContent);
            if (senderName === env.senderName) continue;

            // 最後の質問の要素のテキストを取得
            text = await lastMessageSection.evaluate((elm) => {
                const element = elm.querySelector("div.c-message_kit__blocks") as HTMLElement;
                return element?.innerText ?? "";
            });

            // "-"ならばループ継続
            if (text === "-") continue;

            // "-"以外が来たらループ終了
            break;
        } catch (error) {
            console.error(error);
        }
    }

    return text;
};
