# 测试边界陷阱 — 模式库（FDK 通用）

> **分类维度**：按「持久化时序 × 标识符生成方式」  
> **用途**：侦测何时要写 test-cases、写什么场景；**不绑定任何业务模块**。  
> 各 feature 在 `test-cases/*.md` 中 **引用模式场景码** 并落地具体数据，无需再改 FDK。

---

## 0. 模式库索引

| 模式 ID | 名称 | 一句话 |
|---------|------|--------|
| **TRAP-BSA** | Batch Serial Assignment | 一次请求多条记录，服务端在循环里分配序号/编号/单号 |
| **TRAP-RAS** | Replace-All Save | 保存时删光再插（或整批覆盖），与序号/外键时序纠缠 |
| **TRAP-DAS** | Deferred Assignment SSOT | 客户端传空，服务端在 save 时才赋值 |
| **TRAP-CDF** | Config Default Compatibility | 新字段列默认 / 创建工厂默认 / 枚举合法组合彼此不兼容 |

模式可叠加（例如 TRAP-BSA + TRAP-RAS + TRAP-DAS 常同时出现）。

---

## 1. 通用侦测（Spec Lock / Analyze 必问）

在 tech-design / AC 中若 **任一** 为「是」，则必须在 `test-cases/` 引用对应模式场景码：

| # | 侦测问题 | 命中模式 |
|---|----------|----------|
| Q1 | 用户是否 **不填** 某字段，由服务端在 **保存时** 生成？（编号、序号、单号、sort_key…） | TRAP-DAS |
| Q2 | 单次 API 是否携带 **≥2 条** 待分配该字段的记录？ | TRAP-BSA |
| Q3 | 分配逻辑是否在 **foreach 循环内** 查 DB（COUNT/MAX）再 +1？ | TRAP-BSA |
| Q4 | 保存是否 **整批 replace**（先删后插 / 全量覆盖子表）？ | TRAP-RAS |
| Q5 | 新增配置字段时，**列默认 / 创建默认 / 关联字段默认** 是否两两组成合法组合？ | TRAP-CDF |

> **原则**：相似业务（订单行号、工单号、明细序号、手工条目编号…）**共用同一模式**，只在 feature 的 test-cases 里换实体名与字段名，**不向 FDK 追加新文件**。

---

## 2. TRAP-BSA — 批量循环内分配序号

### 2.1 反模式（Code Review）

```text
❌ foreach ($rows as $row) {
     $seq = queryCountOrMaxFromDb() + 1;  // 同批未落库前，每次结果相同 → 重复
   }

✅ $cursor = resolveMax(dbRows, payloadRows);
   foreach ($rows as $row) {
     if (needsAssign($row)) { $row[key] = format(++$cursor); }
   }
```

### 2.2 必测场景码（所有 feature 通用）

| 场景码 | 场景 | 预期 |
|--------|------|------|
| **BSA-MULTI-NEW** | 一次 save **≥2 条** 待分配字段为空 | 序号 **连续且不重复** |
| **BSA-CONTINUE** | 已有已分配值，再 save **1 条** 空值 | 新值为 **max+1** |
| **BSA-MULTI-TYPE** | 存在 **多类型独立序列**（如 type A/B 各一条计数器） | 各序列独立递增 |
| **BSA-IDEMPOTENT** | payload 已带分配值再 save | **不改变** 已有值 |

### 2.3 FDP 动作

| 阶段 | 动作 |
|------|------|
| Spec Lock | Q2∧Q3 命中 → test-cases 须含 **BSA-MULTI-NEW**（最易漏） |
| Analyze | 有延迟赋值却无 **BSA-MULTI-NEW** → **P0 阻断** |
| 开发 | TDD：先写 **BSA-MULTI-NEW** 失败单测 |
| Converge | RTM「测试」列写场景码或具体用例名，禁止仅「代码审查」 |

---

## 3. TRAP-RAS — 整批 replace 保存

### 3.1 必测场景码

| 场景码 | 场景 | 预期 |
|--------|------|------|
| **RAS-KEEP-ASSIGNED** | save 只改非标识字段、条数不变 | 已分配标识 **保留** |
| **RAS-DELETE-ADD** | 删 1 条再加 1 条 | 新条序号符合产品规则（续号 / 不复用须在 AC 写明） |

---

## 4. TRAP-DAS — 延迟赋值与职责

| 规则 | 说明 |
|------|------|
| SSOT | 标识符正确性 **以后端单测为准**；客户端传空/null 时不应在前端 duplicate 发号 |
| E2E | 可选一条 API 集成测；**不替代 BSA-MULTI-NEW** |

---

## 5. TRAP-CDF — 配置默认组合兼容

### 5.1 反模式

```text
❌ ALTER … ADD col DEFAULT 'A'   // A 仅对 type=X 合法
   创建实体时 type 默认 = Y         // Y 不允许 A → 首开功能即校验失败 / 下拉露出裸枚举值

✅ 创建工厂按关联字段写兼容默认（defaultForRelated）
   GET 配置时 resolve：不合法则回落到推荐默认
   保存 / 预览前校验合法组合
```

### 5.2 必测场景码

| 场景码 | 场景 | 预期 |
|--------|------|------|
| **CDF-DEFAULT-MISMATCH** | 仅用「列默认 + 关联字段默认」创建实体，不手工改配置 | 打开配置 / 首次保存 / 预览 **不报组合错误**；展示为合法 label |
| **CDF-SWITCH-RELATED** | 切换关联字段（如周期/类型） | 从属字段自动重置为该分支默认，或明确提示非法 |
| **CDF-LOAD-LEGACY** | 历史行已存在不合法组合 | GET 返回 resolve 后的合法值（或带警告），前端不露出裸枚举 |

### 5.3 FDP 动作

| 阶段 | 动作 |
|------|------|
| Spec Lock | Q5 命中 → test-cases 含 **CDF-DEFAULT-MISMATCH** |
| Analyze | 有新配置列默认却无关联默认矩阵 → **P0 阻断** |
| 开发 | 创建路径 + GET resolve + 保存校验三处一致 |
| Converge | 用「空项目 / 首次开启」路径回归，禁止只测已配置老数据 |

---

## 6. Feature 如何落地（派生，不改 FDK）

在 `{feature}/test-cases/*.md` 增加表格，**第一列引用场景码**：

```markdown
## 标识符分配（TRAP-BSA + TRAP-DAS）

| 场景码 | 本模块用例 ID | 数据要点 | 预期 |
|--------|---------------|----------|------|
| BSA-MULTI-NEW | SN-01 | 一次提交 2 条 serial_no 为空 | …-001、…-002 |
| BSA-CONTINUE | SN-02 | 已有 …-001，再提交 1 条空 | …-002 |
```

```markdown
## 配置默认（TRAP-CDF）

| 场景码 | 本模块用例 ID | 数据要点 | 预期 |
|--------|---------------|----------|------|
| CDF-DEFAULT-MISMATCH | CFG-01 | 新建实体不改配置即打开面板 | 无组合错误 |
```

RTM「测试」列可写 `SN-01 (BSA-MULTI-NEW)` / `CFG-01 (CDF-DEFAULT-MISMATCH)`，追溯至模式库即可。

---

## MECE 自检

- TRAP-BSA / TRAP-RAS / TRAP-DAS / TRAP-CDF 按「生成时机 × 持久化方式 × 职责 × 默认兼容」拆分，互不重叠 ✅  
- **BSA-MULTI-NEW** 覆盖「同批多条延迟赋值」；**CDF-DEFAULT-MISMATCH** 覆盖「默认组合不兼容」 ✅  
- 本文件仅 **模式 + 场景码**；具体实体/字段在各 feature test-cases 派生 ✅
