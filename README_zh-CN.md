# siyuan-mcp-server

[English](./README.md) | [简体中文](./README_zh-CN.md) | [繁體中文](./README_zh-TW.md) | [Español](./README_es.md) | [한국어](./README_ko.md)

`siyuan-mcp-server` 是一个本地 `stdio` MCP Server，让支持 MCP 的 AI 客户端可以直接访问你的思源笔记。配置完成后，你可以把它接到 Claude Code、Cursor、Codex CLI 等客户端，让 AI 直接帮你读取、检索、整理和修改思源内容，把笔记从“存放信息的地方”变成“可以直接协作的个人知识库”。

## 它能帮你做什么

接入后，Agent 不只是“读一篇笔记”，而是可以跨多篇文档理解上下文，帮你把分散的信息串起来。比较有价值的场景包括：

- 从日报、周报、会议纪要、项目文档里还原某件事的来龙去脉
- 基于你已有的知识库内容，总结阶段进展、风险、决策和未完成事项
- 把分散在多篇笔记里的想法、待办、承诺和结论整理成一份可执行输出
- 延续你已有文档继续写，而不是每次都从空白开始
- 整理笔记本、文档和块的结构，减少手动点选和重复搬运

你通常不需要自己写 SQL，也不需要自己维护块属性。只要把需求直接告诉 Agent，它会调用合适的工具来完成。

例如，你可以直接这样说：

- “回顾最近 30 天所有和 Alpha 项目相关的日报、周报、会议纪要，整理成一份进展摘要，包含关键决策、当前风险、未完成事项和下一步。”
- “把我这两周的会议纪要和工作日志串起来，帮我找出重复出现的问题、被多次提到的待办，以及哪些承诺还没有落地。”
- “根据我过去一个月的产品笔记、需求记录和周报，整理一版当前 roadmap 草稿，并标注每个结论主要来自哪些文档。”
- “找到最近一次提到某个客户的所有笔记，按时间线梳理背景、沟通纪要、答应过的事项和后续动作。”
- “把这个主题下分散的资料汇总后，生成一版结构更清晰的总结稿，并追加到指定文档末尾。”

## 安装说明

### 前置条件

- Node.js 18 或更高版本
- 本地运行中的思源笔记实例
- 一个有效的思源 API Token

你可以在思源笔记里通过 `设置 -> 关于 -> API Token` 获取 Token。

### 获取代码

```bash
git clone https://github.com/unclemicdo/siyuan-mcp-server.git
cd siyuan-mcp-server
```

### 安装依赖并构建

```bash
npm install
npm run build
```

本仓库默认使用本地构建产物 `dist/index.js` 作为稳定启动路径。

### 自动安装

如果你使用的是支持 MCP 管理命令的 Agent，可以直接让它帮你添加配置。下面这些命令也可以由你自己手动执行。

下面的示例都假设你已经执行过 `npm install` 和 `npm run build`，并且把 `/path/to/siyuan-mcp-server` 替换成实际绝对路径。

#### Claude Code

```bash
claude mcp add -e SIYUAN_TOKEN=your-siyuan-api-token-here siyuan -- node /path/to/siyuan-mcp-server/dist/index.js
```

如果你需要覆盖默认端口或地址，再额外传入 `-e SIYUAN_BASE_URL=http://127.0.0.1:6807`。

#### Codex CLI

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

### 手动安装

如果你更习惯自己管理配置，或者所用客户端没有自动添加命令，可以手动写配置文件。

#### Claude Code

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

#### Claude Desktop

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

#### Cursor

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

### 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `SIYUAN_TOKEN` | 是 | 无 | 思源 API Token |
| `SIYUAN_BASE_URL` | 否 | `http://127.0.0.1:6806` | 思源实例地址；非本地地址会触发启动警告 |

### 安装后验证

完成安装和配置后，建议至少做一次本地验证：

```bash
npm test
```

如果你想在本地交互式检查协议行为，可以再运行：

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

### 可选 companion Skill

本仓库还附带了一个可选的 companion Skill，路径在 `skills/siyuan-mcp-skill/`。

这个 Skill 不会新增 MCP 工具，而是让 Agent 更稳定地使用现有的思源工具来做检索、追溯、汇总和安全写入。

如果你的 Agent 支持本地 Skill，可以把它复制到 Skill 目录里。对 Codex 风格环境，安装方式如下：

```bash
mkdir -p ~/.agents/skills
rm -rf ~/.agents/skills/siyuan-mcp-skill
cp -R skills/siyuan-mcp-skill ~/.agents/skills/
```

安装后，在支持显式调用 Skill 的环境里，你可以这样触发：

- Codex 风格：`$siyuan-mcp-skill`
- Claude Code 风格：`/siyuan-mcp-skill`

适合的场景包括：跨多篇笔记检索信息、按时间线追溯主题、基于现有文档续写，以及在这个 MCP 上做更稳妥的写操作。

## 功能介绍

当前共提供 22 个工具，主要分成下面几类：

| 分类 | 工具数量 | 说明 |
| --- | --- | --- |
| 笔记本管理 | 5 | 列出、创建、打开、关闭、重命名笔记本 |
| 文档操作 | 5 | 创建、重命名、删除、移动、导出 Markdown |
| 块级操作 | 7 | 插入、追加、更新、删除块，读取块和子块 |
| 块属性 | 2 | 读取和设置块属性 |
| SQL 查询 | 1 | 只读 `SELECT` 查询 |
| 系统工具 | 2 | 获取版本信息、推送通知 |

从普通用户的角度，可以把这些能力理解为：

- 找内容：按标题、标签、更新时间或内容范围定位文档和块
- 读内容：读取块内容、导出整篇 Markdown、获取笔记结构
- 改内容：追加段落、更新块、创建或移动文档
- 整理结构：管理笔记本、移动文档、插入或删除块

作为个人知识库使用时，它真正有价值的地方是：Agent 可以在你的真实上下文里工作，而不是只回答通用问题。它可以基于你已经写过的笔记继续总结、追踪、归纳和整理。

其中有两类属于进阶能力：

- `siyuan_sql_query`：提供给 Agent 更高效地检索内容用。普通用户通常不需要自己写 SQL。
- 块属性工具：如果你已经在自己的工作流里使用 `custom-*` 属性，Agent 也可以帮你读取或更新；如果你没有这类用法，可以忽略。

更详细的工具说明可直接查看 `src/tools/*.ts` 中的工具描述。

## 注意事项

这个 MCP Server 是高权限本地集成。配置好后，客户端会以你的思源 API Token 直接调用思源接口。

- 它默认连接 `http://127.0.0.1:6806`
- 如果你把 `SIYUAN_BASE_URL` 改成非本地地址，Token 和笔记内容会被发送到那个目标
- 如果非本地地址不是 HTTPS，传输中的 Token 和内容可能暴露
- 删除、移动、覆盖更新都属于真实写操作；请把它视为“可直接修改你的知识库”
- `siyuan_sql_query` 只允许单条只读 `SELECT` 查询，不允许 `UPDATE`、`DELETE`、`PRAGMA` 或多语句 payload

从本版本开始，Server 在启动时会对非本地或非 HTTPS 的 `SIYUAN_BASE_URL` 输出警告。

另外，这个项目当前的交付形态是本地 `stdio` MCP Server：

- 适合：能够启动本地 MCP 进程的客户端
- 不适合：把它当作带鉴权、多租户、远程托管的 MCP 网关

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

## 致谢

本项目参考思源笔记官方 API 文档实现。

- SiYuan 官方仓库：[github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- SiYuan API 文档：[API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
