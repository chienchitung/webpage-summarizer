// sidepanel.js

document.addEventListener('DOMContentLoaded', () => {
    // 頁面載入完成後執行
    const generateButton = document.getElementById('generateSummary');
    const loadingDiv = document.getElementById('loading');
    const summaryContent = document.getElementById('summary-content');
    const apiSettings = document.getElementById('api-settings');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const apiStatus = document.getElementById('apiStatus');

    // 載入已儲存的API金鑰
    chrome.storage.sync.get('apiKey', (data) => {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
    });

    // 儲存API金鑰
    const saveApiKey = () => {
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            showApiStatus('請輸入 API 金鑰', 'error');
            return;
        }

        chrome.storage.sync.set({ apiKey }, () => {
            showApiStatus('設定已儲存', 'success');
            apiSettings.style.display = 'none';
            summarizeWebsite(); // 儲存後立即執行摘要
        });
    };

    // 顯示API設定狀態
    const showApiStatus = (message, type) => {
        apiStatus.textContent = message;
        apiStatus.className = `status ${type}`;
        apiStatus.style.display = 'block';
        
        setTimeout(() => {
            apiStatus.style.display = 'none';
        }, 3000);
    };

    const summarizeWebsite = async () => {
        try {
            if (loadingDiv) loadingDiv.style.display = 'block';
            if (summaryContent) summaryContent.textContent = '';

            // 取得當前活動 Tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.id) {
                throw new Error("無法取得當前網頁");
            }

            // 注入腳本獲取網頁內容，但不修改原始內容
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // 創建一個虛擬的 div 來複製內容
                    const virtualDiv = document.createElement('div');
                    virtualDiv.innerHTML = document.body.innerHTML;
                    
                    // 在虛擬 div 中移除不需要的元素
                    const elementsToRemove = ['script', 'style', 'noscript', 'textarea', 'input', 'select', 'head', 'footer', 'nav'];
                    elementsToRemove.forEach(tag => {
                        const elements = virtualDiv.getElementsByTagName(tag);
                        for (let i = elements.length - 1; i >= 0; i--) {
                            elements[i].remove();
                        }
                    });
                    
                    // 獲取純文字內容
                    return virtualDiv.textContent;
                }
            });

            if (!results || !results[0] || !results[0].result) {
                throw new Error("無法取得網頁內容");
            }

            const pageContent = results[0].result.trim();
            if (!pageContent) {
                throw new Error("網頁內容為空");
            }

            // 從 storage 獲取 API 金鑰
            const { apiKey } = await chrome.storage.sync.get('apiKey');
            if (!apiKey) {
                if (summaryContent) {
                    summaryContent.innerHTML = `
                        <div class="error">
                            請先設定 Gemini API 金鑰
                            <br><br>
                            <button id="openOptions" class="settings-button">前往設定頁面</button>
                        </div>
                    `;
                    
                    // 添加設定頁面按鈕點擊事件
                    const openOptionsButton = document.getElementById('openOptions');
                    if (openOptionsButton) {
                        openOptionsButton.addEventListener('click', () => {
                            chrome.runtime.openOptionsPage();
                        });
                    }
                    apiSettings.style.display = 'block'; // 顯示API設定表單
                }
                return;
            }

            // 調用 Gemini API
            const summary = await generateSummaryWithGemini(pageContent, apiKey);
            displaySummary(summary);

        } catch (error) {
            console.error('Error:', error);
            if (summaryContent) {
                summaryContent.innerHTML = `<div class="error">錯誤：${error.message}</div>`;
            }
        } finally {
            if (loadingDiv) loadingDiv.style.display = 'none';
        }
    };

    const generateSummaryWithGemini = async (content, apiKey) => {
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
        
        try {
            const response = await fetch(`${API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `請幫我總結以下文章的重點，並使用 Markdown 格式排版：\n\n${content}\n\n請用繁體中文回覆，並依照以下格式：
# 文章摘要
[請用 200 字內簡明扼要地說明文章的核心內容，重點突出文章的目的與觀點。]

## 重要觀點
- **觀點 1**： [請用 50 字內概述第一個重要觀點，注意簡潔且有條理。]
- **觀點 2**： [請用 50 字內概述第二個重要觀點，注意簡潔且有條理。]
- **觀點 3**： [請用 50 字內概述第三個重要觀點，注意簡潔且有條理。]

## 重要數據與引用
- **數據/引用 1**： [請簡述一個重要的數據或引用，並在括號中標註來源，如文章或研究機構名稱。]
- **數據/引用 2**： [請簡述另一個重要的數據或引用，並在括號中標註來源，如文章或研究機構名稱。]
- **數據/引用 3**： [請簡述另一個重要的數據或引用，並在括號中標註來源，如文章或研究機構名稱。]`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 請求失敗: ${errorData.error?.message || response.status}`);
            }

            const data = await response.json();
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('API 回應格式錯誤');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`無法生成摘要: ${error.message}`);
        }
    };

    const displaySummary = (summary) => {
        if (!summaryContent) return;

        // 將 Markdown 轉換為 HTML
        const formattedSummary = summary
            .split('\n')
            .map(line => {
                // 處理標題
                if (line.startsWith('# ')) {
                    return `<h1 class="summary-title">${line.substring(2)}</h1>`;
                } else if (line.startsWith('## ')) {
                    return `<h2 class="summary-subtitle">${line.substring(3)}</h2>`;
                } else if (line.startsWith('- ')) {
                    // 處理列表項目，並轉換粗體語法
                    const content = line.substring(2);
                    const formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                    return `<div class="summary-point">• ${formattedContent}</div>`;
                } else if (line.trim() !== '') {
                    // 處理普通段落中的粗體語法
                    const formattedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                    return `<p>${formattedLine}</p>`;
                }
                return '';
            })
            .join('');

        summaryContent.innerHTML = `
            <div class="summary-container">
                ${formattedSummary}
            </div>
        `;
    };

    if (generateButton) {
        generateButton.addEventListener('click', summarizeWebsite);
    }

    if (saveApiKeyButton) {
        saveApiKeyButton.addEventListener('click', saveApiKey);
    }

    // 支持按Enter鍵儲存API金鑰
    if (apiKeyInput) {
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveApiKey();
            }
        });
    }

    // 頁面載入時立即執行摘要
    summarizeWebsite();
});