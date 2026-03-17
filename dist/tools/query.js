// SQL 查询工具
// 覆盖：执行 SQL 查询思源数据库，支持全文搜索和复杂过滤
import { z } from "zod";
import { siyuanPost, handleSiyuanError } from "../services/siyuan.js";
import { CHARACTER_LIMIT } from "../constants.js";
export function registerQueryTools(server) {
    server.registerTool("siyuan_sql_query", {
        title: "Execute SiYuan SQL Query",
        description: `对思源笔记的 SQLite 数据库执行 SQL 查询，支持复杂搜索和数据分析。

思源笔记将所有内容存储在 SQLite 数据库中，主要表包括：
- blocks: 所有块（文档、段落、列表项、标题等）
  - 字段: id, parent_id, root_id, hash, box(笔记本ID), path, hpath, name, alias, memo,
          tag, content, fcontent, markdown, length, type, subtype, ial, sort, created, updated
- refs: 块引用关系
- spans: 文本片段和行内元素
- assets: 资源文件（图片等）
- attributes: 自定义属性

常用查询示例：
- 搜索包含关键词的块: SELECT * FROM blocks WHERE content LIKE '%关键词%' LIMIT 20
- 按笔记本列出文档: SELECT * FROM blocks WHERE type='d' AND box='笔记本ID'
- 查找最近修改: SELECT * FROM blocks WHERE type='d' ORDER BY updated DESC LIMIT 10
- 搜索标签: SELECT * FROM blocks WHERE tag LIKE '%标签名%'
- 全文搜索: SELECT * FROM blocks WHERE content MATCH '关键词' LIMIT 20

Args:
  - stmt (string): 要执行的 SQL 语句（仅支持 SELECT，不支持 INSERT/UPDATE/DELETE）

Returns JSON: 查询结果数组，每行为一个对象
[
  { "id": "...", "content": "...", "type": "d", ... },
  ...
]

注意：结果超过 ${CHARACTER_LIMIT} 字符时会自动截断`,
        inputSchema: z
            .object({
            stmt: z
                .string()
                .min(1, "SQL 语句不能为空")
                .describe("要执行的 SQL 语句，如 \"SELECT * FROM blocks WHERE content LIKE '%关键词%' LIMIT 20\""),
        })
            .strict(),
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ stmt }) => {
        try {
            const rows = await siyuanPost("/api/query/sql", { stmt });
            const result = rows ?? [];
            let text = JSON.stringify(result, null, 2);
            if (text.length > CHARACTER_LIMIT) {
                // 截断至约一半条目
                const half = Math.max(1, Math.floor(result.length / 2));
                const truncated = result.slice(0, half);
                text =
                    JSON.stringify(truncated, null, 2) +
                        `\n\n[结果已截断：共 ${result.length} 行，显示前 ${half} 行。请添加 LIMIT 或 WHERE 条件缩小结果集。]`;
            }
            return { content: [{ type: "text", text }] };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
}
//# sourceMappingURL=query.js.map