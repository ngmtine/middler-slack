import puppeteer from "puppeteer-core";
import { postSlack } from "../src/slackFunctions/postSlack";
import { getBrowserIp } from "../src/util/getBrowserIp";

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

    // slackに投稿
    const text = "てきすと\n\n```\nconsole.log('hoge')\n```\n\nオワリ\n";
    const longText = text.repeat(100);
    await postSlack({ page: slackPage, text: longText });
    await postSlack({ page: slackPage, text: "-" });
};

main();
