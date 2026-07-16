---
name: spec-analyze
description: 实现前一致性审查 Analyze — 对照 acceptance、tech-design、test-cases、ui-spec；开发前 P0 阻断
---

# Spec Analyze（实现前一致性审查）

> **目标**：在写代码之前发现文档矛盾、遗漏、镀金，避免实现基于错误或过时的 spec。

---

## 一、触发条件

- FDP 步骤 2.6，G3 Spec Lock 已 `approved: true` 之后
- 用户：「执行 Analyze」「实现前审查」

---

## 二、输入

- `spec/acceptance.md`、`spec/ui-spec.md`、`spec/rtm.md`
- `tech-design.md`、`test-cases/`、`tasks.md`
- `context.md`（SSOT 版本）

---

## 三、执行方式

**必须**启动只读 Subagent `spec-analyzer`（Task 工具，`readonly: true`）。

主 Agent 职责：

1. 组装审查包路径列表
2. 委派 `spec-analyzer`
3. 汇总报告，更新 `context.md` G4 状态
4. 有 P0 → **阻断进入开发**，回到 spec-lock 或 architect 修文档

---

## 四、审查清单（MECE）

### 4.1 覆盖度

| 检查 | P0 条件 |
|------|---------|
| AC → test-cases | 每个 P0 AC 在 test-cases 或 rtm 测试列有映射 |
| AC → ui-spec | 每个 P0 UI AC 有 ui-spec 锚点 |
| AC → tasks | 每个 P0 AC 在 tasks/rtm 有计划实现位置 |

### 4.2 一致性

| 检查 | P0 条件 |
|------|---------|
| PRD vs tech-design | 方案未引入 PRD 外功能（镀金） |
| 字段/口径 | 无 label/remark 等未裁决冲突 |
| SSOT | context 与 acceptance 头部版本一致 |

### 4.3 可执行性

| 检查 | P0 条件 |
|------|---------|
| AC 质量 | P0 AC 均可二值验证 |
| 依赖 | 外部接口/表在 tech-design 已定义 |

### 4.4 边界陷阱（模式库）

对照 `feature-delivery-kit/templates/feature/test-cases/common-traps.md`：

| 检查 | 条件 |
|------|------|
| 通用侦测 Q1～Q4 | 命中 TRAP-BSA / TRAP-RAS / TRAP-DAS 时，feature `test-cases/` 须引用对应 **场景码** |
| TRAP-BSA | 延迟赋值 + 一次请求多条空标识 → **必须**含 **BSA-MULTI-NEW**；缺失 → **P0 阻断** |
| RTM 测试列 | 须写用例 ID 或场景码，禁止仅「代码审查」 |

### 4.5 原型保真（有 prototype 时）

对照 `feature-delivery-kit/templates/feature/spec/prototype-fidelity-rules.md`：

| 检查 | P0 条件 |
|------|---------|
| U1～U6 | Spec Lock 已答；ui-spec 每页含控件边界 / 列表 / 分栏（适用时） |
| TRAP-UID | 双栏页、列表页、配置页缺结构化 AC → **P0 阻断** |
| ui-diff-checklist | 已生成且含「结构复核」节，非仅视觉模板 |
| 禁止甩锅 | acceptance-checklist 不得仅勾「视觉走人工」而无 ui-spec 结构项 |

---

## 五、输出

`{docsRoot}/{feature}/analyze-report.md`：

```markdown
# {feature} Analyze 报告

## 结论
- 提开发建议：✅ 可开发 / ❌ 修复 P0 后重审

## P0 问题
| # | 类型 | 描述 | 修复建议 |

## P1 问题
...

## MECE 自检
...
```

更新 `context.md`：

```markdown
| G4 analyze | ✅ passed / ❌ blocked | {date} |
```

---

## 六、与下游边界

| 不做 | 谁做 |
|------|------|
| 写代码 | dev-expert |
| 对照 git diff | spec-converge / spec-verifier |
| UI 像素对比 | 人工 |

---

## MECE 自检

- 覆盖度 / 一致性 / 可执行性 互斥 ✅
- 实现后验证归 Converge，本阶段不查 diff ✅
