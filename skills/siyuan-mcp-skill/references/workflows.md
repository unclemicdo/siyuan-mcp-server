# SiYuan MCP Workflows

## Retrieve And Summarize

Use this flow when the request asks for a summary, recap, synthesis, progress report, risk review, or roadmap draft based on existing notes.

Default tool order:

1. Use `siyuan_list_notebooks` when notebook scope matters.
2. Use `siyuan_sql_query` to find candidate documents or blocks with a bounded query.
3. Use `siyuan_export_markdown` on the most relevant documents.
4. Summarize from the read set and keep source identifiers in the output.

Expected output:

- a concise synthesis
- grouped findings such as decisions, risks, blockers, or next steps
- source grounding with document IDs, `hpath`, titles, or time markers

Common mistakes:

- reading too many documents before narrowing
- using SQL as the final evidence instead of reading the actual note content
- presenting conclusions without sources

## Trace A Timeline Or Topic

Use this flow when the request asks what happened over time, how a project evolved, or where a customer, issue, or decision was mentioned.

Default tool order:

1. Use `siyuan_sql_query` to locate candidate notes by topic, name, tag, or date range.
2. Sort candidates by `created`, `updated`, or another visible time marker.
3. Use `siyuan_export_markdown` or `siyuan_get_block_kramdown` to confirm the relevant passages.
4. Build a timeline with events, decisions, commitments, and follow-ups.

Expected output:

- ordered events
- supporting notes for each event when possible
- unresolved items or missing follow-ups called out explicitly

Common mistakes:

- relying on `updated` timestamps alone when the note content contains clearer time evidence
- merging repeated mentions into one event without checking chronology
- skipping the original text before asserting a decision or promise

## Continue An Existing Document

Use this flow when the request asks to continue, extend, update, or clean up an existing note.

Default tool order:

1. Read the target with `siyuan_export_markdown` or `siyuan_get_block_kramdown`.
2. Decide whether the task is additive or replacement.
3. Use `siyuan_append_block` for additive writing.
4. Use `siyuan_update_block` only when replacing existing content is required.
5. Use `siyuan_insert_block` or `siyuan_prepend_block` only when exact placement matters.

Expected output:

- a change that preserves surrounding context
- minimal disruption to existing content
- clear mention of what was appended or replaced

Common mistakes:

- updating a block without first reading it
- using overwrite when append would satisfy the request
- editing the whole document when only one block needs to change

## Reorganize Structure

Use this flow when the request asks to move documents, clean up notebooks, merge scattered material, or adjust note structure.

Default tool order:

1. Use `siyuan_list_notebooks` or `siyuan_sql_query` to inspect current placement.
2. Use `siyuan_get_child_blocks` or document queries to confirm structure.
3. State the planned movement or reorganization scope.
4. Use `siyuan_move_doc`, `siyuan_insert_block`, `siyuan_prepend_block`, or `siyuan_append_block` as needed.
5. Re-read the affected target when the task is structurally sensitive.

Expected output:

- clear description of what moved or changed
- minimal unnecessary structural churn
- preserved document relationships

Common mistakes:

- moving items before confirming the destination type
- making multiple structural changes without first describing the plan
- deleting original material before verifying the destination result
