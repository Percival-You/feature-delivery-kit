---
name: fdp-grill
description: 需求对齐追问（grill）— 开发前把歧义问透并更新领域词表；关键词 grill/对齐一下/问透/需求澄清加深
---

# FDP Grill（需求对齐追问）

> **目标**：在写 PRD / Spec Lock 之前，用结构化追问消除歧义，并沉淀领域词表。  
> **借鉴**：mattpocock grilling（一次一问、决策树穷尽）；**不**接管 FDP 主链。

---

## 一、触发条件

| 时机 | 说明 |
|------|------|
| 用户口令 | 「对齐一下」「grill」「问透」「把需求问清楚」 |
| FDP 步骤 1 | 标准/复杂 feature **建议**先 grill 再写 PRD |
| 强制 | 涉及金钱 / 权限 / 状态流转，且尚未 grill |

**可跳过**：`complexity: simple`、快速通道「加字段」且引用数 ≤3、用户明确「跳过对齐」。

---

## 二、输入

1. `.cursor/fdp.config.json` → `docsRoot`、`activeFeature`
2. `{docsRoot}/{feature}/` 已有产品说明 / 原型 / 用户口述
3. `{docsRoot}/{feature}/context.md`（无则从模板创建）

---

## 三、执行规则

1. **一次只问一个**关键歧义；优先给 2～4 个选项（多选）  
2. 覆盖维度（MECE，按需取用，不必一次问完）：

| 维度 | 示例问题 |
|------|----------|
| 范围 | v1 做哪些角色/页面？明确非目标？ |
| 边界 | 与现有模块共用还是独立？数据谁写谁读？ |
| 状态 | 有哪些状态？非法流转如何拒绝？ |
| 权限 | 谁能看/改/推送？ |
| UI | 是否有原型？结构以谁为准？ |
| 失败 | 外部依赖失败时降级还是硬错？ |

3. 用户回答后：**简短复述确认**，再问下一题  
4. P0 歧义未关闭前：**禁止**建议进入 Spec Lock（`approved`）  
5. 全程使用并维护 `context.md`「领域词表」中的术语

---

## 四、输出（写回）

更新 `{docsRoot}/{feature}/context.md`：

1. **领域词表** — 新增/修订术语  
2. **评审确认项** — 表格记录议题与结论（D1、D2…）  
3. **待澄清** — 仍开放的问题（若有）  
4. 若用户确认范围清晰 → 门禁 **G1** 可标为通过（备注：经 grill）

结束后提示下一步口令，例如：

```text
feature {名}，继续写产品说明 / from_architecture / from_spec_lock
```

---

## 五、与 FDP 关系

```text
[本 Skill] → product-expert / PRD → 方案 → Spec Lock(G3) → …
```

不替代 `#product-expert`；grill 是其前置加深。  
不发布 GitHub Issue；SSOT 仍在 feature 文档目录。

---

## MECE 自检

- 追问维度：范围 × 边界 × 状态 × 权限 × UI × 失败 — 互斥  
- 与 Spec Lock / Analyze 无重叠（只对齐，不固化 AC）✅
