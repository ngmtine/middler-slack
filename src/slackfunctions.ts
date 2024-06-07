import { setInterval as promiseSetInterval } from "node:timers/promises";
import { Page } from "puppeteer-core";

const { env }: { env: any } = process;

// slackの新規質問の投稿を待つ
export const monitorSlack = async ({ page }: { page: Page }): Promise<string> => {
    let text = "";
    const interval = env.waitingInterval;
    const timer = promiseSetInterval(interval);

    for await (const _ of timer) {
        try {
            page.bringToFront();

            // 最後の質問の要素を取得
            const messageContentList = await page.$$("div.p-rich_text_section");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection) continue;

            // 最後の質問の要素のテキストを取得
            text = (await lastMessageSection.evaluate((el) => el.innerText)) ?? "";

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

// 回答をslackに投げる
export const postSlack = async ({ page, text, send = true }: { page: Page; text: string; send?: boolean }) => {
    page.bringToFront();

    // ql-editorクラス要素にテキストを入力
    const inputArea = await page.waitForSelector("div.ql-editor", { timeout: 0 });
    if (!inputArea) throw new Error("inputArea undefined!!");
    await inputArea.evaluate((div, text) => (div.textContent = text), text);

    if (!send) return;

    // 送信ボタン押下
    const button = await page.$("button[data-qa='texty_send_button']");
    if (!button) throw new Error("sendbutton undefined!!");
    await button.click();
};

// ローカルのapiサーバーに投げる
export const sendPostRequest = async ({ url = env.apiUrl, text }: { url?: string; text: string }): Promise<string> => {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const responseData = await response.json();
    const responseText = responseData.text;
    if (!responseText) throw new Error("cannot get text!!");
    console.log("Response:", responseText);

    return responseText;
};
