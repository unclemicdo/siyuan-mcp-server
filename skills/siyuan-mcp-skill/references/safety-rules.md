# SiYuan MCP Safety Rules

Use these checks before risky or structural changes.

## Before Updating A Block

- Read the current block with `siyuan_get_block_kramdown`.
- Confirm the task truly requires replacement rather than append.
- Preserve nearby structure, headings, and list formatting.
- If the user asked for a rewrite, state which block is being replaced.

## Before Appending Content

- Read the target document or surrounding block first.
- Append only content that belongs to the current context.
- Keep the new block format consistent with the document style.
- Prefer append when the request says "continue", "add", "follow up", or "append".

## Before Deleting A Block

- Read the target block first.
- If the block appears to be a document root or structural container, inspect impact before deletion.
- State what will be removed when the deletion is substantial or ambiguous.

## Before Removing A Document

- Confirm the exact document ID and path.
- Check whether child documents exist and explain the impact.
- Treat document removal as irreversible.
- If the goal is cleanup rather than deletion, consider moving or rewriting first.

## Before Moving Documents

- Confirm both source document IDs and destination target.
- Verify whether the destination is a notebook root or a parent document.
- Explain the planned move when multiple documents are involved.
- Re-read the affected structure after the move when correctness matters.

## Before Broad Or Batch Changes

- Describe the planned scope before executing.
- Prefer minimal changes over sweeping rewrites.
- Keep source content intact until the new structure or content has been verified.
- If a safer additive workflow exists, prefer it.
