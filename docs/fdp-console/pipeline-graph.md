# FDP 固定流水线节点图

> 版本：v0.1  
> 日期：2026-07-21  
> 状态：方案评审中  
> 前置：`fdp-state-schema.md`

---

## 一、原则

| 原则 | 说明 |
|------|------|
| 拓扑固定 | 前端/配置写死，**不支持拖拽改边** |
| 状态外置 | 节点颜色/徽章来自 `fdp-state.json` |
| 与 FDP Skill 对齐 | 节点对应总指挥 6 步 + Analyze/Converge 门禁 |
| Converge 可见循环 | 用**自环边** + `round` 徽章，不另开无限新节点 |

配置文件建议路径（实现时）：`tools/fdp-console/src/pipeline.graph.json`（或 kit 内 `docs/fdp-console/pipeline.graph.json` 供面板引用）。

---

## 二、节点定义

| id | 显示名 | FDP 步骤 | 关联门禁 | 人工可确认 |
|----|--------|----------|----------|------------|
| `clarify` | 需求澄清 | 1 | G1 | 可选 |
| `design` | PRD + 方案 | 2 | G2 | 可选 |
| `spec_lock` | Spec Lock | 2.5 | **G3** | **是** |
| `analyze` | Analyze | 2.6 | **G4** | 否 |
| `tasks` | 任务拆解 | 4 | — | 否 |
| `develop` | 开发 + 单测 | 5 | G5（派生） | 否 |
| `review` | Review | 5 | — | 否 |
| `converge` | Converge | 5.5 | **G7** | 否* |
| `fdk_contribute` | 踩坑回流 | 5.6 | — | 可选 |
| `delivery` | 交付 | 6 | G8 | 可选 |
| `ui_verify` | UI 走查 | 并行 | 结构→G7 | **勾选** |

\* 面板不手写「已收敛」；仅展示 `converge.status` / round。

`ui_verify` 在图上作为 **旁路节点**（连到 `converge` / `delivery`），表示人工走查，不插入主链中间打断开发（结构未完成时通过 `nextAction.blockedBy` 提示）。

---

## 三、边（固定连线）

### 3.1 主链

```text
clarify → design → spec_lock → analyze → tasks → develop → review → converge → fdk_contribute → delivery
```

| from | to | 条件（展示用） |
|------|-----|----------------|
| clarify | design | G1 passed/skipped |
| design | spec_lock | G2 passed/skipped |
| spec_lock | analyze | G3 passed；complexity≠simple 或未 skip Analyze |
| spec_lock | tasks | G3 passed 且 Analyze `skipped` |
| analyze | tasks | G4 passed/skipped |
| tasks | develop | — |
| develop | review | — |
| review | converge | — |
| converge | fdk_contribute | converge.status=`converged` |
| fdk_contribute | delivery | 可选跳过（边标 optional） |
| converge | delivery | 跳过回流时的虚线边 |

### 3.2 Converge 自环（循环）

| from | to | 类型 | 展示 |
|------|-----|------|------|
| converge | converge | `loop` | 标注 `round {N}`；`in_progress` 时高亮 |

语义：未收敛时停留在 `converge`，自环表示「补任务 → 再 Converge」；不新增 `converge_2` 节点。

### 3.3 UI 旁路

| from | to | 说明 |
|------|-----|------|
| develop | ui_verify | 开发中可并行走查 |
| ui_verify | converge | 结构完成利于 G7 |
| ui_verify | delivery | 视觉 P1 可延后到交付前 |

---

## 四、图配置 JSON（实现用草案）

```json
{
  "version": 1,
  "nodes": [
    { "id": "clarify", "label": "需求澄清", "gate": "G1", "promptTemplate": "按 FDP，feature {feature}，从需求开始" },
    { "id": "design", "label": "PRD + 方案", "gate": "G2", "promptTemplate": "feature {feature}，from_architecture，出技术方案" },
    { "id": "spec_lock", "label": "Spec Lock", "gate": "G3", "promptTemplate": "feature {feature}，from_spec_lock，生成 Spec Lock", "confirmAction": "approve_g3" },
    { "id": "analyze", "label": "Analyze", "gate": "G4", "promptTemplate": "feature {feature}，执行 Analyze" },
    { "id": "tasks", "label": "任务拆解", "gate": null, "promptTemplate": "feature {feature}，拆解 tasks.md" },
    { "id": "develop", "label": "开发 + 单测", "gate": "G5", "promptTemplate": "feature {feature}，按 tasks 开发" },
    { "id": "review", "label": "Review", "gate": null, "promptTemplate": "feature {feature}，执行 cross-review" },
    { "id": "converge", "label": "Converge", "gate": "G7", "promptTemplate": "feature {feature}，执行 Converge", "loop": true },
    { "id": "fdk_contribute", "label": "踩坑回流", "gate": null, "promptTemplate": "feature {feature}，踩坑回流 FDK", "optional": true },
    { "id": "delivery", "label": "交付", "gate": "G8", "promptTemplate": "feature {feature}，交付确认 / 文档与提交" },
    { "id": "ui_verify", "label": "UI 走查", "gate": null, "promptTemplate": null, "sidebar": "uiDiff" }
  ],
  "edges": [
    { "from": "clarify", "to": "design" },
    { "from": "design", "to": "spec_lock" },
    { "from": "spec_lock", "to": "analyze", "when": "analyzeRequired" },
    { "from": "spec_lock", "to": "tasks", "when": "analyzeSkipped" },
    { "from": "analyze", "to": "tasks" },
    { "from": "tasks", "to": "develop" },
    { "from": "develop", "to": "review" },
    { "from": "review", "to": "converge" },
    { "from": "converge", "to": "converge", "type": "loop", "label": "round" },
    { "from": "converge", "to": "fdk_contribute", "when": "converged" },
    { "from": "converge", "to": "delivery", "when": "converged", "style": "optional" },
    { "from": "fdk_contribute", "to": "delivery", "style": "optional" },
    { "from": "develop", "to": "ui_verify", "style": "parallel" },
    { "from": "ui_verify", "to": "converge", "style": "parallel" },
    { "from": "ui_verify", "to": "delivery", "style": "parallel" }
  ]
}
```

---

## 五、节点视觉状态

由 `currentNodeId` + `gates` + `converge` 推导：

| 视觉 | 条件 |
|------|------|
| done（绿） | 对应 gate=`passed`/`skipped`，或已离开该节点 |
| current（蓝/高亮） | `id === currentNodeId` |
| blocked（红） | 前置门禁 `blocked` 或 `nextAction.blockedBy` 指向该门禁 |
| todo（灰） | 未到达 |
| loop-active | `converge` 且 `converge.status=in_progress` |

Converge 徽章：`R{round}`；`converged` 时显示 ✓。

---

## 六、面板布局（P0）

```text
┌─────────────────────────────────────────────────────────┐
│ Feature: [work-brief ▼]    complexity    刷新            │
├─────────────────────────────────────────────────────────┤
│  【固定流程图：节点 + 连线 + Converge 自环】               │
├──────────────────────────────┬──────────────────────────┤
│ 门禁列表 G1～G8              │ 下一步                    │
│ G3 [批准 Spec Lock]          │ [复制口令]                │
│                              │ blockedBy / hint          │
├──────────────────────────────┴──────────────────────────┤
│ UI 走查勾选（structure / visual）                         │
│ ☑ S1 ...   ☐ V1 ...                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 七、复杂度裁剪对图的影响

| complexity | 图表现 |
|------------|--------|
| simple | `analyze` 显示 skipped（虚节点）；可 `spec_lock → tasks` |
| standard / complex | 必经 `analyze`；complex 可在 `review` 备注 qa-expert（文案，不增节点） |

---

## 八、MECE 自检

- 分类维度：主链节点 × 自环 × UI 旁路 × 可选回流  
- 无重叠：UI 不插入主链序号，避免与 develop/converge 抢「当前步骤」  
- 无遗漏：FDP 对外步骤均有节点；⚠️ G3.5「规范命名」未单独建节点（并入 tasks/develop），若需可见可二期加 `standards`
