# Changelog

本文件记录 **canonical FDK** 的版本变更。各消费项目通过 `kit.manifest.json` 的 `version` 核对是否已同步。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [1.7.1] - 2026-07-28

### Changed

- `README.md` / `使用指南.md`：流程简表补充 **G8 交付确认**、G5 Hook、5.6 踩坑回流；澄清「3 门禁（G3/G4/G7）」与完整 G1～G8 的关系

---

## [1.7.0] - 2026-07-23

### Added

- **TRAP-IRA**（In-Repo Alignment）— 同仓既有实现对齐：禁止「AC 能过」即交自创精简版
- 侦测 **IRA-Q1～Q3**；场景码 IRA-UI-PAGER / FILTER / STATUS / ACTION / IRA-API-EXPORT / IRA-SIBLING-SKIP
- `prototype-fidelity-rules.md`：与 TRAP-UID 正交；Analyze / 开发 / Converge / ui-diff 同仓对齐勾选

### 来源

- feature `work-brief-my-export` 回流（分页等偷懒实例推广为通用模式）

---

## [1.6.1] - 2026-07-23

### Fixed

- **`fdp-converge-check`**：Spec Lock 未 `approved: true` 时不再因 RTM 全 `pending` 触发 Converge followup（误把「规格刚锁、尚未开发」当成未收敛）

### Changed

- `使用指南.md` / `spec-converge`：写明 Converge stop hook 的 G3 前置条件

---

## [1.6.0] - 2026-07-22

### Added

- **`fdp-grill`** — 需求对齐追问；更新 `context.md` 领域词表 / 评审确认项
- **`fdp-dual-review`** — 规格轴 × 规范轴分立协议
- **`fdp-diagnose`** — 缺陷诊断环（复现→最小化→假设→观测→修复→回归）
- **`fdp-handoff`** — 跨会话交接 → `handoff.md`
- 模板 `templates/feature/handoff.md`；`context.md` 增加领域词表与评审确认项
- 方案说明 `docs/fdp-enhance-from-matt/README.md`（借鉴 mattpocock/skills，不替换主链）

### Changed

- FDP 步骤 1 建议先 grill；步骤 5/5.5 标明规范轴 / 规格轴
- `spec-converge` 报告模板强制规格轴分节，禁止用重构建议冒充 AC 缺口
- `fdp-routing.mdc` 增加 grill / diagnose / handoff / 双轴口令

---

## [1.5.0] - 2026-07-17

### Added

- **TRAP-CDF**（Config Default Compatibility）→ `templates/feature/test-cases/common-traps.md`
  - 侦测 Q5；场景码 `CDF-DEFAULT-MISMATCH` / `CDF-SWITCH-RELATED` / `CDF-LOAD-LEGACY`
- **UID-VIF-ELSE**（条件链挂错节点）→ `templates/feature/spec/prototype-fidelity-rules.md`
  - 场景码 `VIF-WRONG-ELSE` / `VIF-EMPTY-ONLY`
- 来源：`version-auto-create-enhancement` 踩坑回流（用户确认晋升 CDF+VIF）

---

## [1.4.0] - 2026-07-16

### Added

- **`fdk-contribute` Skill** — 踩坑回流与模式晋升：Converge 后评估 P1～P3，可复用则更新 canonical FDK
- FDP 步骤 **5.6**、`fdp-routing` 口令「踩坑回流 / 晋升 FDK」
- `spec-converge` 报告模板增加「可回流 FDK 踩坑」节

### Changed

- `CONTRIBUTING.md` 指向 `#fdk-contribute` 作为 AI 执行入口
- 文档明确 Git only 维护（`MAINTENANCE.md`）

---

## [1.3.0] - 2026-07-16

### Changed

- **SSOT 独立仓库**：从 `project-workspace` 提取为 `feature-delivery-kit-canonical`，作为多项目唯一维护源
- **模板去污**：`prototype-fidelity-rules.md` 移除 work-brief 专属示例列，改为通用占位示例
- 新增 `CONTRIBUTING.md`（踩坑回流与晋升规则）
- 新增 `MAINTENANCE.md`（多项目接入与升级）

### Added

- `scripts/link-to-project.ps1` — 将 canonical 联接/子模块到目标项目

---

## [1.2.0] - （历史，在 project-workspace 内演进）

### Added

- `prototype-fidelity-rules.md` — TRAP-UID / U1～U6 原型保真规则
- `test-cases/common-traps.md` — TRAP-BSA / RAS / DAS 边界陷阱模式库

---

## 消费项目升级检查

```powershell
# 在 canonical 仓库拉取最新后
cd your-project\feature-delivery-kit
# 若为 submodule: git pull
# 若为 junction: 自动同步，无需 pull
cd ..
.\feature-delivery-kit\scripts\install.ps1
# 重启 Cursor，核对 kit.manifest.json version
```
