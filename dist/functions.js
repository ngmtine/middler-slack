"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postChatgpt = exports.chatgptMonitoring = exports.startBrowser = void 0;
const promises_1 = require("node:timers/promises");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const getBrowserIp_1 = require("./util/getBrowserIp");
const html2markdown_1 = require("./util/html2markdown");
const { env } = process;
// Pageオブジェクト取得
const startBrowser = async () => {
    // ブラウザ起動
    const browserIp = env.browserIp ?? (0, getBrowserIp_1.getBrowserIp)();
    const browserPort = env.browserPort ?? 9222;
    const options = { browserURL: `http://${browserIp}:${browserPort}` };
    const browser = await puppeteer_core_1.default.connect(options);
    // chatgptにアクセス
    const chatgptPage = await browser.newPage();
    await chatgptPage.goto(env.chatgptUrl, { waitUntil: "domcontentloaded" });
    return chatgptPage;
};
exports.startBrowser = startBrowser;
// chatgptの回答を待つ
const chatgptMonitoring = async ({ page }) => {
    let prevText = "";
    let generatingText = "";
    const interval = env.waitingInterval; // 短すぎると回答完了前にreturnしてしまう事に注意
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            // ヘッドレスで起動している場合は不要
            page.bringToFront();
            // 最後の回答の要素を取得
            const messageContentList = await page.$$("div.markdown");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 最後の回答の要素のテキストを取得
            const text = await lastMessageSection.evaluate((div) => (0, html2markdown_1.html2markdown)(div));
            // 回答生成中ならばループ継続
            if (text !== generatingText) {
                generatingText = text;
                continue;
            }
            // 回答完了したらループ終了
            if (text !== prevText)
                break;
        }
        catch (error) {
            console.error(error);
        }
    }
    return generatingText;
};
exports.chatgptMonitoring = chatgptMonitoring;
// chatgptに質問を投げる
const postChatgpt = async ({ page, text }) => {
    // ヘッドレスで起動している場合は不要
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
    const button = await page.waitForSelector("main form button[data-testid='fruitjuice-send-button']", { timeout: 1000 * 10 });
    if (!button)
        throw new Error("sendbutton undefined!!");
    await button.click();
};
exports.postChatgpt = postChatgpt;
