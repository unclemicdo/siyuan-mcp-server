# siyuan-mcp-server

[English](./README_en.md) | [中文](./README.md)

思源笔记（SiYuan Note）的本地 MCP 服务，让 AI 助手（Claude Code 等）能通过 MCP 协议直接操作思源笔记的数据。

## 功能概览

提供 **22 个 MCP 工具**，覆盖思源笔记的核心操作：

| 分类 | 工具数量 | 主要功能 |
|------|---------|---------|
| 笔记本管理 | 5 | 列出、创建、打开、关闭、重命名笔记本 |
| 文档操作 | 5 | 创建、重命名、删除、移动文档，导出 Markdown |
| 块级操作 | 7 | 插入、追加、更新、删除块，读取块内容和子块 |
| 块属性 | 2 | 获取和设置自定义 key-value 元数据 |
| SQL 查询 | 1 | 执行 SQL 查询思源数据库，支持全文搜索 |
| 系统通知 | 2 | 获取版本信息，向思源 UI 推送通知 |

## 前置条件

- Node.js ≥ 18
- 思源笔记正在本地运行（默认端口 `6806`）
- 思源 API Token（设置 → 关于 → API Token）

## 安装

```bash
cd siyuan-mcp-server
npm install
npm run build
```

## 配置到 AI 客户端

本 MCP 服务兼容所有支持 [MCP 协议](https://modelcontextprotocol.io) 的 AI 客户端。以下是主流客户端的配置方式。

> **通用说明：**
> - 将 `/path/to/siyuan-mcp-server` 替换为你的实际项目路径
> - 将 `your-siyuan-api-token-here` 替换为真实 Token（设置 → 关于 → API Token）
> - 如需修改思源地址（非默认端口），在 `env` 中添加 `"SIYUAN_BASE_URL": "http://127.0.0.1:自定义端口"`

### Claude Code

你可以直接在 Claude Code 终端运行以下命令进行一键安装：

```bash
/mcp add siyuan node /path/to/siyuan-mcp-server/dist/index.js
```
*(注意：运行后如果提示缺少 `SIYUAN_TOKEN` 环境变量，请按提示输入即可。)*

或者手动编辑 `~/.claude.json`：

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

### Claude Desktop

编辑 Claude Desktop 配置文件：
- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

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

### Cursor

在项目根目录创建 `.cursor/mcp.json`：

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

### Codex CLI

你可以直接在终端中远行以下命令进行一键安装：

```bash
codex mcp add siyuan --env SIYUAN_TOKEN=your-siyuan-api-token-here -- node /path/to/siyuan-mcp-server/dist/index.js
```

或者手动编辑 `~/.codex/config.json`（或 `~/.codex/config.toml`）：

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

## 使用 MCP Inspector 测试

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

## 工具列表

### 笔记本管理
| 工具名 | 说明 |
|--------|------|
| `siyuan_list_notebooks` | 列出所有笔记本（含 ID、名称、状态）|
| `siyuan_create_notebook` | 创建新笔记本 |
| `siyuan_open_notebook` | 打开/激活已关闭的笔记本 |
| `siyuan_close_notebook` | 关闭笔记本（不删除内容）|
| `siyuan_rename_notebook` | 重命名笔记本 |

### 文档操作
| 工具名 | 说明 |
|--------|------|
| `siyuan_create_doc` | 用 Markdown 内容创建新文档 |
| `siyuan_rename_doc` | 重命名文档 |
| `siyuan_remove_doc` | 按文档 ID 删除文档；若存在子文档则需 `force=true` 二次确认 |
| `siyuan_move_doc` | 移动文档到其他目录或笔记本 |
| `siyuan_export_markdown` | 导出文档为完整 Markdown 内容 |

### 块级操作
| 工具名 | 说明 |
|--------|------|
| `siyuan_insert_block` | 在指定位置插入块 |
| `siyuan_prepend_block` | 在父块开头插入块 |
| `siyuan_append_block` | 在父块末尾追加块 |
| `siyuan_update_block` | 更新块内容 |
| `siyuan_delete_block` | 删除块；若目标是带子文档的文档根块则需 `force=true` 二次确认 |
| `siyuan_get_block_kramdown` | 获取块的 Kramdown 内容 |
| `siyuan_get_child_blocks` | 获取子块列表 |

### 块属性
| 工具名 | 说明 |
|--------|------|
| `siyuan_get_block_attrs` | 获取块的自定义属性 |
| `siyuan_set_block_attrs` | 设置块的自定义属性 |

### SQL 查询
| 工具名 | 说明 |
|--------|------|
| `siyuan_sql_query` | 执行 SQL 查询思源数据库 |

### 系统通知
| 工具名 | 说明 |
|--------|------|
| `siyuan_get_version` | 获取思源版本信息 |
| `siyuan_push_notification` | 向思源 UI 推送通知弹窗 |

## SQL 查询示例

```sql
-- 搜索包含关键词的块
SELECT id, content, type, hpath FROM blocks WHERE content LIKE '%关键词%' LIMIT 20

-- 列出某笔记本的所有文档
SELECT id, hpath, created, updated FROM blocks WHERE type='d' AND box='笔记本ID' ORDER BY updated DESC

-- 查找最近修改的文档
SELECT id, hpath, updated FROM blocks WHERE type='d' ORDER BY updated DESC LIMIT 10

-- 按标签搜索
SELECT id, content, hpath FROM blocks WHERE tag LIKE '%标签名%' LIMIT 20
```

## 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `SIYUAN_TOKEN` | ✅ | 思源 API Token |
| `SIYUAN_BASE_URL` | ❌ | 思源地址，默认 `http://127.0.0.1:6806` |

## 致谢

本项目参考了思源笔记（SiYuan Note）官方 API 文档开发，感谢思源笔记团队提供的开放 API 接口。

- 思源笔记官方仓库：[github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- 思源笔记 API 文档：[API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
