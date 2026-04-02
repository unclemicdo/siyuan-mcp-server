---
name: siyuan-mcp-skill
description: Use when working with SiYuan notes through an MCP server to search, trace, summarize, reorganize, or update existing knowledge-base content, especially when safe write behavior and precise source-grounded retrieval matter.
---

# SiYuan MCP Skill

## Overview

Use this skill to work inside an existing SiYuan knowledge base without treating the MCP like a generic database. Favor bounded retrieval, minimal reads, additive writes, and source-grounded outputs.

## Default Strategy

- Narrow scope before reading deeply. Start with notebook listing or a bounded SQL query, then read only the highest-signal documents or blocks.
- Read at the smallest useful scope. Use full document export for document-level context and block reads for block-local work.
- Keep outputs traceable. When summarizing, tracing, or drafting from notes, preserve document IDs, paths, titles, or time evidence when available.

## Tool Selection Order

- Start with `siyuan_list_notebooks` for notebook-level scope or structure questions.
- Use `siyuan_sql_query` to locate candidates across many notes. Keep queries retrieval-oriented and bounded.
- Use `siyuan_export_markdown` when full document context matters.
- Use `siyuan_get_block_kramdown` or `siyuan_get_child_blocks` for block-local edits and structure checks.
- Prefer `siyuan_append_block` for additive writing.
- Use `siyuan_update_block` only for deliberate replacement.
- Use move or delete tools only after checking impact.

## Write Safely

- Read the target before changing it.
- Default to append rather than overwrite.
- Explain impact before moving, deleting, or broadly rewriting content.
- Treat SQL as retrieval only, not as a substitute for dedicated write tools.

## Reference Guide

- Read `references/workflows.md` for retrieval, timeline tracing, continuation, and reorganization workflows.
- Read `references/sql-patterns.md` for bounded query templates and selection rules.
- Read `references/safety-rules.md` before risky or structural changes.
