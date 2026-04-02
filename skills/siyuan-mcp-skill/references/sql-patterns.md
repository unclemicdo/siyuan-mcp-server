# SiYuan MCP SQL Patterns

Use SQL to narrow candidates across many notes. Keep queries read-only, bounded, and retrieval-oriented.

## Selection Rules

- Prefer explicit fields over `SELECT *` when practical.
- Add `WHERE` clauses to keep results relevant.
- Add `LIMIT` unless the result set is known to be small.
- Use SQL to find candidates, then read the actual document or block before making claims or edits.

## Find Recent Mentions Of A Topic

```sql
SELECT id, root_id, hpath, content, updated
FROM blocks
WHERE content LIKE '%Alpha%'
ORDER BY updated DESC
LIMIT 10;
```

Use when a topic may appear across many notes and recent mentions matter.

## Find Documents By Title

```sql
SELECT id, box, hpath, content, updated
FROM blocks
WHERE type = 'd' AND content LIKE '%周报%'
ORDER BY updated DESC
LIMIT 20;
```

Use when the note title or document naming pattern is known.

## Find Candidate Notes By Tag

```sql
SELECT id, hpath, tag, updated
FROM blocks
WHERE tag LIKE '%project-alpha%'
ORDER BY updated DESC
LIMIT 20;
```

Use when tags are more reliable than plain-text search.

## Find Recently Updated Documents In A Notebook

```sql
SELECT id, box, hpath, updated
FROM blocks
WHERE type = 'd' AND box = 'NOTEBOOK_ID'
ORDER BY updated DESC
LIMIT 20;
```

Use after discovering the notebook ID through notebook tools.

## Find Notes In A Time Range

```sql
SELECT id, hpath, content, created, updated
FROM blocks
WHERE type = 'd'
  AND created >= '20260101000000'
  AND created <= '20260131235959'
ORDER BY created ASC
LIMIT 50;
```

Use when reconstructing a month, sprint, or incident window.

## Find Meeting Notes Or Logs

```sql
SELECT id, hpath, content, updated
FROM blocks
WHERE type = 'd'
  AND (content LIKE '%会议%' OR content LIKE '%meeting%' OR content LIKE '%纪要%')
ORDER BY updated DESC
LIMIT 20;
```

Use when the exact notebook or title is unknown but the note class is predictable.

## Find Notes About A Person Or Customer

```sql
SELECT id, hpath, content, updated
FROM blocks
WHERE content LIKE '%Acme%'
ORDER BY updated DESC
LIMIT 20;
```

Use to assemble a first pass before reading source notes for timeline or action items.

## Find A Document Root Before Block-Level Reading

```sql
SELECT id, root_id, parent_id, hpath, content
FROM blocks
WHERE content LIKE '%付款延期%'
ORDER BY updated DESC
LIMIT 10;
```

Use when you need to jump from a matching block to its surrounding document.
