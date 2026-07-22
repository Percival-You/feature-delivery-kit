---
name: fdp-handoff
description: 跨会话交接 — 压缩当前 feature 进度为 handoff.md；关键词 交接/handoff/换会话继续
---

# FDP Handoff（跨会话交接）

> **目标**：长 feature 换对话/换人时，用一份短文档接上，避免重复澄清。  
> **借鉴**：mattpocock handoff。

---

## 一、触发

- 「交接」「写 handoff」「换会话继续」「给下一任 Agent」

---

## 二、输入

- `fdp.config.json`（activeFeature）
- `context.md`、`spec/acceptance-checklist.md`、`tasks.md`、`converge-report.md`（若有）
- 当前对话中的未决决策

---

## 三、输出

写入 `{docsRoot}/{feature}/handoff.md`（覆盖或按日期追加节）。

使用模板 `templates/feature/handoff.md`，至少包含：

| 节 | 内容 |
|----|------|
| 目标 | 一句话 |
| 当前节点 | FDP 步骤 / `current_step` / 门禁摘要 |
| 已完成 | 要点列表 |
| 进行中 | 正在改的文件/AC |
| 未决问题 | 须人决定的歧义 |
| 下一步口令 | 可直接复制的一句 |
| 禁区 | 不要改什么 / 已知雷区 |

---

## 四、交接后用法

下一会话第一条：

```text
feature {名}，读 handoff.md 后继续
```

Agent 应先 Read `handoff.md` + `context.md`，再行动。

---

## MECE 自检

- 状态压缩 × 下一步 × 禁区 — 覆盖接续所需 ✅  
- 不替代 Spec Lock / context 流水线状态 ✅
