import puppeteer from "puppeteer";
import { Page } from "puppeteer";
import { getBrowserIp } from "./util/getBrowserIp";

import { log } from "./util/log";
// import { ngword } from "./ngword";

const main = async () => {
    const ip = getBrowserIp();
    const port = 9222;
    const options = { browserURL: `http://${ip}:${port}` };
    const browser = await puppeteer.connect(options);
    const page = await browser.newPage();

    // Geminiにアクセス
    await page.goto("https://gemini.google.com/");

    // rich-textarea要素にテキストを入力
    const inputArea = await page.waitForSelector("rich-textarea", { timeout: 0 });
    if (!inputArea) throw new Error("inputArea undefined!!");
    await inputArea.type("元気ですかー！");
    await inputArea.press("Enter");

    // 定期チェック開始
    answerMonitoring({ page });
};

// aiの回答を定期チェック
const answerMonitoring = ({ page }: { page: Page }) => {
    let prevText = "";
    let generatingText = "";

    setInterval(async () => {
        try {
            // 最後の回答の要素を取得
            const messageContentList = await page.$$("message-content");
            const lastMessageSection = messageContentList.at(-1);
            if (!lastMessageSection) return;

            // 最後の回答の要素のテキストを取得
            const text = await lastMessageSection.evaluate((el) => {
                let out = "";
                for (const child of el.querySelectorAll("div > *")) {
                    // if (ngword.includes(child.textContent ?? "")) continue; // なぜかundefinedになる
                    out += child.textContent + "\n";
                }
                return out;
            });

            // 回答生成中ならば何もしない
            if (text !== generatingText) {
                generatingText = text;
                return;
            }

            // 回答完了したら出力する
            if (text !== prevText) {
                log(text);
                prevText = text ?? "";
            }
        } catch (e) {
            console.error(e);
        }
    }, 1000);
};

try {
    main();
} catch (e) {
    console.error(e);
}
