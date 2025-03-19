// service-worker.js

chrome.action.onClicked.addListener(async (tab) => {
    // 點擊 Extension 圖示時觸發
  
    // 檢查側邊欄是否已經打開
    try {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } catch (error) {
      // 如果側邊欄開啟失敗，可能是因為權限不足或 Manifest 設定錯誤
      console.error("開啟側邊欄失敗:", error);
    }
  });
  
  chrome.runtime.onInstalled.addListener(() => {
    console.log("網頁摘要助手 Extension 已安裝");
  });

  // 監聽來自側邊欄的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PAGE_CONTENT") {
      chrome.scripting.executeScript({
        target: { tabId: message.tabId },
        function: () => {
          return document.body.innerText;
        }
      }).then(result => {
        sendResponse({ content: result[0].result });
      });
      return true;
    }
  });