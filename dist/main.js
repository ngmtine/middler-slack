"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const promises_1 = require("node:timers/promises");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const getBrowserIp_1 = require("./util/getBrowserIp");
const { env } = process;
const startBrowser = async () => {
    // ブラウザ起動
    const browserIp = env.browserIp ?? (0, getBrowserIp_1.getBrowserIp)();
    const browserPort = env.browserPort ?? 9222;
    const options = { browserURL: `http://${browserIp}:${browserPort}` };
    const browser = await puppeteer_core_1.default.connect(options);
    // chatgptにアクセス
    const chatgptPage = await browser.newPage();
    await chatgptPage.goto(env.chatgptUrl, { waitUntil: "domcontentloaded" });
    return { chatgptPage };
};
// chatgptの回答を待つ
const chatgptMonitoring = async ({ page }) => {
    let prevText = "";
    let generatingText = "";
    const interval = 1500; // 1.5秒（短すぎると回答完了前にreturnしてしまう）
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            page.bringToFront();
            // 最後の回答の要素を取得
            const messageContentList = await page.$$("div.markdown");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 最後の回答の要素のテキストを取得
            const text = await lastMessageSection.evaluate((elm) => {
                let out = "";
                for (const child of elm.querySelectorAll("*")) {
                    out += child.textContent + "\n";
                }
                return out;
            });
            // 回答生成中ならば何もしない
            if (text !== generatingText) {
                generatingText = text;
                continue;
            }
            // 回答完了したら出力して停止
            if (text !== prevText) {
                generatingText = text;
                break;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    return generatingText;
};
// chatgptに質問を投げる
const postChatgpt = async ({ page, text }) => {
    page.bringToFront();
    // 入力欄要素取得
    const inputArea = await page.waitForSelector("main form");
    if (!inputArea)
        throw new Error("inputArea undefined!!");
    // 入力欄要素にテキスト入力
    // https://github.com/puppeteer/puppeteer/issues/1648#issuecomment-431755748
    await inputArea.press("Backspace");
    await inputArea.type(text);
    // 送信ボタン押下
    // await wait(1000); // ボタン取得即押下してもイベント付与されてない場合があるっぽいので一瞬待つ
    const button = await page.waitForSelector("main form button[data-testid='fruitjuice-send-button']", { timeout: 1000 * 10 });
    if (!button)
        throw new Error("sendbutton undefined!!");
    await button.click();
};
const app = new hono_1.Hono();
app.post("/api/chat", async (c) => {
    try {
        // 質問取得
        const { text } = await c.req.json();
        if (!text)
            return c.json({ error: "text undefined!!" }, 200);
        console.log(`%cquestion: ${text}`, "background: white; color: blue;");
        // 質問投稿
        const { chatgptPage } = await startBrowser();
        await postChatgpt({ page: chatgptPage, text });
        // 回答完了を待つ
        const answerText = await chatgptMonitoring({ page: chatgptPage });
        console.log(`%canswer: ${answerText}`, "background: white; color: red;");
        // 返却
        return c.json({ text: answerText });
    }
    catch (error) {
        console.error(error);
        return c.json({ error: error.message }, 200);
    }
});
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: env.honoPort,
});
