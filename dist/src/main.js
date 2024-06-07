"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD:dist/main.js
const slackfunctions_1 = require("./slackfunctions");
const getBrowserIp_1 = require("./util/getBrowserIp");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const { env } = process;
const main = async () => {
    // ブラウザ起動
    const ip = env.browserIp ?? (0, getBrowserIp_1.getBrowserIp)();
    const port = env.browserPort ?? 9222;
    const options = { browserURL: `http://${ip}:${port}` };
    const browser = await puppeteer_core_1.default.connect(options);
    // slackにアクセス
    const slackPage = await browser.newPage();
    await slackPage.goto(env.slackUrl, { waitUntil: "domcontentloaded" });
    // 無限ループ開始
    while (true) {
        try {
            console.log("loop!!");
            // 質問取得
            const questionText = await (0, slackfunctions_1.monitorSlack)({ page: slackPage });
            console.log(`%cquestion: ${questionText}`, "background: white; color: blue;");
            // 質問をローカルサーバーに投げる
            const answerText = await (0, slackfunctions_1.sendPostRequest)({ text: questionText });
            // 回答をslackに投稿
            await (0, slackfunctions_1.postSlack)({ page: slackPage, text: answerText });
            await (0, slackfunctions_1.postSlack)({ page: slackPage, text: "-" });
        }
        catch (error) {
            console.error(error);
            console.warn("Retrying in 10 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 1000 * 10));
        }
=======
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const postChatgpt_1 = require("./chatgptFunctions/postChatgpt");
const startBrowser_1 = require("./chatgptFunctions/startBrowser");
const wait4answer_1 = require("./chatgptFunctions/wait4answer");
const { env } = process;
const app = new hono_1.Hono();
let chatgptPage;
(async () => {
    chatgptPage = await (0, startBrowser_1.startBrowser)(env.chatgptUrl);
})();
app.post("/api/chat", async (c) => {
    try {
        // 質問取得
        const { text } = await c.req.json();
        if (!text)
            return c.json({ error: "text undefined!!" }, 200);
        console.log(`%cquestion: ${text}`, "background: white; color: blue;");
        // 質問投稿
        await (0, postChatgpt_1.postChatgpt)({ page: chatgptPage, text });
        // 回答完了を待つ
        const { text: answerText, html } = await (0, wait4answer_1.wait4answer)({ page: chatgptPage });
        console.log(`%canswer: ${answerText}`, "background: white; color: red;");
        // 返却
        return c.json({ text: answerText, html });
>>>>>>> fork_master_main:dist/src/main.js
    }
};
main();
