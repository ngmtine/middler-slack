# slack bot

slack を監視して新規投稿をそのまま  
https://github.com/ngmtine/middler-slack  
に投げて返答をまた投稿するやつ

# 準備

・`.env`の作成  
=> `.env.example`からコピーして`slackUrl`を編集

・slack の投稿時 markdown 有効化  
環境設定 => 詳細設定 => 入力設定 => マークアップでメッセージを書式設定する

## 使い方

middler の起動  
=> 手順略

・win 側の chrome を--remote-debugging-port を指定して起動  
https://stackoverflow.com/questions/67703601/running-puppeteer-on-wsl2-controlling-the-chrome-on-windows  
`Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222"`

・プロセス開始  
`node --env-file=.env ./dist/src/main.js`
