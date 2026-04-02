#!/usr/bin/env node
/**
 * SiYuan Note MCP Server
 *
 * 提供 22 个 MCP 工具与思源笔记交互，包括：
 * - 笔记本管理（列出、创建、打开、关闭、重命名）
 * - 文档操作（创建、重命名、删除、移动、导出 Markdown）
 * - 块级操作（插入、追加、更新、删除、读取内容）
 * - 块属性（获取和设置自定义元数据）
 * - SQL 查询（全文搜索和数据分析）
 * - 系统通知（获取版本、推送消息）
 *
 * 环境变量：
 *   SIYUAN_TOKEN     必填，思源 API Token（设置 > 关于 > API Token）
 *   SIYUAN_BASE_URL  可选，默认 http://127.0.0.1:6806
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerNotebookTools } from "./tools/notebooks.js";
import { registerDocumentTools } from "./tools/documents.js";
import { registerBlockTools } from "./tools/blocks.js";
import { registerAttrTools } from "./tools/attrs.js";
import { registerQueryTools } from "./tools/query.js";
import { registerSystemTools } from "./tools/system.js";
import { getSiyuanStartupWarnings } from "./services/siyuan.js";
import { SIYUAN_BASE_URL } from "./constants.js";
// 验证必要的环境变量
if (!process.env.SIYUAN_TOKEN) {
    console.error("[siyuan-mcp-server] ERROR: SIYUAN_TOKEN environment variable is not set.\n" +
        "  Please set it to your SiYuan API token:\n" +
        "  SiYuan Settings > About > API Token");
    process.exit(1);
}
// 创建 MCP Server 实例
const server = new McpServer({
    name: "siyuan-mcp-server",
    version: "1.0.1",
});
// 注册所有工具
registerNotebookTools(server);
registerDocumentTools(server);
registerBlockTools(server);
registerAttrTools(server);
registerQueryTools(server);
registerSystemTools(server);
// 启动 stdio 传输（适用于本地 Claude Code 集成）
async function main() {
    for (const warning of getSiyuanStartupWarnings(SIYUAN_BASE_URL)) {
        console.error(warning);
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[siyuan-mcp-server] Server running via stdio. Ready to accept MCP requests.");
}
main().catch((error) => {
    console.error("[siyuan-mcp-server] Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map