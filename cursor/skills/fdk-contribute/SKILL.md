---
name: fdk-contribute
description: FDK 踩坑回流与模式晋升 — Converge 复盘时评估可复用陷阱并更新 canonical FDK；关键词 踩坑回流/晋升FDK/更新fdk/回流FDK
---

# FDK 踩坑回流与模式晋升

> **目标**：把 feature 开发中的踩坑，按规则沉淀为可复用 TRAP 模式写入 **canonical FDK**，或留在 feature 文档引用已有场景码。  
> **SSOT**：`feature-delivery-kit-canonical`（经 Junction 在本项目为 `feature-delivery-kit/`）。

---

## 一、触发条件

| 时机 | 说明 |
|------|------|
| **Converge 已收敛** | `#spec-converge` 完成后，FDP 步骤 **5.6**（可选但推荐） |
| 用户显式口令 | 「踩坑回流」「晋升 FDK」「更新 fdk」「回流 FDK」 |
| 复盘会话 | 用户要求从 `converge-report` / test-cases 提炼通用模式 |

**不触发**：快速通道、Converge 未收敛、仅修单个 feature 文案。

---

## 二、输入

1. `.cursor/fdp.config.json` → `docsRoot`、`activeFeature`
2. `{docsRoot}/{feature}/converge-report.md`
3. `{docsRoot}/{feature}/test-cases/*.md`
4. `{docsRoot}/{feature}/ui-diff-checklist.md`（有 UI 时）
5. 现有 FDK 模式库：
   - `feature-delivery-kit/templates/feature/test-cases/common-traps.md`
   - `feature-delivery-kit/templates/feature/spec/prototype-fidelity-rules.md`

---

## 三、晋升门禁（三条全满足才改 FDK）

| # | 条件 | 判定 |
|---|------|------|
| P1 | **可复用** | ≥2 个不同 feature/项目可能遇到同类问题 |
| P2 | **可机械检查** | 能写成「TRAP-ID + 侦测问题 + 场景码」或 Analyze/Converge 检查项 |
| P3 | **非业务特例** | 不含单一模块表名、接口路径、页面专有文案 |

**任一不满足** → 只更新 feature 文档，**引用已有** TRAP/场景码，**不改** canonical FDK。

---

## 四、决策树

```
收集踩坑条目（来自 converge-report / test-cases / ui-diff）
    ↓
每条：是否已被现有 TRAP + 场景码覆盖？
    ├─ 是 → feature 文档补引用即可，结束
    └─ 否 → 跑 P1～P3 晋升门禁
              ├─ 不通过 → 写入 feature test-cases，标注「待观察」；不晋升
              └─ 通过 → 进入第五节（须用户确认后改 FDK）
```

---

## 五、晋升时改哪些文件

| 变更类型 | 目标文件（均在 canonical / feature-delivery-kit） |
|----------|--------------------------------------------------|
| 后端持久化 / 序号 / 批量保存 | `templates/feature/test-cases/common-traps.md` |
| UI / 原型保真 | `templates/feature/spec/prototype-fidelity-rules.md` |
| Spec Lock / Analyze / Converge 流程 | `cursor/skills/spec-*/SKILL.md`、`cursor/agents/*.md` |
| Hook / 门禁 | `cursor/hooks/*.mjs` |

**模式 ID 命名**：`TRAP-{域}` 或 `UID-*`；场景码大写短横线（如 `BSA-MULTI-NEW`）。

**禁止**：
- 在 FDK 模板示例列写单一 feature 实例（如某模块页面名）
- 为相似业务在 FDK 新增平行文件（在 feature test-cases 派生）

---

## 六、执行步骤（晋升路径）

1. **输出晋升评估表**（见第七节），列出每条踩坑：保留 / 引用 / 晋升
2. **用户确认**晋升项（方案先行；未确认不改 FDK）
3. 编辑 canonical 对应文件（经 Junction 路径 `feature-delivery-kit/`）
4. **版本**：
   - 新模式或新场景码 → `kit.manifest.json` **minor** +1
   - 文案 / 示例修正 → **patch** +1
5. 更新 `CHANGELOG.md`（日期 + 变更摘要）
6. 若改了 `cursor/skills` / `agents` / `hooks` → 提醒执行：

```powershell
cd <项目根>
.\feature-delivery-kit\scripts\install.ps1
# 重启 Cursor
```

7. 在 canonical 仓库 `git commit`（用户要求提交时）
8. 在 feature 的 `converge-report.md` 或 `context.md` 追加「FDK 回流」节，记录晋升的模式 ID

---

## 七、输出格式

写入或追加 `{docsRoot}/{feature}/fdk-promotion-report.md`：

```markdown
# FDK 踩坑回流报告 — {feature}

> 日期：YYYY-MM-DD | kit 版本：{before} → {after}

## 评估摘要

| 踩坑摘要 | 处置 | TRAP/场景码 | 理由 |
|----------|------|-------------|------|
| … | 引用 / 晋升 / 保留 feature | TRAP-BSA / BSA-MULTI-NEW | P1～P3 |

## 已晋升（如有）

- [ ] `common-traps.md` / `prototype-fidelity-rules.md` / …
- [ ] `kit.manifest.json` → x.y.z
- [ ] `CHANGELOG.md`

## 待观察（未晋升）

- …（须在 ≥2 feature 复现后再晋升）

## MECE 自检

- 晋升项均满足 P1～P3 ✅
- 未把业务特例写入 FDK 模板 ✅
```

---

## 八、与 FDP 协作

| 阶段 | 动作 |
|------|------|
| 5.5 Converge 收敛后 | FDP 总指挥调度本 Skill（步骤 5.6） |
| `#spec-converge` | 收敛时在报告中标注「可回流踩坑」条目 |
| `#skills-evolution` | 流程类偏差记 workspace Skills；**可复用陷阱**走本 Skill |

---

## 九、口令速查

| 用户说 | 动作 |
|--------|------|
| 踩坑回流 / 晋升 FDK | 执行全文流程 |
| 只记录不晋升 | 仅写 feature test-cases + 报告，不改 FDK |
| 同步 fdk 到项目 | `install.ps1` + 核对 `kit.manifest.json` 版本 |

---

## MECE 自检

- 处置三分支（引用 / 晋升 / 保留 feature）互斥 ✅
- P1～P3 与文件映射、版本、install 闭环 ✅
- ⚠️ 单 feature 首次踩坑默认「待观察」，不自动晋升
