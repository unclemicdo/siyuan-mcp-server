// 思源笔记 API 响应和数据结构的 TypeScript 类型定义

/** 思源 API 标准响应结构 */
export interface SiYuanResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

/** 笔记本信息 */
export interface Notebook {
  id: string;
  name: string;
  icon: string;
  sort: number;
  closed: boolean;
}

/** 笔记本列表响应 */
export interface NotebooksData {
  notebooks: Notebook[];
}

/** 笔记本配置 */
export interface NotebookConf {
  name: string;
  closed: boolean;
  refCreateSavePath: string;
  createDocNameTemplate: string;
  dailyNoteSavePath: string;
  dailyNoteTemplatePath: string;
}

/** 创建文档响应 */
export interface CreateDocData {
  id: string;
}

/** 块操作结果 */
export interface BlockResult {
  id: string;
  doOperations: Operation[];
  undoOperations: Operation[] | null;
}

/** 操作记录 */
export interface Operation {
  action: string;
  id: string;
  parentID?: string;
  previousID?: string;
  nextID?: string;
  data?: string;
}

/** 子块信息 */
export interface ChildBlock {
  id: string;
  type: string;
  subtype?: string;
}

/** Kramdown 内容响应 */
export interface KramdownData {
  id: string;
  kramdown: string;
}

/** SQL 查询结果行（动态字段）*/
export type SqlRow = Record<string, unknown>;

/** 通过 blocks 表查询到的基础块信息 */
export interface BlockLookup {
  id: string;
  box?: string;
  path?: string;
  hpath?: string;
  type?: string;
}

/** 系统版本响应 */
export interface VersionData {
  ver: string;
}

/** 导出 Markdown 响应 */
export interface ExportMdData {
  hPath: string;
  content: string;
}

/** 通知推送响应 */
export interface PushMsgData {
  id: string;
}
