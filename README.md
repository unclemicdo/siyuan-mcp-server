# siyuan-mcp-server

[English](./README_en.md) | [中文](./README.md)

`siyuan-mcp-server` 是一个本地 `stdio` MCP Server，让支持 MCP 的 AI 客户端可以直接读取、检索和修改你的思源笔记数据。它适合把思源当作个人知识库、项目档案库或写作仓库来配合 Claude Code、Cursor、Codex CLI 等本地 Agent 使用。

## 为什么有用

常见工作流包括：

- 找到最近更新的日报、会议纪要或项目文档，再追加一段总结
- 导出整篇 Markdown，交给 AI 做摘要、改写或结构整理
- 用 SQL 在 `blocks` 表中按标题、标签、更新时间快速定位目标文档
- 给指定块补充 `custom-*` 属性，配合自己的任务流或元数据规范
- 批量整理笔记本、文档和块，而不是在 GUI 里逐个点开处理

## 安全与隐私

这个 MCP Server 是高权限本地集成。配置好后，客户端会以你的思源 API Token 直接调用思源接口。

- 它默认连接 `http://127.0.0.1:6806`
- 如果你把 `SIYUAN_BASE_URL` 改成非本地地址，Token 和笔记内容会被发送到那个目标
- 如果非本地地址不是 HTTPS，传输中的 Token 和内容可能暴露
- 删除、移动、覆盖更新都属于真实写操作；请把它视为“可直接修改你的知识库”
- `siyuan_sql_query` 现在只允许单条只读 `SELECT` 查询，不允许 `UPDATE`、`DELETE`、`PRAGMA` 或多语句 payload

从本版本开始，Server 在启动时会对非本地或非 HTTPS 的 `SIYUAN_BASE_URL` 输出警告。

## 适用范围

这个项目当前的交付形态是本地 `stdio` MCP Server。

- 适合：能够启动本地 MCP 进程的客户端
- 不适合：把它当作带鉴权、多租户、远程托管的 MCP 网关

## 前置条件

- Node.js 18 或更高版本
- 本地运行中的思源笔记实例
- 一个有效的思源 API Token

你可以在思源笔记里通过 `设置 -> 关于 -> API Token` 获取 Token。

## 本地安装

```bash
npm install
npm run build
```

本仓库默认使用本地构建产物 `dist/index.js` 作为稳定启动路径。

## 配置到客户端

下面的示例都假设你已经执行过 `npm install` 和 `npm run build`，并且把 `/path/to/siyuan-mcp-server` 替换成实际绝对路径。

### Claude Code

推荐先手动确认配置，再视需要使用命令行添加。

手动配置 `~/.claude.json`：

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

命令行添加：

```bash
/mcp add siyuan node /path/to/siyuan-mcp-server/dist/index.js
```

### Claude Desktop

编辑配置文件：

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

推荐直接使用命令行添加：

```bash
codex mcp add siyuan --env SIYUAN_TOKEN=your-siyuan-api-token-here -- node /path/to/siyuan-mcp-server/dist/index.js
```

如果你需要覆盖默认端口或地址，再额外传入 `SIYUAN_BASE_URL`。

例如：

```bash
codex mcp add siyuan \
  --env SIYUAN_TOKEN=your-siyuan-api-token-here \
  --env SIYUAN_BASE_URL=http://127.0.0.1:6807 \
  -- node /path/to/siyuan-mcp-server/dist/index.js
```

## 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `SIYUAN_TOKEN` | 是 | 无 | 思源 API Token |
| `SIYUAN_BASE_URL` | 否 | `http://127.0.0.1:6806` | 思源实例地址；非本地地址会触发启动警告 |

## 真实使用场景

下面这些都是适合直接交给 Agent 的任务：

- “找到最近更新的周报，导出 Markdown 并总结三条风险。”
- “搜索标题里包含 MCP 的文档，给最新一篇末尾追加发布检查清单。”
- “按标签找出所有 `#待整理` 文档，列出路径和最后更新时间。”
- “给这个块设置 `custom-status=done`，并显示当前所有自定义属性。”
- “把某篇归档文档移动到另一个父文档下，保留结构不变。”

## 工具概览

当前共提供 22 个工具：

| 分类 | 工具数量 | 说明 |
| --- | --- | --- |
| 笔记本管理 | 5 | 列出、创建、打开、关闭、重命名笔记本 |
| 文档操作 | 5 | 创建、重命名、删除、移动、导出 Markdown |
| 块级操作 | 7 | 插入、追加、更新、删除块，读取块和子块 |
| 块属性 | 2 | 读取和设置块属性 |
| SQL 查询 | 1 | 只读 `SELECT` 查询 |
| 系统工具 | 2 | 获取版本信息、推送通知 |

更详细的工具说明可直接查看 `src/tools/*.ts` 中的工具描述。

## SQL 查询示例

`siyuan_sql_query` 只接受单条只读 `SELECT`。建议始终加上 `WHERE`、`ORDER BY`、`LIMIT`，避免返回过大的结果集。

```sql
SELECT id, content, type, hpath
FROM blocks
WHERE content LIKE '%关键词%'
ORDER BY updated DESC
LIMIT 20;
```

```sql
SELECT id, hpath, updated
FROM blocks
WHERE type = 'd' AND tag LIKE '%项目%'
ORDER BY updated DESC
LIMIT 10;
```

## 故障排查

### `SIYUAN_TOKEN` 未设置

服务启动会直接报错。请把 Token 配到客户端的 MCP 环境变量里。

### 无法连接思源

请先检查：

- 思源是否正在运行
- `SIYUAN_BASE_URL` 是否写对
- 目标实例到底是本地还是远程

如果你看到 non-local warning，说明当前配置会把 Token 发到本机以外的地址。

### 401 Unauthorized

通常表示 Token 不正确，或者 Token 对应的是另一个思源实例。请确认 Token 来源和 `SIYUAN_BASE_URL` 指向的是同一台思源。

### SQL 结果被截断

`siyuan_sql_query` 的返回文本超过限制时会自动截断。请缩小查询范围，例如增加 `LIMIT`、`WHERE` 或选择更少字段。

## 已知限制

- 当前只支持本地启动的 `stdio` Server，不提供远程托管模式
- 没有额外权限系统；权限边界完全继承思源 API Token
- SQL 工具只支持只读 `SELECT`
- 大结果集会被截断，避免把过量文本直接灌进客户端

## 本地验证

```bash
npm run build
npm test
```

如果要在本地交互式检查协议行为，可以再运行：

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

## 致谢

本项目参考思源笔记官方 API 文档实现。

- SiYuan 官方仓库：[github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- SiYuan API 文档：[API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
