# FDP Console（门禁可视化面板）— 设计索引

> 版本：v0.1  
> 日期：2026-07-21  
> 状态：方案评审中  
> 范围：独立小页 + 本地读仓库；不拖拽自定义工作流；不唤起 Cursor Agent

---

## 一、目标

在浏览器打开本地面板，完成：

| 能力 | 说明 |
|------|------|
| 查看状态 | feature、当前节点、门禁、阻塞原因 |
| UI 勾选 | 结构 P0 / 视觉 P1 勾选写回 |
| 门禁确认 | 如 G3 批准 → 解锁下一步 |
| 固定流程图 | 节点 + 连线（含 Converge 自环） |
| 下一步 | 复制口令，贴回 Cursor Agent |

---

## 二、文档

| 文档 | 内容 |
|------|------|
| [fdp-state-schema.md](./fdp-state-schema.md) | `fdp-state.json` 字段与写回约定 |
| [pipeline-graph.md](./pipeline-graph.md) | 固定节点、边、Converge 循环展示 |

---

## 三、架构摘要

```text
{docsRoot}/{feature}/fdp-state.json  ← 机器可读 SSOT（面板主读）
{docsRoot}/{feature}/spec/*.md       ← 人读；面板写回时双写关键字段
{docsRoot}/{feature}/ui-diff-checklist.md
.cursor/fdp.config.json              ← activeFeature、docsRoot

tools/fdp-console/                   ← Vite 前端 + 本地 API（实现阶段再建）
```

---

## 四、非目标（P0）

- 拖拽编排 / 自定义节点
- 页内直接调用 Cursor Agent
- 替代 Skill / Hook（Hook 仍以 checklist `approved` 等为准）
