"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postChatgpt = void 0;
// chatgptに質問を投げる
const postChatgpt = async ({ page, text }) => {
    // ヘッドレスで起動している場合は不要
    page.bringToFront();
    // 入力欄要素取得
    const inputArea = await page.waitForSelector("main form textarea");
    if (!inputArea)
        throw new Error("inputArea undefined!!");
    // 入力欄要素にテキスト入力
    await inputArea.evaluate((elm, val) => {
        elm.value = val;
        elm.dispatchEvent(new Event("input", { bubbles: true }));
    }, text);
    // 送信ボタン押下
    const button = await page.waitForSelector("main form button[data-testid='fruitjuice-send-button']", { timeout: 1000 * 10 });
    if (!button)
        throw new Error("sendbutton undefined!!");
    await button.click();
};
exports.postChatgpt = postChatgpt;
