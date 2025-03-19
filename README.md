# 網頁摘要助手 (Webpage Summarizer)

這是一個 Chrome 瀏覽器擴展程序，能夠使用 Google Gemini API 自動生成網頁內容的摘要，並將其顯示在瀏覽器的側邊欄中。

## 功能特點

- 使用 Google Gemini API 進行智能網頁內容摘要
- 在瀏覽器側邊欄顯示摘要結果
- 支持自定義 API 密鑰設置
- 簡潔直觀的用戶界面
- 支持所有網頁內容的摘要生成

## 安裝要求

- Google Chrome 瀏覽器（版本 88 或更高）
- Google Gemini API 密鑰（需要自行申請）

## 安裝步驟

1. 下載此專案的所有文件
2. 打開 Chrome 瀏覽器，進入擴展管理頁面（chrome://extensions/）
3. 開啟右上角的「開發者模式」
4. 點擊「載入未封裝項目」按鈕
5. 選擇此專案的根目錄
6. 安裝完成後，在擴展選項中設置您的 Gemini API 密鑰

## 使用方法

1. 點擊瀏覽器工具欄中的擴展圖標
2. 在側邊欄中，您將看到當前網頁的摘要內容
3. 如需更改設置，請右鍵點擊擴展圖標並選擇「選項」

## 使用效果展示

以下是在閱讀學術論文時使用本擴展的實際效果：

![使用效果展示](/webpage-summarizer/images/webpage-summarizer.png)


如圖所示，擴展會自動生成：
- 文章摘要：概述論文的主要內容
- 重要觀點：提取文章中的關鍵論點
- 重要數據與引用：列出文章中的重要數據和引用資訊

這使得用戶能夠快速理解文章的核心內容，提高閱讀效率。

## 文件結構

```
├── manifest.json          # 擴展配置文件
├── sidepanel.html        # 側邊欄 HTML
├── sidepanel.js          # 側邊欄功能實現
├── sidepanel.css         # 側邊欄樣式
├── options.html          # 選項頁面 HTML
├── options.js            # 選項頁面功能實現
├── service-worker.js     # 後台服務工作程序
└── images/              # 圖標和圖片資源
```

## 技術棧

- HTML5
- CSS3
- JavaScript (ES6+)
- Chrome Extension APIs
- Google Gemini API

## 注意事項

- 使用前請確保已正確設置 Gemini API 密鑰
- 本擴展需要訪問網頁內容的權限才能生成摘要
- 建議在處理敏感信息的網頁時謹慎使用

## 開發者

如需修改或進一步開發，請遵循以下步驟：

1. 克隆此儲存庫
2. 修改相關代碼
3. 在 Chrome 擴展管理頁面重新載入擴展

## 授權

此專案採用 MIT 授權條款。 
