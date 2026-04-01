# siyuan-mcp-server

[English](./README.md) | [简体中文](./README_zh-CN.md) | [繁體中文](./README_zh-TW.md) | [Español](./README_es.md) | [한국어](./README_ko.md)

`siyuan-mcp-server` 是一個本地 `stdio` MCP Server，讓支援 MCP 的 AI 用戶端可以直接存取你的思源筆記。完成設定後，你可以把它接到 Claude Code、Cursor、Codex CLI 等用戶端，讓 AI 直接幫你讀取、檢索、整理與修改思源內容，把筆記從「存放資訊的地方」變成「可以直接協作的個人知識庫」。

## 它能幫你做什麼

接入後，Agent 不只是「讀一篇筆記」，而是可以跨多篇文件理解上下文，幫你把分散的資訊串起來。比較有價值的場景包括：

- 從日報、週報、會議紀要、專案文件中還原某件事的來龍去脈
- 根據你已有的知識庫內容，總結階段進展、風險、決策與未完成事項
- 把分散在多篇筆記裡的想法、待辦、承諾與結論整理成一份可執行輸出
- 延續你既有文件繼續寫，而不是每次都從空白開始
- 整理筆記本、文件與區塊結構，減少手動點選與重複搬運

你通常不需要自己寫 SQL，也不需要自己維護區塊屬性。只要把需求直接告訴 Agent，它會呼叫合適的工具來完成。

例如，你可以直接這樣說：

- 「回顧最近 30 天所有和 Alpha 專案相關的日報、週報、會議紀要，整理成一份進展摘要，包含關鍵決策、目前風險、未完成事項與下一步。」
- 「把我這兩週的會議紀要和工作日誌串起來，幫我找出重複出現的問題、被多次提到的待辦，以及哪些承諾還沒有落地。」
- 「根據我過去一個月的產品筆記、需求記錄和週報，整理一版目前的 roadmap 草稿，並標註每個結論主要來自哪些文件。」
- 「找到最近一次提到某個客戶的所有筆記，按時間線梳理背景、溝通紀要、答應過的事項和後續動作。」
- 「把這個主題下分散的資料彙總後，生成一版結構更清晰的總結稿，並追加到指定文件末尾。」

## 安裝說明

### 前置條件

- Node.js 18 或更新版本
- 本地執行中的思源筆記實例
- 一個有效的思源 API Token

你可以在思源筆記中透過 `設定 -> 關於 -> API Token` 取得 Token。

### 取得程式碼

```bash
git clone https://github.com/unclemicdo/siyuan-mcp-server.git
cd siyuan-mcp-server
```

### 安裝相依套件並建置

```bash
npm install
npm run build
```

本專案預設使用本地建置產物 `dist/index.js` 作為穩定啟動路徑。

### 自動安裝

如果你使用的是支援 MCP 管理命令的 Agent，可以直接讓它幫你新增設定。下面這些命令也可以由你自行手動執行。

下面的範例都假設你已經執行過 `npm install` 和 `npm run build`，並且把 `/path/to/siyuan-mcp-server` 替換成實際絕對路徑。

#### Claude Code

```bash
claude mcp add -e SIYUAN_TOKEN=your-siyuan-api-token-here siyuan -- node /path/to/siyuan-mcp-server/dist/index.js
```

如果你需要覆蓋預設連線埠或位址，再額外傳入 `-e SIYUAN_BASE_URL=http://127.0.0.1:6807`。

#### Codex CLI

```bash
codex mcp add siyuan --env SIYUAN_TOKEN=your-siyuan-api-token-here -- node /path/to/siyuan-mcp-server/dist/index.js
```

如果你需要覆蓋預設連線埠或位址，再額外傳入 `SIYUAN_BASE_URL`。

例如：

```bash
codex mcp add siyuan \
  --env SIYUAN_TOKEN=your-siyuan-api-token-here \
  --env SIYUAN_BASE_URL=http://127.0.0.1:6807 \
  -- node /path/to/siyuan-mcp-server/dist/index.js
```

### 手動安裝

如果你比較習慣自己管理設定，或所用用戶端沒有自動新增命令，可以手動寫入設定檔。

#### Claude Code

手動設定 `~/.claude.json`：

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

#### Claude Desktop

編輯設定檔：

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

#### Cursor

在專案根目錄建立 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/path/to/siyuan-mcp-server/dist/index.js"],
      "env": {
        "SIYUAN_TOKEN": "your-siyuan-api-token-here"
      }
    }
  }
}
```

### 環境變數

| 變數名 | 必填 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `SIYUAN_TOKEN` | 是 | 無 | 思源 API Token |
| `SIYUAN_BASE_URL` | 否 | `http://127.0.0.1:6806` | 思源實例位址；非本地位址會觸發啟動警告 |

### 安裝後驗證

完成安裝與設定後，建議至少做一次本地驗證：

```bash
npm test
```

如果你想在本地互動式檢查協定行為，也可以再執行：

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

## 功能介紹

目前共提供 22 個工具，主要分成以下幾類：

| 分類 | 工具數量 | 說明 |
| --- | --- | --- |
| 筆記本管理 | 5 | 列出、建立、開啟、關閉、重新命名筆記本 |
| 文件操作 | 5 | 建立、重新命名、刪除、移動、匯出 Markdown |
| 區塊操作 | 7 | 插入、追加、更新、刪除區塊，讀取區塊與子區塊 |
| 區塊屬性 | 2 | 讀取與設定區塊屬性 |
| SQL 查詢 | 1 | 唯讀 `SELECT` 查詢 |
| 系統工具 | 2 | 取得版本資訊、推送通知 |

從一般使用者的角度，可以把這些能力理解為：

- 找內容：依標題、標籤、更新時間或內容範圍定位文件與區塊
- 讀內容：讀取區塊內容、匯出整篇 Markdown、取得筆記結構
- 改內容：追加段落、更新區塊、建立或移動文件
- 整理結構：管理筆記本、移動文件、插入或刪除區塊

作為個人知識庫使用時，它真正有價值的地方是：Agent 可以在你的真實上下文中工作，而不是只回答通用問題。它可以根據你已經寫過的筆記持續總結、追蹤、歸納與整理。

其中有兩類屬於進階能力：

- `siyuan_sql_query`：提供給 Agent 在需要時更高效率地檢索內容。一般使用者通常不需要自己寫 SQL。
- 區塊屬性工具：如果你已經在自己的工作流程中使用 `custom-*` 屬性，Agent 也可以幫你讀取或更新；如果你沒有這類用法，可以忽略。

更詳細的工具說明可直接查看 `src/tools/*.ts` 中的工具描述。

## 注意事項

這個 MCP Server 是高權限本地整合。設定完成後，用戶端會以你的思源 API Token 直接呼叫思源介面。

- 它預設連線到 `http://127.0.0.1:6806`
- 如果你把 `SIYUAN_BASE_URL` 改成非本地位址，Token 與筆記內容會被送到該目標
- 如果非本地位址不是 HTTPS，傳輸中的 Token 與內容可能暴露
- 刪除、移動、覆寫更新都屬於真實寫操作；請把它視為「可直接修改你的知識庫」
- `siyuan_sql_query` 只允許單條唯讀 `SELECT` 查詢，不允許 `UPDATE`、`DELETE`、`PRAGMA` 或多語句 payload

從本版本開始，Server 在啟動時會對非本地或非 HTTPS 的 `SIYUAN_BASE_URL` 輸出警告。

另外，這個專案目前的交付形態是本地 `stdio` MCP Server：

- 適合：能夠啟動本地 MCP 程序的用戶端
- 不適合：把它當成具備鑑權、多租戶、遠端託管的 MCP Gateway

## 疑難排解

### `SIYUAN_TOKEN` 未設定

服務啟動時會直接報錯。請把 Token 配到用戶端的 MCP 環境變數中。

### 無法連線到思源

請先檢查：

- 思源是否正在執行
- `SIYUAN_BASE_URL` 是否填寫正確
- 目標實例到底是本地還是遠端

如果你看到 non-local warning，表示目前設定會把 Token 傳送到本機以外的位址。

### 401 Unauthorized

通常表示 Token 不正確，或 Token 對應的是另一個思源實例。請確認 Token 來源與 `SIYUAN_BASE_URL` 指向的是同一台思源。

### SQL 結果被截斷

`siyuan_sql_query` 的返回文字超過限制時會自動截斷。請縮小查詢範圍，例如增加 `LIMIT`、`WHERE` 或選擇更少欄位。

## 已知限制

- 目前只支援本地啟動的 `stdio` Server，不提供遠端託管模式
- 沒有額外權限系統；權限邊界完全繼承思源 API Token
- SQL 工具只支援唯讀 `SELECT`
- 大結果集會被截斷，避免把過量文字直接灌進用戶端

## 致謝

本專案參考思源筆記官方 API 文件實作。

- SiYuan 官方倉庫：[github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- SiYuan API 文件：[API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
