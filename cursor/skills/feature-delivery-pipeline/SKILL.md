---
name: feature-delivery-pipeline
description: Feature 交付流水线总指挥 — 产物检测、入口判定、阶段调度、门禁状态管理；关键词 FDP/全流程/from_spec_lock/Converge
---

# Feature Delivery Pipeline（FDP 总指挥）

> **目标**：任意 feature 从需求到交付的可移植流水线。检测已有产物，决定入口，调度下游 Skill 与 Subagent，维护 `context.md` 门禁状态。

---

## 一、触发条件

- 用户说：全流程 / FDP / from_spec_lock / from_development / 执行 Converge / 检测产物从哪开始
- 新 feature 开发且需规范流程
- 用户指定 `feature {name}` 并涉及多步交付

**执行本 Skill 后**，按阶段 Read 对应下游 Skill，不要跳过门禁。

---

## 二、配置与路径

1. 读取 `.cursor/fdp.config.json`（不存在则用 `fdp.config.example.json` 默认值）
2. feature 文档根：`{docsRoot}/{feature}/`
3. 规格目录：`{docsRoot}/{feature}/spec/`
4. 开发前将 `activeFeature` 写入 `fdp.config.json`（或提示用户设置）

---

## 三、入口模式（P0 产物检测）

扫描 `{docsRoot}/{feature}/` 后判定：

| 条件 | entry_mode | 起始步骤 |
|------|------------|----------|
| 无 PRD/产品说明 | `full` | 1 需求澄清 → `#product-expert` |
| 有 PRD+原型，无 tech-design | `from_architecture` | 2 架构 → `#architect-expert` |
| 有 tech-design，无 spec 或未 approved | `from_spec_lock` | 2.5 → `#spec-lock` |
| checklist `approved: true` | `from_development` | 4～5 → `#dev-expert` |
| 开发中且有 pending AC | `resume_converge` | 5.5 → `#spec-converge` |
| 用户明确简单改动 | `fast_track` | 轻量 AC → `#dev-expert` |

**输出**（每次进入 feature 先打印）：

```markdown
## FDP 状态
- feature: {name}
- entry_mode: {mode}
- current_step: {N}
- 下一动作: {具体 Skill/Agent}
- 阻塞门禁: {如有}
```

并更新 `context.md` 的「流水线状态」「门禁状态」章节。

---

## 四、对外 6 步 + 对内 3 门禁

| 步骤 | 动作 | 执行者 | 人工门禁 |
|------|------|--------|----------|
| 1 | 需求澄清 | `#product-expert` | G1 需求确认 |
| 2 | PRD + 技术方案 | product + `#architect-expert` | G2 方案确认 |
| **2.5** | Spec Lock | `#spec-lock` | **G3 你确认 checklist** |
| 3 | 规范 + 命名 | 加载项目栈 Skills | G3.5 可选 |
| **2.6** | Analyze | `#spec-analyze` + `spec-analyzer` | G4 P0 清零（含 TRAP-UID） |
| 4 | 任务拆解 | `tasks.md` / architect Step 7 | 大 feature 确认 |
| 5 | 开发 + 单测 | `#dev-expert` + `#testing-strategy` | — |
| 5 | 代码 review | `#cross-review` + bugbot | — |
| **5.5** | Converge | `#spec-converge` + `spec-verifier` | G7 收敛 |
| 6 | 接口/文档/提交 | `#dev-expert` + 项目规范 | G8 交付确认 |
| — | UI 验证 | **人工** + spec 结构项 | ui-diff-checklist **结构复核** + 视觉 |

---

## 五、门禁一览（写入 context.md）

| ID | 名称 | 通过条件 |
|----|------|----------|
| G3 | spec_lock | `acceptance-checklist.md` frontmatter `approved: true` |
| G4 | analyze | analyze 报告无 P0（含 `prototype-fidelity-rules` U1～U6 / TRAP-UID） |
| G5 | dev_gate | Hook：activeFeature 已 approved（标准/复杂） |
| G7 | converge | RTM 无 P0 pending；`converge-report.md` 已收敛；有 UI 时 ui-diff **结构复核**已勾或遗留 P0 已记 |
| G8 | delivery | 接口文档/README/提交清单完成 |

---

## 六、Subagent 调用规范

| 阶段 | Agent | 参数 |
|------|-------|------|
| 2.6 Analyze | `spec-analyzer` | `readonly: true` |
| 5.5 Converge | `spec-verifier` | `readonly: true` |
| 5 review | `bugbot` | 按项目 review-bugbot 规范 |

**禁止** Implementor 会话自审 spec 符合性；必须独立 Subagent。

---

## 七、复杂度裁剪

| complexity | Spec Lock | Analyze | Converge | UI |
|------------|-----------|---------|----------|-----|
| simple | 轻量 3～5 AC | 可跳过 | 简化 | 结构进 AC；视觉人工 |
| standard | 完整 + U1～U6（有原型） | 必须 | 必须 | ui-diff 结构复核 + 视觉 |
| complex | 完整 + U1～U6 | 必须 | 必须 + qa-expert | ui-diff 结构复核 + 视觉 |

在 `context.md` 和 checklist frontmatter 标注 `complexity`。

---

## 八、与其他 Skill 协作

| Skill | 关系 |
|-------|------|
| `#spec-lock` | 2.5 规格固化（含 `prototype-fidelity-rules`） |
| `#spec-analyze` | 2.6 实现前审查 |
| `#spec-converge` | 5.5 实现后收敛 |
| `#product-expert` / `#architect-expert` / `#dev-expert` | 项目阶段执行器 |
| `#skills-evolution` | 流程偏差时记录改进信号 |

---

## 九、变更记录

完成后追加 `.cursor/ai-changelog.jsonl`：

```json
{"date":"YYYY-MM-DD","type":"fdp","module":"{feature}","summary":"{阶段完成}","gates":"G3✅ G4✅"}
```

---

## MECE 自检

- 入口检测 × 阶段调度 × 门禁 × 裁剪 互斥 ✅
- 覆盖 full → delivery 全链路 ✅
- ⚠️ 栈专属规范由项目 Skills 提供，本 Skill 不重复定义
