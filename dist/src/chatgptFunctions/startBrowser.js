"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBrowser = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const getBrowserIp_1 = require("../util/getBrowserIp");
const { env } = process;
// Pageオブジェクト取得
const startBrowser = async (url) => {
    // ブラウザ起動
    const browserIp = env.browserIp ?? (0, getBrowserIp_1.getBrowserIp)();
    const browserPort = env.browserPort ?? 9222;
    const options = { browserURL: `http://${browserIp}:${browserPort}` };
    const browser = await puppeteer_core_1.default.connect(options);
    // chatgptにアクセス
    const chatgptPage = await browser.newPage();
    await chatgptPage.goto(url, { waitUntil: "domcontentloaded" });
    return chatgptPage;
};
exports.startBrowser = startBrowser;
