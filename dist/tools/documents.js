// 文档操作工具
// 覆盖：创建、重命名、删除、移动文档，以及导出 Markdown
import { z } from "zod";
import { siyuanPost, handleSiyuanError, removeDocumentById, getDescendantDocumentsById, } from "../services/siyuan.js";
export function registerDocumentTools(server) {
    // ─── 创建文档 ────────────────────────────────────────────────────
    server.registerTool("siyuan_create_doc", {
        title: "Create SiYuan Document",
        description: `在思源笔记的指定笔记本中创建一篇新文档，内容为 Markdown 格式。

Args:
  - notebook (string): 笔记本 ID（通过 siyuan_list_notebooks 获取）
  - path (string): 文档在笔记本中的路径，以 "/" 开头，用 "/" 分隔层级。
    如 "/日记/2024-01-15" 或 "/项目/需求文档"
  - markdown (string): 文档的 Markdown 内容（可以为空字符串创建空文档）

Returns: 新创建文档的块 ID（字符串），如 "20210914223645-oj2vnx2"

示例：
- 在"工作"笔记本创建会议记录：path="/会议记录/2024-01-15"
- 内容格式：标准 Markdown，支持标题、列表、代码块、表格等`,
        inputSchema: z
            .object({
            notebook: z
                .string()
                .min(1, "笔记本 ID 不能为空")
                .describe("笔记本 ID"),
            path: z
                .string()
                .min(1, "文档路径不能为空")
                .startsWith("/", '路径必须以 "/" 开头')
                .describe('文档路径，以 "/" 开头，如 "/日记/2024-01-15"'),
            markdown: z
                .string()
                .default("")
                .describe("文档的 Markdown 内容，可以为空字符串"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
    }, async ({ notebook, path, markdown }) => {
        try {
            const docId = await siyuanPost("/api/filetree/createDocWithMd", { notebook, path, markdown });
            return {
                content: [{ type: "text", text: JSON.stringify({ id: docId }, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 重命名文档 ──────────────────────────────────────────────────
    server.registerTool("siyuan_rename_doc", {
        title: "Rename SiYuan Document",
        description: `通过块 ID 重命名一篇思源笔记文档。

Args:
  - id (string): 文档块的 ID（14 位字母数字字符串）
    可通过 siyuan_sql_query 查询 blocks 表（type='d'）获取
  - title (string): 新的文档标题，1-255 个字符

Returns: 操作成功则返回成功消息

示例：
- 将文档"会议记录草稿"重命名为"2024年Q1团队会议纪要"`,
        inputSchema: z
            .object({
            id: z
                .string()
                .min(1, "文档 ID 不能为空")
                .describe("文档块 ID（14 位字母数字字符串）"),
            title: z
                .string()
                .min(1, "文档标题不能为空")
                .max(255, "标题不能超过 255 个字符")
                .describe("新的文档标题"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ id, title }) => {
        try {
            await siyuanPost("/api/filetree/renameDocByID", { id, title });
            return {
                content: [
                    {
                        type: "text",
                        text: `Document ${id} renamed to "${title}" successfully.`,
                    },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 删除文档 ────────────────────────────────────────────────────
    server.registerTool("siyuan_remove_doc", {
        title: "Remove SiYuan Document",
        description: `通过块 ID 删除一篇思源笔记文档。

⚠️ 警告：此操作不可逆！文档及其所有内容将被永久删除。

Args:
  - id (string): 文档块的 ID（14 位字母数字字符串）
  - notebook (string, 可选): 旧版兼容参数，现已不再需要
  - force (boolean, 可选): 若文档包含子文档，需显式设为 true 才继续删除

Returns: 操作成功则返回成功消息；若检测到子文档且未传 force=true，则返回警告并中止删除`,
        inputSchema: z
            .object({
            notebook: z
                .string()
                .min(1, "笔记本 ID 不能为空")
                .optional()
                .describe("笔记本 ID（兼容旧版参数，当前删除逻辑不再使用）"),
            id: z
                .string()
                .min(1, "文档 ID 不能为空")
                .describe("文档块 ID（14 位字母数字字符串）"),
            force: z
                .boolean()
                .optional()
                .describe("若文档包含子文档，需显式设为 true 才继续删除"),
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
                            text: `Warning: Document ${id} has ${descendants.length} child document(s). ` +
                                `Deleting it will also remove those descendants.\n\n` +
                                `${preview}${more}\n\n` +
                                `If you want to continue, call siyuan_remove_doc again with force=true.`,
                        },
                    ],
                };
            }
            await removeDocumentById(id);
            return {
                content: [
                    {
                        type: "text",
                        text: `Document ${id} removed successfully.`,
                    },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 移动文档 ────────────────────────────────────────────────────
    server.registerTool("siyuan_move_doc", {
        title: "Move SiYuan Document",
        description: `将一篇或多篇文档移动到目标位置（以目标文档 ID 或笔记本 ID 为父节点）。

Args:
  - fromIDs (array): 要移动的文档 ID 列表（1-50 个 ID）
  - toID (string): 目标父文档 ID 或笔记本 ID。
    传入文档 ID 时，文档将移动到该文档下成为其子文档；
    传入笔记本 ID 时，文档将移动到该笔记本的根目录。

Returns: 操作成功则返回成功消息

示例：
- 将文档移到另一篇文档下：fromIDs=["docID1"], toID="parentDocID"
- 将文档移到笔记本根目录：fromIDs=["docID1"], toID="notebookID"`,
        inputSchema: z
            .object({
            fromIDs: z
                .array(z.string().min(1))
                .min(1, "至少需要一个文档 ID")
                .max(50, "最多支持 50 个文档 ID")
                .describe("要移动的文档 ID 列表"),
            toID: z
                .string()
                .min(1, "目标 ID 不能为空")
                .describe("目标父文档 ID 或笔记本 ID"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ fromIDs, toID }) => {
        try {
            await siyuanPost("/api/filetree/moveDocsByID", {
                fromIDs,
                toID,
            });
            return {
                content: [
                    {
                        type: "text",
                        text: `${fromIDs.length} document(s) moved to ${toID} successfully.`,
                    },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 导出 Markdown ───────────────────────────────────────────────
    server.registerTool("siyuan_export_markdown", {
        title: "Export SiYuan Document as Markdown",
        description: `将思源笔记中的一篇文档导出为 Markdown 格式内容。

这是读取整篇文档完整内容的推荐方式。

Args:
  - id (string): 文档块 ID（14 位字母数字字符串）
    可通过 siyuan_sql_query 查询 blocks 表（type='d'）获取

Returns JSON:
{
  "hPath": string,   // 文档的人类可读路径，如 "/笔记本名/文档名"
  "content": string  // 文档的完整 Markdown 内容
}

示例：
- 读取一篇文章全文进行分析或摘要`,
        inputSchema: z
            .object({
            id: z
                .string()
                .min(1, "文档 ID 不能为空")
                .describe("文档块 ID（14 位字母数字字符串）"),
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
            const data = await siyuanPost("/api/export/exportMdContent", { id });
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
}
//# sourceMappingURL=documents.js.map