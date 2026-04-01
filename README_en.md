# siyuan-mcp-server

[English](./README_en.md) | [中文](./README.md)

`siyuan-mcp-server` is a local `stdio` MCP server for SiYuan Note. It lets MCP-capable clients read, search, export, and modify your SiYuan knowledge base directly from tools such as Claude Code, Cursor, and Codex CLI.

## Why it is useful

Typical workflows include:

- find the latest meeting note or daily log and append a follow-up section
- export a full Markdown document for summarization, rewriting, or cleanup
- use SQL against the `blocks` table to locate notes by title, tag, or update time
- attach `custom-*` metadata to blocks as part of your own workflow
- reorganize notebooks, documents, and blocks without clicking through the GUI

## Security and privacy

This server is a high-privilege local integration. Once configured, the client talks to SiYuan with your API token.

- The default target is `http://127.0.0.1:6806`
- If you point `SIYUAN_BASE_URL` at a non-local address, your token and note content will be sent there
- If that non-local target is not using HTTPS, your token and content may be exposed in transit
- Delete, move, and update tools perform real writes against your knowledge base
- `siyuan_sql_query` now accepts only a single read-only `SELECT` statement and rejects `UPDATE`, `DELETE`, `PRAGMA`, and multi-statement payloads

Starting with this version, the server prints warnings at startup when `SIYUAN_BASE_URL` is non-local or non-HTTPS.

## Scope

This project currently ships as a local `stdio` MCP server.

- Good fit: clients that can launch a local MCP process
- Not a fit: a hosted, multi-tenant, remotely managed MCP gateway

## Requirements

- Node.js 18 or later
- A running SiYuan instance
- A valid SiYuan API token

You can find the token in `Settings -> About -> API Token` inside SiYuan.

## Local installation

```bash
npm install
npm run build
```

The stable launch path is the local build artifact at `dist/index.js`.

## Client configuration

All examples below assume you already ran `npm install` and `npm run build`, and that `/path/to/siyuan-mcp-server` is your actual absolute path.

### Claude Code

Prefer confirming the manual config first, then use the CLI shortcut if you want.

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

CLI shortcut:

```bash
/mcp add siyuan node /path/to/siyuan-mcp-server/dist/index.js
```

### Claude Desktop

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

### Cursor

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

### Codex CLI

The recommended setup path is the CLI command:

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

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `SIYUAN_TOKEN` | Yes | none | SiYuan API token |
| `SIYUAN_BASE_URL` | No | `http://127.0.0.1:6806` | SiYuan base URL; non-local targets trigger startup warnings |

## Real usage examples

These are good direct prompts for an agent:

- "Find the most recently updated weekly note, export the Markdown, and summarize the risks."
- "Locate the latest document whose title contains MCP and append a release checklist."
- "Search for all documents tagged `#todo-review` and list their paths and update times."
- "Set `custom-status=done` on this block and show me all current custom attributes."
- "Move this archive document under another parent doc without changing its content."

## Tool overview

The server currently exposes 22 tools:

| Category | Count | Description |
| --- | --- | --- |
| Notebook management | 5 | List, create, open, close, and rename notebooks |
| Document operations | 5 | Create, rename, delete, move, and export Markdown |
| Block operations | 7 | Insert, append, update, delete, and inspect blocks |
| Block attributes | 2 | Read and write custom block metadata |
| SQL query | 1 | Read-only `SELECT` queries |
| System tools | 2 | Get version info and push notifications |

For the exact tool wording, see the descriptions in `src/tools/*.ts`.

## SQL query examples

`siyuan_sql_query` accepts only a single read-only `SELECT`. Always prefer `WHERE`, `ORDER BY`, and `LIMIT` so you do not dump oversized result sets into the client.

```sql
SELECT id, content, type, hpath
FROM blocks
WHERE content LIKE '%keyword%'
ORDER BY updated DESC
LIMIT 20;
```

```sql
SELECT id, hpath, updated
FROM blocks
WHERE type = 'd' AND tag LIKE '%project%'
ORDER BY updated DESC
LIMIT 10;
```

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

## Local verification

```bash
npm run build
npm test
```

For interactive protocol checks:

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

## Acknowledgments

This project is implemented with reference to the official SiYuan API documentation.

- SiYuan repo: [github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- SiYuan API docs: [API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
