# Feature Delivery Kit（FDP）

> **Canonical SSOT 仓库** — 多项目共用，勿在业务项目内单独改 kit。  
> 踩坑回流见 [CONTRIBUTING.md](./CONTRIBUTING.md)，多项目接入见 [MAINTENANCE.md](./MAINTENANCE.md)。

---

## 从这里开始

| 你想… | 读这个 |
|--------|--------|
| **日常开发怎么用、对 AI 说什么** | 👉 **[使用指南.md](./使用指南.md)** |
| 安装 / 移植到新项目 | [INSTALL.md](./INSTALL.md) |
| 多项目维护 / 升级 | [MAINTENANCE.md](./MAINTENANCE.md) |
| 踩坑晋升到 FDK | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| 包结构与技术说明 | 下文 |

---

## 是什么

将「需求 → 方案 → Spec Lock → 开发 → Converge → 交付」固化为：

- **流水线 Skills** — FDP 编排 + Spec Lock / Analyze / Converge / 踩坑回流  
- **增强 Skills（1.6）** — grill 对齐、双轴审查、diagnose、handoff（借鉴 mattpocock，不替换主链）  
- **2 个只读 Subagent** — 独立审查，不替实现者「自己审自己」  
- **2 个 Hook** — 未 Spec Lock 不写业务代码；结束时可 Converge 循环  
- **模板** — `context.md`（含领域词表）、`handoff.md`、`spec/*`（原型保真）、UI 走查清单

---

## 本仓库快速命令

```powershell
# 安装 / 升级 kit → .cursor
.\feature-delivery-kit\scripts\install.ps1

# 然后重启 Cursor，设 activeFeature，对 AI 说：
# feature work-brief，from_spec_lock，生成 Spec Lock
```

完整口令表见 **[使用指南.md § 十](./使用指南.md#十口令速查表)**。

---

## 对外 6 步 + 3 门禁（简表）

| 步骤 | 名称 |
|------|------|
| 1～2 | 需求澄清（建议 grill）→ PRD + 技术方案 |
| **2.5 ★** | **Spec Lock**（你确认清单） |
| 3～4 | 规范 → 任务拆解 |
| **2.6 ★** | **Analyze**（实现前） |
| 5 | 开发 + 单测 + review（规范轴） |
| **5.5 ★** | **Converge**（规格轴，可循环） |
| 6 | 接口 / 文档 / 提交 |
| — | **UI 走查**（结构复核 P0 + 视觉 P1） |
| — | grill / diagnose / handoff（按需） |

---

## 目录结构

```
feature-delivery-kit/
├── 使用指南.md          ← 日常实操（推荐先读）
├── README.md            ← 本文件
├── INSTALL.md           ← 移植
├── cursor/              # 安装源 → 复制到 .cursor/
├── templates/feature/   # 新 feature 文档模板
│   ├── test-cases/common-traps.md       ← TRAP-BSA/RAS/DAS
│   └── spec/prototype-fidelity-rules.md ← TRAP-UID / U1～U6 原型保真
└── scripts/install.ps1
```

---

## 配置

`.cursor/fdp.config.json` — 详见 [使用指南 § 2.3](./使用指南.md#23-配置改一次按需再改)。

---

## 版本

- kit: **1.6.0**（+ grill / 双轴审查 / diagnose / handoff；见 [CHANGELOG.md](./CHANGELOG.md)）
