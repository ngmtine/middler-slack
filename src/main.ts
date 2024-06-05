import { monitorSlack, postSlack, sendPostRequest } from "./slackfunctions";
import { getBrowserIp } from "./util/getBrowserIp";
import puppeteer from "puppeteer-core";

const { env }: { env: any } = process;

const main = async () => {
    // ブラウザ起動
    const ip = env.browserIp ?? getBrowserIp();
    const port = env.browserPort ?? 9222;
    const options = { browserURL: `http://${ip}:${port}` };
    const browser = await puppeteer.connect(options);

    // slackにアクセス
    const slackPage = await browser.newPage();
    await slackPage.goto(env.slackUrl, { waitUntil: "domcontentloaded" });

    // 無限ループ開始
    while (true) {
        console.log("loop!!");

        // 質問取得
        const questionText = await monitorSlack({ page: slackPage });
        console.log(`%cquestion: ${questionText}`, "background: white; color: blue;");

        // 質問をローカルサーバーに投げる
        const answerText = await sendPostRequest({ text: questionText });

        // 回答をslackに投稿
        await postSlack({ page: slackPage, text: answerText });
        await postSlack({ page: slackPage, text: "-" });
    }
};

try {
    main();
} catch (error) {
    console.error(error);
}
