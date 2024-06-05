import { setInterval as promiseSetInterval } from "node:timers/promises";
import puppeteer, { Page } from "puppeteer-core";
import { getBrowserIp } from "./util/getBrowserIp";

const { env }: { env: any } = process;

// Pageオブジェクト取得
export const startBrowser = async (): Promise<Page> => {
    // ブラウザ起動
    const browserIp = env.browserIp ?? getBrowserIp();
    const browserPort = env.browserPort ?? 9222;
    const options = { browserURL: `http://${browserIp}:${browserPort}` };
    const browser = await puppeteer.connect(options);

    // chatgptにアクセス
    const chatgptPage = await browser.newPage();
    await chatgptPage.goto(env.chatgptUrl, { waitUntil: "domcontentloaded" });

    return chatgptPage;
};

// chatgptの回答を待つ
export const chatgptMonitoring = async ({ page }: { page: Page }): Promise<string> => {
    let prevText = "";
    let generatingText = "";

    const interval = env.waitingInterval; // 短すぎると回答完了前にreturnしてしまう事に注意
    const timer = promiseSetInterval(interval);

    for await (const _ of timer) {
        try {
            // ヘッドレスで起動している場合は不要
            page.bringToFront();

            // 最後の回答の要素を取得
            const messageContentList = await page.$$("div.markdown");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection) continue;

            // 最後の回答の要素のテキストを取得
            const text = await lastMessageSection.evaluate((elm) => {
                let out = "";
                for (const child of elm.querySelectorAll("*")) {
                    out += child.textContent + "\n";
                }
                return out;
            });

            // 回答生成中ならばループ継続
            if (text !== generatingText) {
                generatingText = text;
                continue;
            }

            // 回答完了したらループ終了
            if (text !== prevText) break;
        } catch (error) {
            console.error(error);
        }
    }

    return generatingText;
};

// chatgptに質問を投げる
export const postChatgpt = async ({ page, text }: { page: Page; text: string }) => {
    // ヘッドレスで起動している場合は不要
    page.bringToFront();

    // 入力欄要素取得
    const inputArea = await page.waitForSelector("main form");
    if (!inputArea) throw new Error("inputArea undefined!!");

    // 入力欄要素にテキスト入力
    // https://github.com/puppeteer/puppeteer/issues/1648#issuecomment-431755748
    await inputArea.press("Backspace");
    await inputArea.type(text);

    // 送信ボタン押下
    const button = await page.waitForSelector("main form button[data-testid='fruitjuice-send-button']", { timeout: 1000 * 10 });
    if (!button) throw new Error("sendbutton undefined!!");
    await button.click();
};
