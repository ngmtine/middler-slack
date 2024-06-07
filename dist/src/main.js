"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const node_server_1 = require("@hono/node-server");
const functions_1 = require("./functions");
const { env } = process;
const app = new hono_1.Hono();
let chatgptPage;
(async () => {
    chatgptPage = await (0, functions_1.startBrowser)(env.chatgptUrl);
})();
app.post("/api/chat", async (c) => {
    try {
        // 質問取得
        const { text } = await c.req.json();
        if (!text)
            return c.json({ error: "text undefined!!" }, 200);
        console.log(`%cquestion: ${text}`, "background: white; color: blue;");
        // 質問投稿
        await (0, functions_1.postChatgpt)({ page: chatgptPage, text });
        // 回答完了を待つ
        const answerText = await (0, functions_1.chatgptMonitoring)({ page: chatgptPage });
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
