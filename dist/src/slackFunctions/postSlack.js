"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSlack = void 0;
// 回答をslackに投げる
const postSlack = async ({ page, text, send = true }) => {
    page.bringToFront();
    // ql-editorクラス要素にテキストを入力
    const inputArea = await page.waitForSelector("div.ql-editor", { timeout: 0 });
    if (!inputArea)
        throw new Error("inputArea undefined!!");
    await inputArea.evaluate((div, text) => (div.textContent = text), text);
    if (!send)
        return;
    // 送信ボタン押下
    const button = await page.$("button[data-qa='texty_send_button']");
    if (!button)
        throw new Error("sendbutton undefined!!");
    await button.click();
};
exports.postSlack = postSlack;
