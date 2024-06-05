"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("node:timers/promises");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const getBrowserIp_1 = require("./util/getBrowserIp");
const { env } = process;
const main = async () => {
    // ブラウザ起動
    const ip = env.ip ?? (0, getBrowserIp_1.getBrowserIp)();
    const port = env.port ?? 9222;
    const options = { browserURL: `http://${ip}:${port}` };
    const browser = await puppeteer_core_1.default.connect(options);
    // slackにアクセス
    const slackPage = await browser.newPage();
    await slackPage.goto(env.slackUrl, { waitUntil: "domcontentloaded" });
    // Geminiにアクセス
    const geminiPage = await browser.newPage();
    await geminiPage.goto(env.geminiUrl, { waitUntil: "domcontentloaded" });
    // 無限ループ開始
    while (true) {
        console.log("loop!!");
        // 質問取得
        const questionText = await slackMonitoring({ page: slackPage });
        console.log(`%cquestion: ${questionText}`, "background: white; color: blue;");
        // 質問投稿
        await postGemini({ page: geminiPage, text: questionText });
        // 回答完了を待つ
        const answerText = await geminiMonitoring({ page: geminiPage });
        console.log(`%canswer: ${answerText}`, "background: white; color: red;");
        // 回答をslackに投稿
        await postSlack({ page: slackPage, text: answerText });
        await postSlack({ page: slackPage, text: "-" });
    }
};
// slackの新規質問の投稿を待つ
const slackMonitoring = async ({ page }) => {
    let text = "";
    const interval = 1000; // 1秒
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            page.bringToFront();
            // 最後の質問の要素を取得
            const messageContentList = await page.$$("div.p-rich_text_section");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 最後の質問の要素のテキストを取得
            text = (await lastMessageSection.evaluate((el) => el.innerText)) ?? "";
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
// geminiの回答を待つ
const geminiMonitoring = async ({ page }) => {
    let prevText = "";
    let generatingText = "";
    const interval = 1500; // 1.5秒（短すぎると回答完了前にreturnしてしまう）
    const timer = (0, promises_1.setInterval)(interval);
    for await (const _ of timer) {
        try {
            page.bringToFront();
            // 最後の回答の要素を取得
            const messageContentList = await page.$$("message-content");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection)
                continue;
            // 最後の回答の要素のテキストを取得
            const text = await lastMessageSection.evaluate((el) => {
                let out = "";
                for (const child of el.querySelectorAll("div > *")) {
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
// geminiに質問を投げる
const postGemini = async ({ page, text }) => {
    page.bringToFront();
    // 入力欄要素取得
    const inputArea = await page.$("rich-textarea");
    if (!inputArea)
        throw new Error("inputArea undefined!!");
    // 入力欄要素にテキスト入力
    // https://github.com/puppeteer/puppeteer/issues/1648#issuecomment-431755748
    await inputArea.press("Backspace");
    await inputArea.type(text);
    // 送信ボタン押下
    const button = await page.$("button.send-button");
    if (!button)
        throw new Error("sendbutton undefined!!");
    await button.click();
};
// 回答をslackに投げる
const postSlack = async ({ page, text }) => {
    page.bringToFront();
    // ql-editorクラス要素にテキストを入力
    const inputArea = await page.$("div.ql-editor");
    if (!inputArea)
        throw new Error("inputArea undefined!!");
    await inputArea.type(text);
    // 送信ボタン押下
    const button = await page.$("button[data-qa='texty_send_button']");
    if (!button)
        throw new Error("sendbutton undefined!!");
    await button.click();
};
try {
    main();
}
catch (error) {
    console.error(error);
}
