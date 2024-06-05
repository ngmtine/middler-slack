れどめ

### how to use

chromeを--remote-debugging-portを指定して起動
`node --env-file=.env ./dist/main.js`

### ubuntu22.04 dependencies:

in the case of using puppeteer instead puppeteer-core

```sh
sudo apt install libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi-dev libxtst-dev libnss3 libcups2 libxss1 libxrandr2 libasound2 libatk1.0-0 libatk-bridge2.0-0 libpangocairo-1.0-0 libgtk-3-0 libgbm1
```

### using windows side chrome from wsl puppeteer:

https://stackoverflow.com/questions/67703601/running-puppeteer-on-wsl2-controlling-the-chrome-on-windows

```sh
Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222"

# https://qiita.com/lx-sasabo/items/9817adf4fa731b985b00
ip route | grep 'default via' | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'

netsh interface portproxy add v4tov4 listenaddress=[wsl address] listenport=9222 connectaddress=127.0.0.1 connectport=9222

New-NetFirewallRule -DisplayName 'chromedebug' -Direction Inbound -LocalPort 9222 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName 'chromedebug' -Direction Outbound -RemotePort 9222 -Protocol TCP -Action Allow
```
