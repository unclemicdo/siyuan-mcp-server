# Siyuan MCP Server 改进实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 改进 `siyuan-mcp-server`，使其 README 更准确、更有说服力，信任边界更明确，SQL 工具真正落实自身宣称的只读约束，并为仓库补齐基础验证与发布维护能力。

**架构思路：** 保持这个 server 轻量、以 `stdio` 为核心，不把范围扩展到权限系统、远程服务或大规模重构。重点是在文档层、启动与配置边界层、SQL 执行路径上补强护栏，然后增加少量自动化测试和发布维护机制。

**技术栈：** TypeScript、Node.js、MCP SDK、Zod、Axios、npm

---

## 范围与拆分

这次改进自然可以拆成 5 条主线：

1. 文档与定位
2. 运行时信任边界加固
3. SQL 安全约束
4. 自动化验证
5. 依赖与发布维护

这 5 条主线仍然属于同一个整体目标：让仓库对最终用户来说更安全、更可信。

## 需要修改或新增的文件

### 文档

- 修改：`README.md`
- 修改：`README_en.md`
- 可能修改：`.claude/skills/using-siyuan-mcp/SKILL.md`
- 新增：`SECURITY.md`
- 新增：`CHANGELOG.md`

### 运行时 / 安全

- 修改：`src/index.ts`
- 修改：`src/constants.ts`
- 修改：`src/services/siyuan.ts`
- 修改：`src/tools/query.ts`
- 可能修改：`src/types.ts`

### 测试与工具链

- 修改：`package.json`
- 修改：`package-lock.json`
- 新增：`vitest.config.ts`
- 新增：`src/services/__tests__/siyuan.test.ts`
- 新增：`src/tools/__tests__/query.test.ts`
- 新增：`.github/workflows/ci.yml`

### 构建产物

- 仅当项目打算继续在 git 中跟踪编译产物时，才修改已跟踪的 `dist/**`

## 当前问题与文件映射

### 1. README 过度承诺兼容性，价值表达也不够到位

位置：

- `README.md`
- `README_en.md`

问题：

- 开头是通用描述，不是用户价值主张
- 过早以工具数量为中心，而不是使用场景
- 写成“兼容所有 MCP 客户端”，但实际实现是 `stdio` 形态
- 没有把隐私、删除风险前置
- 把版本敏感的一键安装命令放成主路径
- Codex `config.toml` 和 JSON 示例混用，容易误导

### 2. SQL 工具宣称只读，但没有真正强制

位置：

- `src/tools/query.ts`

问题：

- 描述写了“仅支持 SELECT”
- 注解标成了 `readOnlyHint: true`
- 实现却把原始 SQL 直接透传，没有校验

### 3. `SIYUAN_BASE_URL` 和 Token 的信任边界没有被明确表达

位置：

- `src/constants.ts`
- `src/services/siyuan.ts`
- `src/index.ts`

问题：

- `SIYUAN_BASE_URL` 可以指向任意地址
- Token 会被发送到该地址
- 启动时没有对远程、非本地或非 HTTPS 地址做风险提示
- README 把它写成普通端口覆盖项，而不是信任边界

### 4. 仓库缺少能证明这些安全承诺的自动化验证

位置：

- 当前没有针对 SQL 护栏、URL 风险识别或错误行为的测试

### 5. 发布与维护信号偏弱

位置：

- `package.json`
- `package-lock.json`
- 仓库元数据

问题：

- 没有 changelog
- 没有安全披露说明
- 依赖链存在已知漏洞告警
- `dist/` 是否应继续跟踪并不清楚

## 改进计划

### 阶段 1：修正文档与项目定位

**优先级：** P0

**文件：**

- 修改：`README.md`
- 修改：`README_en.md`
- 可能修改：`.claude/skills/using-siyuan-mcp/SKILL.md`

**要调整什么：**

- 用用户价值主张重写开头，而不是用工具数开头
- 增加“为什么有用”一节
- 在靠前位置加入“安全与隐私”一节
- 把“兼容所有 MCP 客户端”改成“兼容可启动本地 stdio MCP server 的客户端”
- 把一键命令移到稳定的手动配置说明之后，或者明确标注其依赖客户端版本
- 修正 Codex 的文案，避免把 TOML 配置写成 JSON 示例
- 增加 4 到 6 个真实使用场景
- 增加简短的“已知限制”部分
- 只有在 Skill 被明确当作公开功能维护时，才在 README 中保留高权重介绍

### 阶段 2：在运行时明确提示信任边界

**优先级：** P0

**文件：**

- 修改：`src/constants.ts`
- 修改：`src/index.ts`
- 修改：`src/services/siyuan.ts`

**要调整什么：**

- 增加 URL 解析辅助逻辑
- 识别 `SIYUAN_BASE_URL` 是否指向 localhost、内网地址、公网远程地址、非本地且非 HTTPS 的不安全 HTTP 地址
- 如果地址不是本地，在启动时向 stderr 输出警告
- 如果地址是远程且不是 HTTPS，输出更强的警告
- 尽量保持向后兼容，不要直接强制报错

### 阶段 3：真正落实 SQL 只读限制

**优先级：** P0

**文件：**

- 修改：`src/tools/query.ts`
- 修改：`src/services/siyuan.ts`
- 可新增：`src/services/sql-safety.ts`

**要调整什么：**

- 在调用 `/api/query/sql` 之前增加 SQL 校验
- 明确只允许单条 `SELECT` 查询
- 拒绝多语句、写操作、结构操作、空输入、纯注释输入、明显绕过规则的 payload
- 返回面向用户的错误提示，明确说明该工具仅允许只读 `SELECT`

### 阶段 4：为护栏和规则增加自动化测试

**优先级：** P1

**文件：**

- 修改：`package.json`
- 新增：`src/services/__tests__/siyuan.test.ts`
- 新增：`src/tools/__tests__/query.test.ts`
- 新增：`vitest.config.ts`

**要调整什么：**

- 增加轻量测试运行器
- 为 SQL 校验、endpoint 风险识别、警告信息格式增加单测

### 阶段 5：改进错误提示与用户引导

**优先级：** P1

**文件：**

- 修改：`src/services/siyuan.ts`
- 修改：`src/index.ts`
- 修改：`README.md`
- 修改：`README_en.md`

**要调整什么：**

- 让运行时错误提示更可执行
- 连接失败时提示检查 `SIYUAN_BASE_URL`，并指出目标看起来是本地还是远程
- 401 未授权时，提醒用户检查 Token 来源和连接的思源实例
- 在 README 故障排查中补上缺少 Token、端口错误、远程 host 风险、查询结果被截断

### 阶段 6：把 Skill 当成正式公开能力重新审视

**优先级：** P1

**文件：**

- 修改：`.claude/skills/using-siyuan-mcp/SKILL.md`
- 修改：`README.md`
- 修改：`README_en.md`

### 阶段 7：依赖维护与 CI

**优先级：** P1

**文件：**

- 修改：`package.json`
- 修改：`package-lock.json`
- 新增：`.github/workflows/ci.yml`

**要调整什么：**

- 升级 `@modelcontextprotocol/sdk` 到能消除已知传递依赖漏洞的版本（如果上游已有修复）
- 重新生成 lockfile
- 在 CI 中加入 `npm ci`、`npm run build`、`npm test`

### 阶段 8：补齐发布与维护信号

**优先级：** P2

**文件：**

- 新增：`SECURITY.md`
- 新增：`CHANGELOG.md`

## 推荐执行顺序

1. 文档修正
2. endpoint 风险警告
3. SQL 只读限制
4. 测试
5. CI 与依赖升级
6. Skill 定位清理
7. 安全与发布元数据

## 核心验收标准

- README 不再宣称普适兼容所有 MCP 客户端
- README 明确提示这是高权限读写集成，且当前范围是本地 `stdio`
- `SIYUAN_BASE_URL` 为远程或非 HTTPS 时会在启动时给出明确风险警告
- `siyuan_sql_query` 仅允许单条只读 `SELECT`，危险 payload 会在本地被拒绝
- 存在 `npm test`，并且安全护栏有直接测试覆盖
- CI 能在干净 checkout 上跑 `npm ci`、`npm run build`、`npm test`
- 仓库包含 `SECURITY.md` 与 `CHANGELOG.md`
