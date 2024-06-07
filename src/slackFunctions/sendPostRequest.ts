import { writeFileSync } from "node:fs";

const { env }: { env: any } = process;

// ローカルのapiサーバーに投げる
export const sendPostRequest = async ({ url = env.apiUrl, text }: { url?: string; text: string }): Promise<string> => {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const responseData = await response.json();
    const { text: responseText, html: responseHtml } = responseData;

    // htmlをローカルに保存
    if (responseHtml) {
        const filepath = "./response.html";
        writeFileSync(filepath, responseHtml);
        console.log(`HTML saved to ${filepath}`);
    }

    if (!responseText) throw new Error("cannot get text!!");
    console.log("Response:", responseText);

    return responseText;
};
