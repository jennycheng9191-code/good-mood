# 轉回好心情

一個抽卡網頁：按下按鈕，從三類素材中各抽一則。

**線上網址**：https://jennycheng9191-code.github.io/good-mood/

| 按鈕 | 素材 | 數量 |
| --- | --- | --- |
| 抽出屬於你的今日正能量短句 | 原創正能量短句 | 100 |
| 抽出屬於你的好方法 | 靜心放鬆、身體照顧、利他方法 | 75 |
| 抽出屬於你的經典好句 | 經典句子（回到當下、回到本我） | 150 |

同一類會把整輪抽完才重新洗牌，所以不會一直抽到同一句。抽到哪裡會記在訪客自己的瀏覽器裡（localStorage，key 前綴 `goodmood-`），重新整理或隔天再來都會接著抽；每位訪客各自洗牌，彼此不影響。換瀏覽器、換裝置、使用無痕模式或清除瀏覽資料時，會重新洗一輪。

沒有後端、不收集任何資料。

## 怎麼改素材（最常做的事）

1. 編輯 `src/data/materials.json`
2. `git commit` 後 `git push`
3. GitHub Actions 自動建置並部署，約一分鐘後線上就更新了

不需要手動打包、不需要上傳任何檔案。

## 資料夾內容

```
src/App.tsx               版面與抽卡邏輯
src/index.css             配色（白、橙、黃、淺綠、淺藍）
src/data/materials.json   全部素材
public/favicon.svg        網站圖示
legacy/                   單檔打包版（離線備份，不參與建置）
.github/workflows/        自動建置部署流程
```

## 本機開發

需要 Node.js 18 以上。本機若沒有全域安裝 pnpm，用 `npx pnpm@10` 代跑即可。

```bash
npx pnpm@10 install --frozen-lockfile
npx pnpm@10 dev                                   # 本機開發（熱更新）
npx pnpm@10 build                                 # 產出 dist/
npx pnpm@10 exec vite preview                     # 預覽建置結果
```

## 部署設定（踩過的坑，不要動）

- `vite.config.ts` 的 `base: "/good-mood/"` **不可移除**。網站放在 GitHub Pages 的子路徑下，拿掉會導致線上開出來是白畫面（資源 404）。
- Pages 的 Source 必須是 **GitHub Actions**，不是 Deploy from a branch。
- 未來若接自訂網域：把 `base` 改回 `"/"`，並在 `public/` 放一個 `CNAME` 檔。

## 字體

連網時使用 Google Fonts 的 Noto Sans TC 與 Noto Serif TC；離線開啟會自動改用電腦內建的中文字體，版面不受影響。

## 免責

本站內容非醫療建議。持續的失眠、焦慮或情緒低落，請尋求專業協助。
