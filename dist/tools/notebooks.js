// 笔记本管理工具
// 覆盖：列出、创建、打开、关闭、重命名笔记本
import { z } from "zod";
import { siyuanPost, handleSiyuanError } from "../services/siyuan.js";
export function registerNotebookTools(server) {
    // ─── 列出所有笔记本 ─────────────────────────────────────────────
    server.registerTool("siyuan_list_notebooks", {
        title: "List SiYuan Notebooks",
        description: `列出思源笔记中所有笔记本。

返回每个笔记本的 ID、名称、图标和状态（是否已关闭）。
未关闭（closed=false）的笔记本处于激活状态。

Returns JSON:
{
  "notebooks": [
    {
      "id": string,      // 笔记本唯一 ID
      "name": string,    // 笔记本名称
      "icon": string,    // 图标标识符
      "sort": number,    // 排序权重
      "closed": boolean  // true=已关闭，false=已激活
    }
  ]
}

示例：
- 用途：查看所有笔记本并获取 ID，以便后续操作`,
        inputSchema: z.object({}).strict(),
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async () => {
        try {
            const data = await siyuanPost("/api/notebook/lsNotebooks");
            const notebooks = data.notebooks ?? [];
            return {
                content: [{ type: "text", text: JSON.stringify(notebooks, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 创建笔记本 ──────────────────────────────────────────────────
    server.registerTool("siyuan_create_notebook", {
        title: "Create SiYuan Notebook",
        description: `在思源笔记中创建一个新的笔记本。

Args:
  - name (string): 笔记本名称，1-255 个字符

Returns JSON:
{
  "notebook": {
    "id": string,      // 新建笔记本的唯一 ID
    "name": string,
    "icon": string,
    "sort": number,
    "closed": boolean
  }
}

示例：
- 创建名为"工作日志"的笔记本`,
        inputSchema: z
            .object({
            name: z
                .string()
                .min(1, "笔记本名称不能为空")
                .max(255, "笔记本名称不能超过 255 个字符")
                .describe("笔记本名称"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
        },
    }, async ({ name }) => {
        try {
            const data = await siyuanPost("/api/notebook/createNotebook", { name });
            return {
                content: [
                    { type: "text", text: JSON.stringify(data.notebook, null, 2) },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 打开笔记本 ──────────────────────────────────────────────────
    server.registerTool("siyuan_open_notebook", {
        title: "Open SiYuan Notebook",
        description: `打开（激活）一个已关闭的思源笔记本，使其可见和可编辑。

Args:
  - notebook (string): 笔记本 ID（通过 siyuan_list_notebooks 获取）

Returns: 操作成功则返回成功消息`,
        inputSchema: z
            .object({
            notebook: z
                .string()
                .min(1, "笔记本 ID 不能为空")
                .describe("笔记本 ID"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ notebook }) => {
        try {
            await siyuanPost("/api/notebook/openNotebook", { notebook });
            return {
                content: [
                    { type: "text", text: `Notebook ${notebook} opened successfully.` },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 关闭笔记本 ──────────────────────────────────────────────────
    server.registerTool("siyuan_close_notebook", {
        title: "Close SiYuan Notebook",
        description: `关闭（隐藏）一个思源笔记本。关闭后笔记本内容不会删除，可随时重新打开。

Args:
  - notebook (string): 笔记本 ID（通过 siyuan_list_notebooks 获取）

Returns: 操作成功则返回成功消息`,
        inputSchema: z
            .object({
            notebook: z
                .string()
                .min(1, "笔记本 ID 不能为空")
                .describe("笔记本 ID"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ notebook }) => {
        try {
            await siyuanPost("/api/notebook/closeNotebook", { notebook });
            return {
                content: [
                    {
                        type: "text",
                        text: `Notebook ${notebook} closed successfully.`,
                    },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 重命名笔记本 ────────────────────────────────────────────────
    server.registerTool("siyuan_rename_notebook", {
        title: "Rename SiYuan Notebook",
        description: `重命名一个思源笔记本。

Args:
  - notebook (string): 笔记本 ID（通过 siyuan_list_notebooks 获取）
  - name (string): 新的笔记本名称，1-255 个字符

Returns: 操作成功则返回成功消息`,
        inputSchema: z
            .object({
            notebook: z
                .string()
                .min(1, "笔记本 ID 不能为空")
                .describe("笔记本 ID"),
            name: z
                .string()
                .min(1, "新名称不能为空")
                .max(255, "名称不能超过 255 个字符")
                .describe("新的笔记本名称"),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ notebook, name }) => {
        try {
            await siyuanPost("/api/notebook/renameNotebook", { notebook, name });
            return {
                content: [
                    {
                        type: "text",
                        text: `Notebook ${notebook} renamed to "${name}" successfully.`,
                    },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
}
//# sourceMappingURL=notebooks.js.map