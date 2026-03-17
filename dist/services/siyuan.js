// 思源笔记 API 共享客户端
// 所有工具通过此模块发起请求，统一处理认证和错误
import axios, { AxiosError } from "axios";
import { SIYUAN_BASE_URL } from "../constants.js";
/**
 * 获取思源 API Token（来自环境变量）
 */
function getToken() {
    const token = process.env.SIYUAN_TOKEN;
    if (!token) {
        throw new Error("SIYUAN_TOKEN environment variable is not set. " +
            "Please set it to your SiYuan API token (Settings > About > API Token).");
    }
    return token;
}
/**
 * 向思源 API 发送 POST 请求
 * @param endpoint - API 路径，如 "/api/notebook/lsNotebooks"
 * @param body - 请求体
 * @returns 响应的 data 字段
 */
export async function siyuanPost(endpoint, body = {}) {
    const url = `${SIYUAN_BASE_URL}${endpoint}`;
    const token = getToken();
    const response = await axios.post(url, body, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        timeout: 30000,
    });
    const { code, msg, data } = response.data;
    if (code !== 0) {
        throw new Error(`SiYuan API error (code=${code}): ${msg}`);
    }
    return data;
}
function escapeSqlString(value) {
    return value.replace(/'/g, "''");
}
function escapeSqlLike(value) {
    return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
function normalizeBlockLookup(row) {
    return {
        id: String(row.id ?? ""),
        box: row.box == null ? undefined : String(row.box),
        path: row.path == null ? undefined : String(row.path),
        hpath: row.hpath == null ? undefined : String(row.hpath),
        type: row.type == null ? undefined : String(row.type),
    };
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * 根据块 ID 读取基础元数据。
 */
export async function getBlockLookupById(id) {
    const stmt = `SELECT id, box, path, hpath, type FROM blocks WHERE id = '${escapeSqlString(id)}' LIMIT 1`;
    const rows = await siyuanPost("/api/query/sql", { stmt });
    if (!rows?.length) {
        return null;
    }
    return normalizeBlockLookup(rows[0]);
}
/**
 * 获取某个文档下的直接/间接子文档。
 */
export async function getDescendantDocumentsById(id) {
    const block = await getBlockLookupById(id);
    if (!block) {
        throw new Error(`Document ${id} not found.`);
    }
    if (block.type !== "d") {
        return [];
    }
    if (!block.box || !block.hpath) {
        return [];
    }
    const hpathPrefix = `${escapeSqlLike(block.hpath)}/%`;
    const stmt = `SELECT id, box, path, hpath, type FROM blocks WHERE type = 'd' AND box = '${escapeSqlString(block.box)}' AND hpath LIKE '${escapeSqlString(hpathPrefix)}' ESCAPE '\\' ORDER BY hpath ASC`;
    const rows = await siyuanPost("/api/query/sql", { stmt });
    return (rows ?? []).map(normalizeBlockLookup);
}
/**
 * 轮询确认某个块已从 blocks 表中消失。
 */
export async function ensureBlockRemoved(id, label = "Block", attempts = 5) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        const block = await getBlockLookupById(id);
        if (!block) {
            return;
        }
        if (attempt < attempts - 1) {
            await sleep(100 * (attempt + 1));
        }
    }
    throw new Error(`${label} ${id} still exists after deletion attempt. ` +
        "This usually means the wrong SiYuan API endpoint or payload was used.");
}
/**
 * 删除文档根块，并校验删除已生效。
 */
export async function removeDocumentById(id) {
    const block = await getBlockLookupById(id);
    if (!block) {
        throw new Error(`Document ${id} not found.`);
    }
    if (block.type !== "d") {
        throw new Error(`Block ${id} is type "${block.type}", not a document.`);
    }
    await siyuanPost("/api/filetree/removeDocByID", { id });
    await ensureBlockRemoved(id, "Document");
}
/**
 * 删除任意块；若是文档根块，则自动走官方 removeDocByID。
 */
export async function removeBlockById(id) {
    const block = await getBlockLookupById(id);
    if (!block) {
        throw new Error(`Block ${id} not found.`);
    }
    if (block.type === "d") {
        await removeDocumentById(id);
        return;
    }
    await siyuanPost("/api/block/deleteBlock", { id });
    await ensureBlockRemoved(id, "Block");
}
/**
 * 统一错误处理，返回用户友好的错误信息
 */
export function handleSiyuanError(error) {
    if (error instanceof AxiosError) {
        if (error.response) {
            const status = error.response.status;
            if (status === 401)
                return "Error: Unauthorized. Please check your SIYUAN_TOKEN.";
            if (status === 403)
                return "Error: Forbidden. You don't have permission to perform this action.";
            if (status === 404)
                return "Error: SiYuan API endpoint not found. Is SiYuan running?";
            if (status === 429)
                return "Error: Rate limit exceeded. Please wait before making more requests.";
            return `Error: HTTP ${status} from SiYuan API.`;
        }
        if (error.code === "ECONNREFUSED") {
            return ("Error: Cannot connect to SiYuan. " +
                `Please make sure SiYuan is running at ${SIYUAN_BASE_URL}.`);
        }
        if (error.code === "ECONNABORTED") {
            return "Error: Request timed out. SiYuan may be busy, please try again.";
        }
    }
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return `Error: Unexpected error: ${String(error)}`;
}
//# sourceMappingURL=siyuan.js.map