# siyuan-mcp-server

[English](./README_en.md) | [中文](./README.md)

A local MCP server for [SiYuan Note](https://github.com/siyuan-note/siyuan), allowing AI assistants (Claude Code, Cursor, etc.) to directly interact with your SiYuan data via the Model Context Protocol (MCP).

## Features Overview

Provides **22 MCP tools**, covering core SiYuan operations:

| Category | Tools | Description |
|----------|-------|-------------|
| Notebooks | 5 | List, create, open, close, and rename notebooks |
| Documents | 5 | Create, rename, delete, move documents, and export as Markdown |
| Blocks | 7 | Insert, append, update, delete blocks, read block content and children |
| Attributes | 2 | Get and set custom key-value block attributes |
| SQL Query | 1 | Execute SQL queries in the SiYuan database (supports full-text search) |
| System | 2 | Get version info, push notifications to the SiYuan UI |

## Prerequisites

- Node.js ≥ 18
- SiYuan Note running locally (default port `6806`)
- SiYuan API Token (Settings -> About -> API Token)

## Installation

```bash
cd siyuan-mcp-server
npm install
npm run build
```

## AI Client Configuration

This MCP server is compatible with any AI client that supports the [MCP Protocol](https://modelcontextprotocol.io). Here is how to configure it for the most popular clients.

> **General Instructions:**
> - Replace `/path/to/siyuan-mcp-server` with your actual absolute path.
> - Replace `your-siyuan-api-token-here` with your actual SiYuan Token.
> - If you need to change the SiYuan port, add `"SIYUAN_BASE_URL": "http://127.0.0.1:YOUR_PORT"` to the `env` object.

### Claude Code

Edit `~/.claude.json` (or just run `/mcp add` in Claude Code):

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

Edit the Claude Desktop config file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

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

Create a `.cursor/mcp.json` file in your project root:

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

Edit `~/.codex/config.json`:

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

## Testing with MCP Inspector

```bash
SIYUAN_TOKEN=your_token npx @modelcontextprotocol/inspector node dist/index.js
```

## Tools List

### Notebook Management
| Tool Name | Description |
|-----------|-------------|
| `siyuan_list_notebooks` | List all notebooks (ID, name, closed status) |
| `siyuan_create_notebook` | Create a new notebook |
| `siyuan_open_notebook` | Open/activate a closed notebook |
| `siyuan_close_notebook` | Close a notebook (does not delete data) |
| `siyuan_rename_notebook` | Rename a notebook |

### Document Operations
| Tool Name | Description |
|-----------|-------------|
| `siyuan_create_doc` | Create a new document with Markdown content |
| `siyuan_rename_doc` | Rename a document |
| `siyuan_remove_doc` | Delete a document by ID; requires `force=true` if child documents exist |
| `siyuan_move_doc` | Move one or more documents to a target parent document or notebook |
| `siyuan_export_markdown` | Export a document as a full Markdown string |

### Block Operations
| Tool Name | Description |
|-----------|-------------|
| `siyuan_insert_block` | Insert a block at a specific location |
| `siyuan_prepend_block` | Prepend a block inside a parent block |
| `siyuan_append_block` | Append a block inside a parent block |
| `siyuan_update_block` | Update block content |
| `siyuan_delete_block` | Delete a block |
| `siyuan_get_block_kramdown` | Get the Kramdown content of a block |
| `siyuan_get_child_blocks` | Get a list of child blocks |

### Block Attributes
| Tool Name | Description |
|-----------|-------------|
| `siyuan_get_block_attrs` | Get custom attributes of a block |
| `siyuan_set_block_attrs` | Set custom attributes of a block |

### SQL Query
| Tool Name | Description |
|-----------|-------------|
| `siyuan_sql_query` | Execute SQL queries against the SiYuan database |

### System
| Tool Name | Description |
|-----------|-------------|
| `siyuan_get_version` | Get SiYuan version info |
| `siyuan_push_notification` | Push a notification popup to the SiYuan UI |

## SQL Query Examples

```sql
-- Search for blocks containing a keyword
SELECT id, content, type, hpath FROM blocks WHERE content LIKE '%keyword%' LIMIT 20

-- List all documents in a specific notebook
SELECT id, hpath, created, updated FROM blocks WHERE type='d' AND box='notebookID' ORDER BY updated DESC

-- Find recently updated documents
SELECT id, hpath, updated FROM blocks WHERE type='d' ORDER BY updated DESC LIMIT 10

-- Search by tag
SELECT id, content, hpath FROM blocks WHERE tag LIKE '%tagname%' LIMIT 20
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SIYUAN_TOKEN` | ✅ | SiYuan API Token |
| `SIYUAN_BASE_URL` | ❌ | SiYuan Local URL, default is `http://127.0.0.1:6806` |

## Acknowledgments

This project was developed with reference to the official SiYuan Note API documentation. Many thanks to the SiYuan team for providing open API endpoints.

- SiYuan Official Repo: [github.com/siyuan-note/siyuan](https://github.com/siyuan-note/siyuan)
- SiYuan API Documentation: [API.md](https://github.com/siyuan-note/siyuan/blob/master/API.md)
