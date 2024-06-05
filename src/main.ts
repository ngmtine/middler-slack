import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { startBrowser, chatgptMonitoring, postChatgpt } from "./functions";

const { env }: { env: any } = process;

const app = new Hono();

app.post("/api/chat", async (c) => {
    try {
        // 質問取得
        const { text } = await c.req.json();
        if (!text) return c.json({ error: "text undefined!!" }, 200);
        console.log(`%cquestion: ${text}`, "background: white; color: blue;");

        // 質問投稿
        const chatgptPage = await startBrowser();
        await postChatgpt({ page: chatgptPage, text });

        // 回答完了を待つ
        const answerText = await chatgptMonitoring({ page: chatgptPage });
        console.log(`%canswer: ${answerText}`, "background: white; color: red;");

        // 返却
        return c.json({ text: answerText });
    } catch (error: any) {
        console.error(error);
        return c.json({ error: error.message }, 200);
    }
});

serve({
    fetch: app.fetch,
    port: env.honoPort,
});
