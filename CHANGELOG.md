# Changelog

本文件记录 **canonical FDK** 的版本变更。各消费项目通过 `kit.manifest.json` 的 `version` 核对是否已同步。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

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
