# Feature Delivery Kit

> 面向 [Cursor](https://cursor.com) 的 Feature 交付流水线工具包 — 将「需求 → Spec Lock → 开发 → Converge → 交付」固化为 Skills、Hooks、Subagents 与文档模板。

[![Kit Version](https://img.shields.io/badge/kit-1.7.2-blue)](./kit.manifest.json)
[![Cursor](https://img.shields.io/badge/Cursor-IDE-000?style=flat&logo=cursor&logoColor=white)](https://cursor.com)
[![Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog-green)](./CHANGELOG.md)

---

## 简介

**Feature Delivery Kit（FDK）** 是一套可移植的 Cursor 工具包，解决开发中最常见的问题：**做完的功能和需求 / 原型对不上**。

通过 Spec Lock（开发前锁定验收清单）、Analyze（实现前一致性审查）、Converge（实现后查漏）三道门禁，配合 Hook 自动拦截未锁定规格下的业务代码写入，让 AI 辅助开发有章可循。

**Feature Delivery Pipeline（FDP）** 是使用本工具包跑通的交付流水线；每个 **feature**（如 `work-brief`）是流水线上的一次交付单元。

---

## 特性

| 能力 | 说明 |
|------|------|
| **流水线 Skills** | FDP 编排 + Spec Lock / Analyze / Converge / 踩坑回流 |
| **增强 Skills** | grill 对齐、双轴审查、diagnose、handoff |
| **Subagents** | `spec-analyzer`、`spec-verifier` — 独立审查，避免「自己审自己」 |
| **Hooks** | 未 Spec Lock 不写业务代码；会话结束可触发 Converge 循环 |
| **模板** | `context.md`、handoff、`spec/*`、UI 走查清单、通用 TRAP 陷阱库 |

---

## 快速开始

### 前置要求

- [Cursor IDE](https://cursor.com)（支持 Hooks v1、Subagents）
- Node.js 18+（Hook 脚本为 `.mjs`）
- PowerShell（Windows）或 Bash（macOS / Linux）

### 安装

```bash
# 1. 克隆到目标项目根目录
git clone <your-repo-url> feature-delivery-kit

# 2. 安装到 .cursor/
cd your-project
./feature-delivery-kit/scripts/install.ps1   # Windows
# ./feature-delivery-kit/scripts/install.sh  # macOS / Linux

# 3. 配置并重启 Cursor
cp .cursor/fdp.config.example.json .cursor/fdp.config.json
# 编辑 activeFeature、docsRoot、codePathGlobs、testCommand
```

详细步骤见 [INSTALL.md](./INSTALL.md)。

### 第一个 Feature

重启 Cursor 后，在 Agent 对话中说：

```text
feature work-brief，from_spec_lock，生成 Spec Lock
```

更多口令见 [使用指南 § 口令速查](./使用指南.md#十口令速查表)。

---

## 流水线概览

```mermaid
flowchart LR
    A[需求 / PRD] --> B[Spec Lock ★G3]
    B --> C[Analyze ★G4]
    C --> D[开发]
    D --> E[Converge ★G7]
    E -->|未收敛| D
    E --> F[交付 G8]
```

> **「3 门禁」** = **G3** Spec Lock、**G4** Analyze、**G7** Converge。完整 **G1～G8** 见 [名词解析 § 三](./docs/名词解析.md#三门禁关卡编号)。

| 步骤 | 名称 | 门禁 |
|------|------|------|
| 1～2 | 需求澄清（建议 grill）→ PRD + 技术方案 | G1、G2 |
| **2.5** | **Spec Lock** | **G3** |
| 3～4 | 规范 → 任务拆解 | — |
| **2.6** | **Analyze** | **G4** |
| 5 | 开发 + 单测 + review | G5 |
| **5.5** | **Converge**（可循环） | **G7** |
| 6 | 接口 / 文档 / 提交 | G8 |

---

## 文档

| 文档 | 用途 |
|------|------|
| [**使用指南.md**](./使用指南.md) | 日常实操、口令、场景 |
| [**docs/名词解析.md**](./docs/名词解析.md) | Converge、门禁、双轴等名词白话 |
| [INSTALL.md](./INSTALL.md) | 安装与移植到新项目 |
| [MAINTENANCE.md](./MAINTENANCE.md) | 多项目接入、升级、与业务仓边界 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 踩坑回流与模式晋升到 FDK |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更记录 |

---

## 项目结构

```
feature-delivery-kit/
├── README.md                 # 本文件
├── 使用指南.md                # 日常实操（推荐先读）
├── INSTALL.md
├── MAINTENANCE.md
├── CONTRIBUTING.md
├── kit.manifest.json         # 版本与包清单
├── cursor/                   # 安装源 → 复制到 .cursor/
│   ├── skills/
│   ├── agents/
│   ├── hooks/
│   └── fdp.config.example.json
├── templates/feature/        # 新 feature 文档模板
│   ├── test-cases/common-traps.md
│   └── spec/prototype-fidelity-rules.md
├── docs/                     # 已发布文档（纳入 Git）
│   ├── 名词解析.md
│   └── fdp-enhance-from-matt/
├── docs/_draft/              # 未实现设计稿（gitignore，仅本地）
└── scripts/
    ├── install.ps1
    └── install.sh
```

---

## 多项目使用

本仓库为 **canonical SSOT**。消费项目通过 **Git Submodule** 或 **目录联接（Junction）** 引用，执行 `install.ps1` 将内容同步到 `.cursor/`。

- Feature 规格文档（acceptance、rtm）放在各项目的 `docsRoot`，**不放在本 kit 仓库**
- FDK 变更在本仓库提交；业务代码在各项目自己的 Git 仓库提交

详见 [MAINTENANCE.md](./MAINTENANCE.md)。

---

## 贡献

踩坑复盘后，若模式可跨 feature 复用，可按 [CONTRIBUTING.md](./CONTRIBUTING.md) 晋升到 `templates/`。执行时 AI 读取 `#fdk-contribute` Skill。

---

## 许可证

暂未指定开源许可证。使用前请与仓库维护者确认使用范围。
