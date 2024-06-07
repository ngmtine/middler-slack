import { setInterval as promiseSetInterval } from "node:timers/promises";
import puppeteer from "puppeteer-core";
import type { Page } from "puppeteer-core";
import { getBrowserIp } from "./util/getBrowserIp";
import { html2markdown } from "./util/html2markdown";
import { text2HTMLDocument } from "./util/text2HTMLDocument";

const { env }: { env: any } = process;

// Pageオブジェクト取得
export const startBrowser = async (url: string): Promise<Page> => {
    // ブラウザ起動
    const browserIp = env.browserIp ?? getBrowserIp();
    const browserPort = env.browserPort ?? 9222;
    const options = { browserURL: `http://${browserIp}:${browserPort}` };
    const browser = await puppeteer.connect(options);

    // chatgptにアクセス
    const chatgptPage = await browser.newPage();
    await chatgptPage.goto(url, { waitUntil: "domcontentloaded" });

    return chatgptPage;
};

let prevConversationTurn = "";

// chatgptの回答を待つ
export const chatgptMonitoring = async ({ page }: { page: Page }): Promise<string> => {
    console.log(`prevConversationTurn: ${prevConversationTurn}`);

    let output = "";
    let loopCounter = 0;

    const interval = env.waitingInterval;
    const timer = promiseSetInterval(interval);

    for await (const _ of timer) {
        try {
            // 応答がない場合強制終了
            loopCounter++;
            if (loopCounter > 100) {
                output = "timeout!! No response from chatgpt!!";
                break;
            }

            // ヘッドレスで起動している場合は不要
            page.bringToFront();

            // 最後の回答の要素を取得
            const messageContentList = await page.$$("div[data-testid]");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection) continue;

            // 最後の回答の要素の平文htmlを取得
            const htmlText = await lastMessageSection.evaluate((div) => div.outerHTML);

            // HTMLDivElementに変換
            const doc = text2HTMLDocument(htmlText);
            const div = doc.getElementsByTagName("div")?.[0];
            if (!div) continue;

            // 前回の回答を取得した場合はループ継続
            const conversationTurn = div.dataset.testid ?? "";
            if (prevConversationTurn === conversationTurn) continue;

            // 回答の親要素取得
            const answerDiv = div.querySelector("div.markdown") as HTMLDivElement | null;
            if (!answerDiv) continue;

            // 回答生成中ならばループ継続
            const isGenerating = answerDiv.classList.contains("result-streaming");
            if (isGenerating) continue;

            // markdownテキストを取得
            output = html2markdown(answerDiv);

            // 回答完了したらループ終了
            prevConversationTurn = conversationTurn;
            break;
        } catch (error) {
            console.error(error);
        }
    }

    return output;
};

// chatgptに質問を投げる
export const postChatgpt = async ({ page, text }: { page: Page; text: string }) => {
    // ヘッドレスで起動している場合は不要
    page.bringToFront();

    // 入力欄要素取得
    const inputArea = await page.waitForSelector("main form textarea");
    if (!inputArea) throw new Error("inputArea undefined!!");

    // 入力欄要素にテキスト入力
    await inputArea.evaluate((div, text) => (div.textContent = text), text);
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");

    // 送信ボタン押下
    const button = await page.waitForSelector("main form button[data-testid='fruitjuice-send-button']", { timeout: 1000 * 10 });
    if (!button) throw new Error("sendbutton undefined!!");
    await button.click();
};
