"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const postSlack_1 = require("../src/slackFunctions/postSlack");
const getBrowserIp_1 = require("../src/util/getBrowserIp");
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
    // slackに投稿
    const text = "てきすと\n\n```\nconsole.log('hoge')\n```\n\nオワリ\n";
    const longText = text.repeat(100);
    await (0, postSlack_1.postSlack)({ page: slackPage, text: longText });
    await (0, postSlack_1.postSlack)({ page: slackPage, text: "-" });
};
main();
