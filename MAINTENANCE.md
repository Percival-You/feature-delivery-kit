# FDK 多项目维护指南

> canonical 仓库路径：`D:\workspace\feature-delivery-kit-canonical`  
> 版本以 `kit.manifest.json` 为准。

---

## 一、架构

```
feature-delivery-kit-canonical/     ← SSOT（Git 主库，在此 commit）
        │
        ├── junction（无 Git 的项目）
        └── git submodule（有 Git 的项目）
        │
        ▼
your-project/feature-delivery-kit/
        │
        install.ps1
        ▼
your-project/.cursor/               ← Cursor 运行时
```

---

## 二、新项目接入

### 方式 A：目录联接（推荐，项目尚未用 Git）

```powershell
# 在 canonical 仓库目录执行
.\scripts\link-to-project.ps1 -ProjectRoot "D:\path\to\your-project"
```

### 方式 B：Git Submodule（项目已是 Git 仓库）

```powershell
cd D:\path\to\your-project
git submodule add <fdk-remote-url> feature-delivery-kit
.\feature-delivery-kit\scripts\install.ps1
```

本地无远程时，可先 `git submodule add ../feature-delivery-kit-canonical feature-delivery-kit`。

---

## 三、升级 kit

```powershell
cd D:\path\to\your-project

# Submodule 项目
git submodule update --remote feature-delivery-kit

# Junction 项目：canonical 更新后自动生效，无需 pull

.\feature-delivery-kit\scripts\install.ps1
# 重启 Cursor
```

核对：打开 `feature-delivery-kit/kit.manifest.json`，与 canonical 最新 `version` 一致。

---

## 四、当前已接入项目

| 项目 | 路径 | 接入方式 | 业务 Git 是否包含 FDK |
|------|------|----------|----------------------|
| project-workspace | `D:\workspace\project-workspace` | Junction → canonical | **否**（`project/`、`project-front/` 为独立仓库，FDK 在其外） |

---

## 五、与业务仓库的关系

- **FDK 变更**：只在 `feature-delivery-kit-canonical` 里 `git commit`
- **业务代码**：各项目自己的 Git 仓库提交，**不包含** FDK（除非误将 junction 目录 `git add` 进业务仓）
- **Feature 规格**（acceptance、rtm）：放在各项目 `docsRoot`（如 `.kiro/docs/tech/`），不放在本 kit 仓库

维护 FDK **仅需 Git + Cursor/VS Code**，Obsidian 非必需。

---

## MECE 自检

- 接入（junction / submodule）互斥，按项目是否 Git 选型 ✅
- 升级路径覆盖 submodule 与 junction ✅
- Feature 文档与 kit 职责分离 ✅
- 业务仓与 canonical 仓提交边界已说明 ✅
