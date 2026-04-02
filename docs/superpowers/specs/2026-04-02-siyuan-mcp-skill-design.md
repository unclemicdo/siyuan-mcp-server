# SiYuan MCP Skill Design

Date: 2026-04-02
Status: Proposed
Target path: `skills/siyuan-mcp-skill/`

## Goal

Create a companion skill for `siyuan-mcp-server` that helps agents use the existing MCP tools more safely, more accurately, and with better knowledge-base workflows.

The skill should prioritize two outcomes:

1. Stable tool usage
2. Better knowledge-base workflows

Stable tool usage comes first. Workflow guidance should build on top of safe and precise tool selection, not replace it.

## Scope

This skill is intended for agents working with SiYuan through MCP, especially in Claude Code and Codex-style environments.

It should help with:

- searching notes and narrowing candidate documents
- reading the right content at the right granularity
- summarizing, tracing, and reorganizing knowledge-base content
- continuing existing documents safely
- reducing misuse of SQL and unnecessary destructive writes

It should not:

- duplicate the full MCP API documentation already provided by tool descriptions
- introduce new MCP tools or server-side workflow endpoints
- become a product manual for every SiYuan feature

## Design Principles

The skill should follow these principles:

- Keep `SKILL.md` short and high-signal so it remains easy to trigger and cheap to load
- Put detailed examples, templates, and edge-case guidance into `references/`
- Prefer default-safe behaviors over aggressive editing
- Encourage source-grounded outputs for summaries and conclusions
- Stay mostly platform-neutral so the same skill body is useful for both Claude and Codex style agents

## Directory Structure

The skill will live in the repository at:

```text
skills/siyuan-mcp-skill/
├── SKILL.md
└── references/
    ├── workflows.md
    ├── sql-patterns.md
    └── safety-rules.md
```

This repository copy should also be suitable for installation into an agent skill directory later.

## SKILL.md Responsibilities

`SKILL.md` should contain only the high-frequency guidance an agent needs before taking action.

Recommended structure:

```md
---
name: siyuan-mcp-skill
description: Use when working with SiYuan notes through an MCP server to search, trace, summarize, reorganize, or update existing knowledge-base content, especially when safe write behavior and precise source-grounded retrieval matter.
---

# SiYuan MCP Skill

## When to Use
## Default Strategy
## Tool Selection Order
## Write Safely
## When to Read References
```

`SKILL.md` should cover:

- when the skill applies
- the default retrieval and editing strategy
- concise tool selection rules
- the minimum write-safety rules
- how to choose the right reference file

`SKILL.md` should not contain long SQL catalogs, verbose examples, or repeated tool argument documentation.

## Reference Files

### `references/workflows.md`

This file should expand the main knowledge-base workflows:

- retrieve and summarize
- trace a topic or entity across time
- continue writing inside an existing document
- reorganize notebook or document structure

Each workflow should include:

- when to use it
- default tool order
- common mistakes to avoid

### `references/sql-patterns.md`

This file should contain practical read-only query templates for retrieval.

It should cover patterns such as:

- finding candidate blocks by keyword
- finding documents by title or document type
- filtering by tag
- finding recently updated documents
- locating meeting notes or logs in a time range
- narrowing a topic before full reads

Each pattern should reinforce:

- explicit field selection over `SELECT *` when practical
- use of `WHERE`
- use of `LIMIT`
- SQL as a retrieval accelerator, not a default first tool for every task

### `references/safety-rules.md`

This file should contain pre-write safety guidance for risky operations.

It should cover:

- reading before updating a block
- verifying target content before deleting a block
- checking descendant impact before removing a document
- confirming source and destination before moving documents
- explaining impact before batch or structural changes

## Triggering Strategy

The description should describe only when to use the skill, not how the workflow operates.

Target description:

`Use when working with SiYuan notes through an MCP server to search, trace, summarize, reorganize, or update existing knowledge-base content, especially when safe write behavior and precise source-grounded retrieval matter.`

This should trigger for requests involving:

- knowledge-base search and synthesis
- note-based timeline reconstruction
- summarizing from existing SiYuan content
- continuing or appending to existing notes
- reorganizing documents or notebooks
- risky changes such as updates, moves, and deletions

## Core Operating Rules

The skill should teach these default rules:

1. Locate first, then read deeply
   Start by narrowing scope with notebook listing or a bounded SQL query, then read the most relevant documents or blocks.

2. Read at the smallest useful scope
   Use full document export when document-level context matters. Use block reads when the task is block-local.

3. Write with the smallest safe change
   Prefer append operations for adding material. Use update only when replacing existing content is explicitly needed. Use insert or prepend only when position matters.

4. Explain or confirm risky impact before destructive changes
   Before deletes, moves, or broad overwrites, determine what will be affected and make that impact explicit.

5. Use SQL as a targeted retrieval tool
   Prefer specialized tools when they directly fit the task. Use SQL for cross-document retrieval, filtering, ranking candidates, and narrowing large search spaces.

6. Keep outputs source-grounded
   Summaries, timelines, and roadmap-style outputs should preserve source identifiers such as document IDs, paths, titles, or time evidence when available.

## Tool Selection Order

The skill should encode this default order:

1. Use `siyuan_list_notebooks` when the task starts from notebook scope or structure.
2. Use `siyuan_sql_query` for bounded retrieval across many notes.
3. Use `siyuan_export_markdown` when full document context matters.
4. Use `siyuan_get_block_kramdown` or child block listing when operating at block scope.
5. Use `siyuan_append_block` by default for additive writing.
6. Use `siyuan_update_block` only for deliberate replacement.
7. Use delete or move operations only after impact has been checked.

## Primary Workflows

The skill should explicitly support four main workflows.

### 1. Retrieve and summarize

- narrow candidate content first
- read the top relevant documents
- synthesize with source references

### 2. Trace a timeline or topic

- locate related documents
- sort or interpret by time markers
- extract events, decisions, promises, and follow-ups

### 3. Continue an existing document

- read the target document or target block first
- decide between append and update
- default to append unless the user clearly wants a rewrite

### 4. Reorganize structure

- inspect notebook or document structure first
- identify move targets and scope
- make structural impact explicit before execution

## Validation Standard

The completed skill should satisfy these checks:

- `SKILL.md` stays concise and does not repeat API docs
- trigger language is broad enough for Claude and Codex style phrasing
- high-frequency rules remain in `SKILL.md`, detail stays in `references/`
- the skill improves both safety and retrieval quality
- the skill clearly supports the four primary workflows above

## Open Questions

No open design questions remain for the first version.

The first implementation should stay intentionally small. If future usage shows repeated failure modes, the skill can add more reference patterns without expanding `SKILL.md` substantially.
