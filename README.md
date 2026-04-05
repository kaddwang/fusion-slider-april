# Vibe Coding 產品實戰工作坊簡報

這是一個使用原生 HTML/CSS/JS 製作的 16 頁簡報網站。

## 專案結構
- `index.html`: 主要內容與結構
- `styles.css`: 視覺樣式 (Neon Cyberpunk 風格)
- `script.js`: 互動邏輯 (鍵盤導航、頁碼更新)

## 如何預覽
直接用瀏覽器開啟 `index.html` 即可。

## 部署教學

### 方法 1：GitHub Pages (推薦)
1. 在 GitHub 建立一個新的 Repository (例如 `vibe-coding-slides`)。
2. 將本專案推送到該 Repository：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vibe-coding-slides.git
   git push -u origin main
   ```
3. 進入 GitHub Repo 的 **Settings** > **Pages**。
4. 在 **Build and deployment** 下的 **Branch** 選擇 `main`，然後按 Save。
5. 等待幾分鐘，即可獲得網址。

### 方法 2：Zeabur
1. 將程式碼推送到 GitHub (同上)。
2. 登入 [Zeabur Dashboard](https://dash.zeabur.com)。
3. 建立新專案 (Project)。
4. 點擊 **Deploy New Service** > **GitHub**。
5. 選擇剛剛建立的 Repository。
6. Zeabur 會自動偵測為靜態網站並完成部署。

## 本地測試（Node 靜態伺服器）

專案內已包含一個簡單的 Node 靜態伺服器檔案 `server.js`，可直接在專案根目錄啟動：

- 使用 Node 直接啟動：

```bash
node server.js
```

- 或使用 npm script：

```bash
npm start
```

伺服器預設監聽 `localhost:3000`，在瀏覽器開啟 `http://localhost:3000` 即可預覽整個專案。

伺服器會從專案根目錄提供靜態檔案，並會嘗試在資料夾或無副檔名請求時回退到 `index.html`（適合單頁應用或簡報式網站）。
