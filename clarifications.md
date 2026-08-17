# WRO Task Manager - 需求確認與規格澄清文檔

本文檔整理自 [spec.md](file:///c:/Project/WROTaskManager/spec.md) 與草圖 [IMG_0119.PNG](file:///c:/Project/WROTaskManager/IMG_0119.PNG) 的細節討論。  
請您直接在此文檔中**勾選選項 `[x]` 或填寫您的回覆**，編輯完成並儲存後告訴我，我將讀取此檔案並為您進行系統開發與規劃！

---

## 1. 樹狀分支與執行邏輯 (Tree & Branching)

### Q1.1 子節點觸發條件
父節點完成狀態（Completion status）是否固定為 **「成功 (Success / Yes)」** 與 **「失敗 (Failure / No)」** 兩種分支結果？
- [x] 是，固定為 Success / Failure 兩條分支。
- [ ] 否，請說明其他分支條件：___________

**使用者補充說明 / Notes:**
> 

---

### Q1.2 多任務併行或單線推進
[IMG_0119.PNG](file:///c:/Project/WROTaskManager/IMG_0119.PNG) 中中央區域劃分並列的 `task`：
- [ ] 代表「樹狀分支的選擇預覽 / 決策路徑」（同時顯示 Success/Failure 兩條分支路線）。
- [x] 代表「同時執行的併行任務」（例如同時進行兩項獨立任務）。
- [ ] 其他，請說明：___________

**使用者補充說明 / Notes:**
> 

---

### Q1.3 任務樹編輯介面
在開始計時前的「建立任務樹」階段，您偏好的任務樹編輯方式：
- [ ] 視覺化圖形編輯器（Visually connect nodes with drag/click）。
- [ ] 階層式表單 / 樹狀清單輸入（Form-based hierarchical input）。
- [x] 兩種皆提供（預設表單，提供圖形預覽/切換）。

**使用者補充說明 / Notes:**
> 

---

## 2. 計時器與超時機制 (Timers & Overtime)

### Q2.1 任務超時處理
當單一任務可用時間耗盡（閃爍紅框）時：
- [ ] 計時器改為**負數累加**（如 `-01:23` 閃紅框）提示超時時間，直到使用者選擇完成狀態才進入下一任務。
- [ ] 全域總剩餘時間繼續正常倒數。
- [ ] 其他，請說明：___________

**使用者補充說明 / Notes:**
> 
全域計時器正當倒數，並有一個負數計時器提醒使用者超時的時間，並在當前任務完成後，下一個任務的可用時間需要扣掉負數計時器的數值。
---

### Q2.2 雙層計時器顯示
畫面上除了左側固定顯示的「全域總剩餘時間」外：
- [x] 中央當前執行的任務節點上也顯示該任務獨立的倒數計時器。
- []  僅保留左側全域倒數計時器即可。

**使用者補充說明 / Notes:**
> 

---

## 3. UI 互動與視覺風格 (UI Layout & Motion Design)

### Q3.1 中央焦點滾動行為 (Sticky Center Focus)
進行到下一個任務時，中央焦點區域的運作方式：
- [x] 點選完成後，系統平滑滾動（Smooth Slide Up）將下一個任務推移至螢幕正中央。
- [ ] 當使用者手動滾動查看歷史/未來任務時，滑鼠釋放後自動定位回彈（Snap Back）至中央當前任務。
- [ x] 允許自由滾動，但提供「回到當前任務 (Recenter)」快捷浮動按鈕。

**使用者補充說明 / Notes:**
> 滾動的速度要是非線性速度，離得遠的時候滾快一點，近一點的時候滾慢一點。

---

### Q3.2 主題視覺風格
關於 UI 質感與毛玻璃特效：
- [x] 採用現代深色毛玻璃風格 (Dark Glassmorphism)，符合競賽儀表板專業感。
- [ ] 採用明亮淺色毛玻璃風格 (Light Glassmorphism)。
- [ ] 提供深色 / 淺色主題切換。

**使用者補充說明 / Notes:**
> 

---

## 4. 懸浮視窗與 PWA 離線應用 (Floating Window & PWA)

### Q4.1 懸浮視窗 (Document Picture-in-Picture)
- [x] 採用 Chrome 最新 **Document Picture-in-Picture API**，可將迷你計時器彈出為獨立置頂視窗，支援隨意調整大小與動態佈局。

**使用者補充說明 / Notes:**
> 

---

### Q4.2 PWA 離線安裝
- [x] 配置 Web App Manifest 與 Service Worker，支援 Chrome 網址列一鍵「安裝為桌面 App」並支援 100% 離線使用。

**使用者補充說明 / Notes:**
> 

---

## 5. 範本儲存與匯出 (Templates & Storage)

### Q5.1 範本儲存方式
- [x] 本地儲存（LocalStorage / IndexedDB）。
- [x] 支援 JSON 檔案匯出 (Export) 與匯入 (Import)，方便跨裝置或團隊分享任務流程範本。

**使用者補充說明 / Notes:**
> 
