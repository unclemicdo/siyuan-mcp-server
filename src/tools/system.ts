// 系统和通知工具
// 覆盖：获取版本信息、向思源 UI 推送通知

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { siyuanPost, handleSiyuanError } from "../services/siyuan.js";
import type { PushMsgData } from "../types.js";

export function registerSystemTools(server: McpServer): void {
  // ─── 获取版本信息 ────────────────────────────────────────────────
  server.registerTool(
    "siyuan_get_version",
    {
      title: "Get SiYuan Version",
      description: `获取当前运行的思源笔记版本号。

Returns JSON:
{
  "version": string  // 版本号，如 "3.6.0"
}

可用于验证思源是否正常运行，以及检查 API 兼容性。`,
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const version = await siyuanPost<string>("/api/system/version");
        return {
          content: [{ type: "text", text: JSON.stringify({ version }, null, 2) }],
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleSiyuanError(error) }] };
      }
    }
  );

  // ─── 推送通知 ────────────────────────────────────────────────────
  server.registerTool(
    "siyuan_push_notification",
    {
      title: "Push SiYuan Notification",
      description: `向思源笔记的 UI 界面推送一条通知消息（右下角弹出）。

可用于告知用户操作完成情况、重要提醒等。

Args:
  - msg (string): 通知消息内容，1-500 个字符
  - timeout (number, 可选): 通知显示时长（毫秒），默认 7000ms（7 秒）

Returns JSON:
{
  "id": string  // 通知的唯一 ID
}`,
      inputSchema: z
        .object({
          msg: z
            .string()
            .min(1, "消息不能为空")
            .max(500, "消息不能超过 500 个字符")
            .describe("通知消息内容"),
          timeout: z
            .number()
            .int()
            .min(1000)
            .max(60000)
            .default(7000)
            .describe("通知显示时长（毫秒），默认 7000ms"),
        })
        .strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ msg, timeout }) => {
      try {
        const data = await siyuanPost<PushMsgData>(
          "/api/notification/pushMsg",
          { msg, timeout }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleSiyuanError(error) }] };
      }
    }
  );
}
