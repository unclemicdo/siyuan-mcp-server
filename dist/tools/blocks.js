// 块级操作工具
// 覆盖：插入、追加、更新、删除块，获取块内容和子块列表
import { z } from "zod";
import { siyuanPost, handleSiyuanError, removeBlockById, getBlockLookupById, getDescendantDocumentsById, } from "../services/siyuan.js";
/** 块数据格式枚举 */
const DataTypeSchema = z
    .enum(["markdown", "dom"])
    .default("markdown")
    .describe("块内容的格式：'markdown'（Kramdown/Markdown 格式，推荐）或 'dom'（HTML DOM 格式）");
export function registerBlockTools(server) {
    // ─── 在指定位置插入块 ────────────────────────────────────────────
    server.registerTool("siyuan_insert_block", {
        title: "Insert SiYuan Block",
        description: `在思源笔记中的指定位置插入一个新块。

位置由以下参数之一决定（优先级：nextID > previousID > parentID）：
- nextID: 插入到此块之前（成为其前兄弟）
- previousID: 插入到此块之后（成为其后兄弟）
- parentID: 插入到此块的子级末尾

Args:
  - data (string): 块内容（Markdown 格式或 DOM 格式）
  - dataType ('markdown' | 'dom'): 内容格式，默认 'markdown'
  - nextID (string, 可选): 将在此块 ID 之前插入
  - previousID (string, 可选): 将在此块 ID 之后插入
  - parentID (string, 可选): 将作为此块 ID 的子块插入

Returns JSON:
[
  {
    "id": string,           // 新块 ID
    "doOperations": [...],  // 执行的操作记录
    "undoOperations": [...]
  }
]

示例 (Markdown)：
- data="# 新标题" 插入一个标题块
- data="- 列表项\\n- 另一项" 插入列表块`,
        inputSchema: z
            .object({
            data: z.string().min(1, "块内容不能为空").describe("块内容"),
            dataType: DataTypeSchema,
            nextID: z
                .string()
                .optional()
                .describe("在此块 ID 之前插入（可选）"),
            previousID: z
                .string()
                .optional()
                .describe("在此块 ID 之后插入（可选）"),
            parentID: z
                .string()
                .optional()
                .describe("作为此块 ID 的子块插入（可选）"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
    }, async ({ data, dataType, nextID, previousID, parentID }) => {
        try {
            const body = { data, dataType };
            if (nextID)
                body.nextID = nextID;
            if (previousID)
                body.previousID = previousID;
            if (parentID)
                body.parentID = parentID;
            const result = await siyuanPost("/api/block/insertBlock", body);
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 在父块开头追加块 ────────────────────────────────────────────
    server.registerTool("siyuan_prepend_block", {
        title: "Prepend SiYuan Block",
        description: `在思源笔记中某个父块的开头（最前面）插入一个新块。

Args:
  - data (string): 块内容（Markdown 格式或 DOM 格式）
  - dataType ('markdown' | 'dom'): 内容格式，默认 'markdown'
  - parentID (string): 目标父块的 ID，新块将插入到其子级的最前面

Returns JSON: 同 siyuan_insert_block`,
        inputSchema: z
            .object({
            data: z.string().min(1, "块内容不能为空").describe("块内容"),
            dataType: DataTypeSchema,
            parentID: z
                .string()
                .min(1, "父块 ID 不能为空")
                .describe("目标父块 ID，新块将成为其第一个子块"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
    }, async ({ data, dataType, parentID }) => {
        try {
            const result = await siyuanPost("/api/block/prependBlock", { data, dataType, parentID });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 在父块末尾追加块 ────────────────────────────────────────────
    server.registerTool("siyuan_append_block", {
        title: "Append SiYuan Block",
        description: `在思源笔记中某个父块的末尾追加一个新块。

这是向文档末尾添加内容的最简单方式——将文档 ID 作为 parentID 即可。

Args:
  - data (string): 块内容（Markdown 格式或 DOM 格式）
  - dataType ('markdown' | 'dom'): 内容格式，默认 'markdown'
  - parentID (string): 目标父块/文档的 ID，新块将追加到其最后

Returns JSON: 同 siyuan_insert_block

示例：
- 向文档末尾追加总结段落：parentID=<文档ID>, data="## 总结\\n..."`,
        inputSchema: z
            .object({
            data: z.string().min(1, "块内容不能为空").describe("块内容"),
            dataType: DataTypeSchema,
            parentID: z
                .string()
                .min(1, "父块 ID 不能为空")
                .describe("目标父块/文档 ID，新块将追加到其末尾"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
    }, async ({ data, dataType, parentID }) => {
        try {
            const result = await siyuanPost("/api/block/appendBlock", { data, dataType, parentID });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 更新块内容 ──────────────────────────────────────────────────
    server.registerTool("siyuan_update_block", {
        title: "Update SiYuan Block",
        description: `更新思源笔记中某个块的内容。

Args:
  - id (string): 要更新的块 ID（14 位字母数字字符串）
  - data (string): 新的块内容（Markdown 格式或 DOM 格式）
  - dataType ('markdown' | 'dom'): 内容格式，默认 'markdown'

Returns JSON: 同 siyuan_insert_block

示例：
- 修正一段文字：id=<块ID>, data="修正后的内容"
- 更新代码块：id=<块ID>, data="\`\`\`python\\nprint('hello')\\n\`\`\`"`,
        inputSchema: z
            .object({
            id: z
                .string()
                .min(1, "块 ID 不能为空")
                .describe("要更新的块 ID"),
            data: z.string().min(1, "新内容不能为空").describe("新的块内容"),
            dataType: DataTypeSchema,
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ id, data, dataType }) => {
        try {
            const result = await siyuanPost("/api/block/updateBlock", { id, data, dataType });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 删除块 ──────────────────────────────────────────────────────
    server.registerTool("siyuan_delete_block", {
        title: "Delete SiYuan Block",
        description: `删除思源笔记中的一个块。

⚠️ 警告：如果删除文档块（type='d'），其所有子内容也会被删除。
建议先用 siyuan_get_block_kramdown 确认块内容后再删除。

Args:
  - id (string): 要删除的块 ID（14 位字母数字字符串）
  - force (boolean, 可选): 若该块是包含子文档的文档根块，需显式设为 true 才继续删除

Returns: 操作成功则返回成功消息；若检测到文档根块包含子文档且未传 force=true，则返回警告并中止删除`,
        inputSchema: z
            .object({
            id: z.string().min(1, "块 ID 不能为空").describe("要删除的块 ID"),
            force: z
                .boolean()
                .optional()
                .describe("若该块是包含子文档的文档根块，需显式设为 true 才继续删除"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: false,
            openWorldHint: false,
        },
    }, async ({ id, force }) => {
        try {
            const block = await getBlockLookupById(id);
            if (!block) {
                throw new Error(`Block ${id} not found.`);
            }
            if (block.type === "d") {
                const descendants = await getDescendantDocumentsById(id);
                if (descendants.length > 0 && !force) {
                    const preview = descendants
                        .slice(0, 5)
                        .map((doc) => `- ${doc.hpath ?? doc.id}`)
                        .join("\n");
                    const more = descendants.length > 5
                        ? `\n- ... 另外还有 ${descendants.length - 5} 个子文档`
                        : "";
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Warning: Block ${id} is a document root and has ${descendants.length} child document(s). ` +
                                    `Deleting it will also remove those descendants.\n\n` +
                                    `${preview}${more}\n\n` +
                                    `If you want to continue, call siyuan_delete_block again with force=true.`,
                            },
                        ],
                    };
                }
            }
            await removeBlockById(id);
            return {
                content: [
                    { type: "text", text: `Block ${id} deleted successfully.` },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 获取块的 Kramdown 内容 ──────────────────────────────────────
    server.registerTool("siyuan_get_block_kramdown", {
        title: "Get SiYuan Block Kramdown Content",
        description: `获取思源笔记中某个块的 Kramdown（Markdown 扩展）格式内容。

这是读取单个块内容的标准方式。返回的是 Kramdown 格式，
与标准 Markdown 相似，但可能包含思源特有的语法扩展（如块引用 ID）。

Args:
  - id (string): 块 ID（14 位字母数字字符串）

Returns JSON:
{
  "id": string,        // 块 ID
  "kramdown": string   // Kramdown 格式的块内容
}

示例：
- 读取一个段落的内容：id=<块ID>
- 读取一个标题的文本：id=<块ID>`,
        inputSchema: z
            .object({
            id: z.string().min(1, "块 ID 不能为空").describe("块 ID"),
        })
            .strict(),
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ id }) => {
        try {
            const data = await siyuanPost("/api/block/getBlockKramdown", { id });
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 获取子块列表 ────────────────────────────────────────────────
    server.registerTool("siyuan_get_child_blocks", {
        title: "Get SiYuan Child Blocks",
        description: `获取思源笔记中某个父块的直接子块列表。

常用于遍历文档结构、查看一级子块（如文档的所有顶级段落和标题）。

Args:
  - id (string): 父块 ID（通常是文档 ID 或容器块 ID）

Returns JSON:
[
  {
    "id": string,       // 子块 ID
    "type": string,     // 块类型：'p'(段落), 'h'(标题), 'l'(列表), 'c'(代码块), 't'(表格) 等
    "subtype": string   // 子类型（可选），如标题级别 'h1'-'h6'
  },
  ...
]

示例：
- 列出文档的所有顶级块：id=<文档ID>`,
        inputSchema: z
            .object({
            id: z
                .string()
                .min(1, "父块 ID 不能为空")
                .describe("父块 ID（文档 ID 或容器块 ID）"),
        })
            .strict(),
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ id }) => {
        try {
            const data = await siyuanPost("/api/block/getChildBlocks", { id });
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
}
//# sourceMappingURL=blocks.js.map