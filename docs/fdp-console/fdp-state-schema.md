# fdp-state.json 状态字段约定

> 版本：v0.1  
> 日期：2026-07-21  
> 状态：方案评审中  
> 前置：`docs/fdp-console/README.md`

---

## 一、放置与职责

| 项 | 约定 |
|----|------|
| 路径 | `{docsRoot}/{feature}/fdp-state.json` |
| 职责 | **面板与自动化的机器可读 SSOT** |
| 人读文档 | `context.md` / checklist / converge-report 仍保留；关键门禁字段与 state **双写** |
| 缺失时 | 面板可从 checklist frontmatter + converge-report 头 **推导生成** 初稿，不阻塞打开 |

全局仍用 `.cursor/fdp.config.json` 的 `activeFeature` / `docsRoot` 定位当前 feature。

---

## 二、顶层 Schema（v1）

```json
{
  "$schema": "fdp-state-v1",
  "feature": "work-brief",
  "complexity": "standard",
  "entryMode": "from_development",
  "currentNodeId": "converge",
  "updatedAt": "2026-07-21T12:00:00+08:00",
  "updatedBy": "console",
  "gates": {},
  "checklist": {},
  "converge": {},
  "uiDiff": {},
  "nextAction": {}
}
```

### 2.1 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `$schema` | string | 固定 `fdp-state-v1` |
| `feature` | string | 与目录名、`fdp.config.activeFeature` 一致 |
| `complexity` | `simple` \| `standard` \| `complex` | 裁剪 Analyze/UI 等 |
| `entryMode` | string | 同 FDP：`full` / `from_architecture` / `from_spec_lock` / `from_development` / `resume_converge` / `fast_track` |
| `currentNodeId` | string | 见 [pipeline-graph.md](./pipeline-graph.md) 节点 id |
| `updatedAt` | ISO-8601 | 最后写入时间 |
| `updatedBy` | `human` \| `agent` \| `console` \| `hook` | 来源追溯 |

---

## 三、gates（门禁）

```json
"gates": {
  "G1": { "status": "passed", "at": "2026-07-11", "note": "product-guide v1.8" },
  "G2": { "status": "passed", "at": "2026-07-11", "note": "tech-design.md" },
  "G3": { "status": "passed", "at": "2026-07-14T10:00:00+08:00", "note": "approved: true" },
  "G4": { "status": "passed", "at": "2026-07-15", "note": "no P0" },
  "G5": { "status": "passed", "at": "", "note": "hook" },
  "G7": { "status": "passed", "at": "2026-07-15", "note": "round 3 converged" },
  "G8": { "status": "pending", "at": "", "note": "" }
}
```

| `status` | 含义 |
|----------|------|
| `pending` | 未通过，可能阻塞 |
| `passed` | 已通过 |
| `skipped` | 复杂度裁剪跳过（如 simple 跳过 Analyze） |
| `blocked` | 有阻断项，不可前进 |

| 门禁 | 面板可点确认？ | 写回同步 |
|------|----------------|----------|
| G1 / G2 | 可选（人工） | 仅 state + 建议改 context |
| **G3** | **必须支持** | state + `acceptance-checklist.md` frontmatter `approved: true` |
| G4 | 否（Agent/报告） | Agent 更新；面板只读展示 |
| G5 | 否（Hook） | 由 G3 + config 推导 |
| **G7** | 只读展示轮次 | Agent 写 converge；面板不伪造 converged |
| G8 | 可选确认 | state；交付清单另议 |

P0 面板**必做**的人工写回：`G3` 批准。G1/G2/G8 可二期。

---

## 四、checklist（Spec Lock 摘要）

```json
"checklist": {
  "approved": true,
  "approvedAt": "2026-07-14T10:00:00+08:00",
  "approvedBy": "owner",
  "path": "spec/acceptance-checklist.md"
}
```

**双写规则（G3 批准时）**：

1. `checklist.approved = true`，填 `approvedAt` / `approvedBy`
2. `gates.G3.status = passed`
3. 更新 `acceptance-checklist.md` frontmatter：`approved: true`
4. `currentNodeId` → 按图推进到 `analyze`（若 complexity 要求 Analyze）或 `develop`
5. 刷新 `nextAction`

---

## 五、converge（循环）

```json
"converge": {
  "round": 3,
  "status": "converged",
  "loopLimit": 5,
  "lastReportPath": "converge-report.md"
}
```

| `status` | 图上表现 |
|----------|----------|
| `idle` | 尚未进入 Converge |
| `in_progress` | Converge 节点高亮 + 自环动画/标注 round |
| `converged` | 自环结束，边指向 `delivery` |

面板**不**把 G7 标为 passed，除非读到 `status: converged`（或用户显式确认「已人工验收收敛」——P0 不做，避免绕过 verifier）。

---

## 六、uiDiff（UI 勾选）

```json
"uiDiff": {
  "path": "ui-diff-checklist.md",
  "structureComplete": false,
  "visualComplete": false,
  "items": [
    {
      "id": "team-round:S1",
      "page": "team-round",
      "section": "structure",
      "label": "U1 页级控件 — 无多余控件",
      "checked": false,
      "priority": "P0"
    },
    {
      "id": "team-round:V1",
      "page": "team-round",
      "section": "visual",
      "label": "间距、字号、颜色",
      "checked": false,
      "priority": "P1"
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `structureComplete` | 全部 `section=structure` 且 P0 已勾 |
| `visualComplete` | 全部 visual 已勾（不阻塞 G7） |
| `items[]` | 面板勾选主数据；写回时同步改 md |

**写回策略（推荐）**：

1. 面板改 `items[].checked` → 保存 json  
2. 本地 API 按 `id` 更新 `ui-diff-checklist.md` 对应行的 `☐`/`☑`（或 `- [ ]`/`- [x]`）  
3. 重算 `structureComplete`；若结构未完成，`nextAction.blockedBy` 可含 `ui_structure`

首次打开若 json 无 `items`：从 md **解析生成** items（允许启发式）；解析失败则只读 md、禁用勾选并提示。

---

## 七、nextAction（下一步口令）

```json
"nextAction": {
  "nodeId": "analyze",
  "prompt": "feature work-brief，执行 Analyze",
  "blockedBy": null,
  "hint": "复制后贴到 Cursor"
}
```

| `blockedBy` | 含义 |
|-------------|------|
| `null` | 可复制口令推进 |
| `G3` | 需先批准 Spec Lock |
| `G4_P0` | Analyze 仍有 P0（只读提示） |
| `ui_structure` | 结构走查未完成（影响宣称 G7） |
| `converge_pending` | 有 pending AC，应再跑 Converge |

口令模板由 `pipeline-graph.md` 的 `promptTemplate` + `feature` 名格式化，**不在页内执行 Agent**。

---

## 八、谁写 state

| 写入方 | 时机 |
|--------|------|
| console | G3 批准、UI 勾选、可选 G1/G2/G8 |
| agent（Skill） | Spec Lock / Analyze / Converge / 更新 context 时同步 gates、converge、currentNodeId |
| hook | 可选：stop 时机械刷新 converge.round（二期） |
| 推导 | 文件缺失时由 API bootstrap |

P0 实现可先：**console 写人工项 + bootstrap 推导**；Skill 双写规则进文档，代码随后补。

---

## 九、与现有门禁兼容

| 现有 SSOT | 关系 |
|-----------|------|
| `acceptance-checklist.md` `approved` | G3 权威之一；与 `checklist.approved` 双写 |
| Hook `fdp-spec-lock-gate` | 仍读 checklist frontmatter，**不改 Hook 语义** |
| `context.md` 门禁表 | 人读；Agent 更新时尽量与 state 一致（允许短暂漂移） |
| `converge-report.md` | converge 轮次/状态的人读源 |

---

## 十、MECE 自检

- 分类维度：元数据 × 门禁 × Spec Lock × Converge × UI × 下一步  
- 无重叠：UI 明细在 `uiDiff.items`，门禁结果在 `gates`  
- 无遗漏：P0 面板读写路径已覆盖；⚠️ Skill 强制双写属实现阶段，本文件只定约定
