# 轉回好心情

一個抽卡網頁：按下按鈕，從三類素材中各抽一則。

| 按鈕 | 素材 | 數量 |
| --- | --- | --- |
| 抽出屬於你的今日正能量短句 | 原創正能量短句 | 100 |
| 抽出屬於你的好方法 | 靜心放鬆、身體照顧、利他方法 | 75 |
| 抽出屬於你的經典好句 | 經典句子（回到當下、回到本我） | 150 |

同一類會把整輪抽完才重新洗牌，所以不會一直抽到同一句。抽到哪裡會記在訪客自己的瀏覽器裡（localStorage），重新整理或隔天再來都會接著抽；每位訪客各自洗牌，彼此不影響。換瀏覽器、換裝置、使用無痕模式或清除瀏覽資料時，會重新洗一輪。

## 資料夾內容

```
index.html          ← 已打包好的網頁，直接雙擊就能在瀏覽器打開
source/             ← 原始程式碼，要改版面或素材時用
  src/App.tsx               版面與抽卡邏輯
  src/index.css             配色（白、橙、黃、淺綠、淺藍）
  src/data/materials.json   全部素材
```

## 放上 GitHub Pages

1. 在 GitHub 建立一個新的 repository（例如 `good-mood`），設為 Public。
2. 把 `index.html` 上傳到 repository 根目錄（Add file → Upload files）。
3. 到 Settings → Pages，Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾選 `/ (root)`，按 Save。
4. 等一兩分鐘，網址會是 `https://你的帳號.github.io/good-mood/`。

`source/` 資料夾也可以一起上傳，方便日後修改。

## 修改素材後重新打包

需要先安裝 Node.js 18 以上與 pnpm。

```bash
cd source
pnpm install
# 修改 src/data/materials.json
pnpm exec vite build     # 確認沒有錯誤
```

重新產生單一檔案的 `index.html`，可請 Claude 用 web-artifacts-builder 打包，或使用任何能把 JS/CSS 內嵌進 HTML 的工具。

## 字體

連網時使用 Google Fonts 的 Noto Sans TC 與 Noto Serif TC；離線開啟會自動改用電腦內建的中文字體，版面不受影響。
