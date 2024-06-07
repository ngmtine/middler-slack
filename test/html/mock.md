Node.jsとTypeScriptで、指定されたcurlコマンドと同等のリクエストを送るには、`axios`などのHTTPクライアントライブラリを使用するのが一般的です。以下にその例を示します。
まず、必要なパッケージをインストールします。

```sh
npm install axios
```

次に、以下のTypeScriptコードを作成します。

```typescript
import axios from 'axios';

const url = 'http://localhost:3000/api/chat';
const data = {
    text: '挨拶の曜日 おはよう日'
};

axios.post(url, data, {
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('Response:', response.data);
})
.catch(error => {
    console.error('Error:', error);
});
```

このスクリプトはcurlコマンドと同等のリクエストを送信し、レスポンスをコンソールに出力します。これを実行するには、Node.js環境で以下のコマンドを実行してください。

```sh
ts-node your-script.ts
```

`ts-node`がインストールされていない場合は、以下のコマンドでインストールできます。

```sh
npm install -g ts-node
```

このコードは、`axios`を使ってHTTP POSTリクエストを送信し、指定されたURLに対してJSONデータを送信します。
