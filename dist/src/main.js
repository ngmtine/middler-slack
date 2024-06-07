"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const postSlack_1 = require("./slackFunctions/postSlack");
const sendPostRequest_1 = require("./slackFunctions/sendPostRequest");
const wait4answer_1 = require("./slackFunctions/wait4answer");
const getBrowserIp_1 = require("./util/getBrowserIp");
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
            const questionText = await (0, wait4answer_1.wait4answer)({ page: slackPage });
            console.log(`%cquestion: ${questionText}`, "background: white; color: blue;");
            // 質問をローカルサーバーに投げる
            const answerText = await (0, sendPostRequest_1.sendPostRequest)({ text: questionText });
            // 回答をslackに投稿
            await (0, postSlack_1.postSlack)({ page: slackPage, text: answerText });
            await (0, postSlack_1.postSlack)({ page: slackPage, text: "-" });
        }
        catch (error) {
            console.error(error);
            console.warn("Retrying in 10 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 1000 * 10));
        }
    }
};
main();
