import type { BlockLookup } from "../types.js";
/**
 * 向思源 API 发送 POST 请求
 * @param endpoint - API 路径，如 "/api/notebook/lsNotebooks"
 * @param body - 请求体
 * @returns 响应的 data 字段
 */
export declare function siyuanPost<T>(endpoint: string, body?: Record<string, unknown>): Promise<T>;
/**
 * 根据块 ID 读取基础元数据。
 */
export declare function getBlockLookupById(id: string): Promise<BlockLookup | null>;
/**
 * 获取某个文档下的直接/间接子文档。
 */
export declare function getDescendantDocumentsById(id: string, attempts?: number): Promise<BlockLookup[]>;
/**
 * 轮询确认某个块已从 blocks 表中消失。
 */
export declare function ensureBlockRemoved(id: string, label?: string, attempts?: number): Promise<void>;
/**
 * 删除文档根块，并校验删除已生效。
 */
export declare function removeDocumentById(id: string): Promise<void>;
/**
 * 删除任意块；若是文档根块，则自动走官方 removeDocByID。
 */
export declare function removeBlockById(id: string): Promise<void>;
/**
 * 统一错误处理，返回用户友好的错误信息
 */
export declare function handleSiyuanError(error: unknown): string;
//# sourceMappingURL=siyuan.d.ts.map