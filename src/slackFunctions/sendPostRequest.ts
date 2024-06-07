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
    const responseText = responseData.text;
    if (!responseText) throw new Error("cannot get text!!");
    console.log("Response:", responseText);

    return responseText;
};
