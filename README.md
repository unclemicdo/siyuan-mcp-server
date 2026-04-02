# siyuan-mcp-server

[English](./README.md) | [简体中文](./README_zh-CN.md) | [繁體中文](./README_zh-TW.md) | [Español](./README_es.md) | [한국어](./README_ko.md)

`siyuan-mcp-server` is a local `stdio` MCP server that gives MCP-capable AI clients direct access to your SiYuan notes. This repository also ships an optional companion skill for agents that support local skills. Once configured, you can connect it to tools such as Claude Code, Cursor, or Codex CLI and let the agent read, retrieve, reorganize, and update your notes, turning SiYuan from a place where information is stored into a personal knowledge base the agent can actively work with.

## What it helps with

Once connected, the agent is not limited to reading a single note. It can work across many notes and recover context from your knowledge base. High-value use cases include:

- reconstructing the history of a project from daily notes, weekly reports, meeting notes, and project docs
- summarizing progress, risks, decisions, and unfinished work from what you have already written
- turning scattered notes, commitments, and conclusions into one actionable output
- continuing an existing draft from your real context instead of starting from a blank page
- reorganizing notebooks, documents, and blocks without clicking through the GUI

Most users do not need to write SQL or manage block attributes themselves. You can describe the outcome you want, and the agent can call the right tools for you.

For example:

- "Review all daily notes, weekly reports, and meeting notes related to Project Alpha from the last 30 days, then produce a progress summary with key decisions, current risks, open items, and next steps."
- "Connect my meeting notes and work logs from the last two weeks, identify repeated problems, recurring action items, and promises that still have not been closed."
- "Use my recent product notes, requirement drafts, and weekly reports to assemble a current roadmap draft, and show which documents support each major conclusion."
- "Find every recent note about this customer and build a timeline of context, communication history, commitments, and follow-up actions."
- "Gather the scattered material for this topic, rewrite it into a clearer structured summary, and append the result to the target document."

## Installation

### Requirements

- Node.js 18 or later
- A running SiYuan instance
- A valid SiYuan API token

You can find the token in `Settings -> About -> API Token` inside SiYuan.

### Get the code

```bash
git clone https://github.com/unclemicdo/siyuan-mcp-server.git
cd siyuan-mcp-server
```

### Install dependencies and build

```bash
npm install
npm run build
```

The stable launch path is the local build artifact at `dist/index.js`.

### Automatic setup

If your agent/client supports MCP management commands, you can let it add the configuration for you. You can also run the same commands yourself.

All examples below assume you already ran `npm install` and `npm run build`, and that `/path/to/siyuan-mcp-server` is your actual absolute path.

#### Claude Code

```bash
claude mcp add -e SIYUAN_TOKEN=your-siyuan-api-token-here siyuan -- node /path/to/siyuan-mcp-server/dist/index.js
```

If you need a different port or host, add `-e SIYUAN_BASE_URL=http://127.0.0.1:6807`.

#### Codex CLI

```bash
codex mcp add siyuan --env SIYUAN_TOKEN=your-siyuan-api-token-here -- node /path/to/siyuan-mcp-server/dist/index.js
```

If you need to override the default port or address, pass `SIYUAN_BASE_URL` as another environment variable.

Example:

```bash
codex mcp add siyuan \
  --env SIYUAN_TOKEN=your-siyuan-api-token-here \
  --env SIYUAN_BASE_URL=http://127.0.0.1:6807 \
  -- node /path/to/siyuan-mcp-server/dist/index.js
```

### Manual setup

If you prefer to manage config files yourself, or your client does not offer an add command, use one of the manual options below.

#### Claude Code

Manual `~/.claude.json`:

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

Edit the config file:

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

Create `.cursor/mcp.json` in your project root:

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

### Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `SIYUAN_TOKEN` | Yes | none | SiYuan API token |
| `SIYUAN_BASE_URL` | No | `http://127.0.0.1:6806` | SiYuan base URL; non-local targets trigger startup warnings |

### Verify after setup

After installation and client configuration, it is worth running at least one local verification step:

```bash
npm test
```

For interactive protocol checks:

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

### Optional companion skill

This repository also ships an optional companion skill at `skills/siyuan-mcp-skill/`.

The skill does not add new MCP tools. It teaches agents how to use the existing SiYuan tools more reliably for retrieval, tracing, synthesis, and safe writes.

If your agent supports local skills, install it by copying the directory into your skill home. For Codex-style environments:

```bash
mkdir -p ~/.agents/skills
rm -rf ~/.agents/skills/siyuan-mcp-skill
cp -R skills/siyuan-mcp-skill ~/.agents/skills/
```

After installation, you can invoke it explicitly in environments that support skill invocation:

- Codex-style: `$siyuan-mcp-skill`
- Claude Code style: `/siyuan-mcp-skill`

Use it when you want the agent to search across notes, trace timelines, continue an existing document, or make safer write decisions with this MCP.

## Features

The server currently exposes 22 tools across these groups:

| Category | Count | Description |
| --- | --- | --- |
| Notebook management | 5 | List, create, open, close, and rename notebooks |
| Document operations | 5 | Create, rename, delete, move, and export Markdown |
| Block operations | 7 | Insert, append, update, delete, and inspect blocks |
| Block attributes | 2 | Read and write custom block metadata |
| SQL query | 1 | Read-only `SELECT` queries |
| System tools | 2 | Get version info and push notifications |

From a regular user's perspective, that mainly means:

- finding content by title, tag, update time, or content scope
- reading content as blocks, document structure, or full Markdown
- changing content by appending sections, updating blocks, or creating and moving docs
- reorganizing structure across notebooks, documents, and blocks

As a personal knowledge base integration, the real value is that the agent can work inside your own context instead of giving generic answers. It can continue from your notes, summarize them, trace decisions across them, and organize them for you.

Two areas are more advanced:

- `siyuan_sql_query` exists so an agent can perform more efficient retrieval when needed. Most users will never need to write SQL directly.
- Block attribute tools are useful if you already rely on `custom-*` metadata in your own workflow. If you do not use that pattern, you can ignore them.

For the exact tool wording, see the descriptions in `src/tools/*.ts`.

## Notes and limitations

This server is a high-privilege local integration. Once configured, the client talks to SiYuan with your API token.

- The default target is `http://127.0.0.1:6806`
- If you point `SIYUAN_BASE_URL` at a non-local address, your token and note content will be sent there
- If that non-local target is not using HTTPS, your token and content may be exposed in transit
- Delete, move, and update tools perform real writes against your knowledge base
- `siyuan_sql_query` accepts only a single read-only `SELECT` statement and rejects `UPDATE`, `DELETE`, `PRAGMA`, and multi-statement payloads

Starting with this version, the server prints warnings at startup when `SIYUAN_BASE_URL` is non-local or non-HTTPS.

This project currently ships as a local `stdio` MCP server:

- Good fit: clients that can launch a local MCP process
- Not a fit: a hosted, multi-tenant, remotely managed MCP gateway

## Troubleshooting

### `SIYUAN_TOKEN` is missing

The server exits on startup. Add the token to the MCP server environment in your client config.

### Cannot connect to SiYuan

Check:

- whether SiYuan is running
- whether `SIYUAN_BASE_URL` is correct
- whether the configured target is local or remote

If you see a non-local warning, the current setup will send your token off-host.

### 401 Unauthorized

The token is usually wrong, expired, or belongs to another SiYuan instance. Make sure the token source and `SIYUAN_BASE_URL` refer to the same instance.

### SQL results are truncated

Large query results are truncated intentionally. Add `LIMIT`, `WHERE`, or select fewer columns.

## Known limitations

- It supports only a locally launched `stdio` server, not a hosted remote MCP service
- There is no extra permission layer beyond the SiYuan API token
- The SQL tool supports read-only `SELECT` only
- Large result sets are truncated before they reach the client

## Acknowledgments

This project is implemented with reference to the official SiYuan API documentation.

- SiYuan repo: [github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- SiYuan API docs: [API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
