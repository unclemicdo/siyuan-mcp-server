// 块属性工具
// 覆盖：获取和设置块的自定义属性（key-value 元数据）
import { z } from "zod";
import { siyuanPost, handleSiyuanError } from "../services/siyuan.js";
export function registerAttrTools(server) {
    // ─── 获取块属性 ──────────────────────────────────────────────────
    server.registerTool("siyuan_get_block_attrs", {
        title: "Get SiYuan Block Attributes",
        description: `获取思源笔记中某个块的所有自定义属性（key-value 元数据）。

块属性可用于存储自定义元数据，如标签、状态、优先级等。
内置属性以 "custom-" 前缀开头。

Args:
  - id (string): 块 ID（14 位字母数字字符串）

Returns JSON: 属性键值对对象
{
  "custom-priority": "high",
  "custom-status": "done",
  ...
}

示例：
- 查看一个任务块的所有自定义标记`,
        inputSchema: z
            .object({
            id: z
                .string()
                .min(1, "块 ID 不能为空")
                .describe("块 ID（14 位字母数字字符串）"),
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
            const data = await siyuanPost("/api/attr/getBlockAttrs", { id });
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
    // ─── 设置块属性 ──────────────────────────────────────────────────
    server.registerTool("siyuan_set_block_attrs", {
        title: "Set SiYuan Block Attributes",
        description: `设置思源笔记中某个块的自定义属性（key-value 元数据）。

可以一次设置多个属性。自定义属性键名推荐使用 "custom-" 前缀以避免与内置属性冲突。
将属性值设为空字符串可删除该属性。

Args:
  - id (string): 块 ID（14 位字母数字字符串）
  - attrs (object): 要设置的属性键值对，如 {"custom-priority": "high", "custom-status": "done"}

Returns: 操作成功则返回成功消息

示例：
- 给任务块添加优先级标记：attrs={"custom-priority": "high"}
- 删除某属性：attrs={"custom-priority": ""}`,
        inputSchema: z
            .object({
            id: z
                .string()
                .min(1, "块 ID 不能为空")
                .describe("块 ID（14 位字母数字字符串）"),
            attrs: z
                .record(z.string(), z.string())
                .describe('要设置的属性键值对，如 {"custom-priority": "high"}。值为空字符串时删除该属性'),
        })
            .strict(),
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
        },
    }, async ({ id, attrs }) => {
        try {
            await siyuanPost("/api/attr/setBlockAttrs", { id, attrs });
            return {
                content: [
                    {
                        type: "text",
                        text: `Block ${id} attributes updated successfully.`,
                    },
                ],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleSiyuanError(error) }] };
        }
    });
}
//# sourceMappingURL=attrs.js.map