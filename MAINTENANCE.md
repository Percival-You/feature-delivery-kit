# FDK 多项目维护指南

> 本仓库为 canonical SSOT；版本以 `kit.manifest.json` 为准。

---

## 一、架构

```
feature-delivery-kit/               ← SSOT（Git 主库，在此 commit）
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
# 在 canonical 仓库目录执行（<project-root> 替换为目标项目根目录）
.\scripts\link-to-project.ps1 -ProjectRoot "<project-root>"
```

示例：

```powershell
# Windows
.\scripts\link-to-project.ps1 -ProjectRoot "D:\path\to\your-project"

# macOS / Linux
./scripts/link-to-project.ps1 -ProjectRoot "/path/to/your-project"
```

### 方式 B：Git Submodule（项目已是 Git 仓库）

```powershell
cd <project-root>
git submodule add <fdk-remote-url> feature-delivery-kit
./feature-delivery-kit/scripts/install.ps1   # Windows 可用 .\feature-delivery-kit\scripts\install.ps1
```

本地无远程时，可先 `git submodule add ../feature-delivery-kit feature-delivery-kit`。

---

## 三、升级 kit

```powershell
cd <project-root>

# Submodule 项目
git submodule update --remote feature-delivery-kit

# Junction 项目：canonical 更新后自动生效，无需 pull

./feature-delivery-kit/scripts/install.ps1
# 重启 Cursor
```

核对：打开 `feature-delivery-kit/kit.manifest.json`，与 canonical 最新 `version` 一致。

---

## 四、已接入项目（示例，按需维护）

> 公开仓库可不维护此表；私有 fork 或团队内部可记录真实项目。

| 项目名 | 项目根路径 | 接入方式 | 业务 Git 是否包含 FDK |
|--------|------------|----------|----------------------|
| `<your-project>` | `<project-root>` | `junction` 或 `submodule` | 建议 **否**（FDK 与业务仓分离） |

---

## 五、与业务仓库的关系

- **FDK 变更**：只在本仓库（canonical）里 `git commit`
- **业务代码**：各项目自己的 Git 仓库提交，**不包含** FDK（除非误将 junction 目录 `git add` 进业务仓）
- **Feature 规格**（acceptance、rtm）：放在各项目 `docsRoot`（如 `.kiro/docs/tech/`），不放在本 kit 仓库

维护 FDK **仅需 Git + Cursor/VS Code**，Obsidian 非必需。

---

## 六、文档与草稿区

| 路径 | 是否纳入 Git | 说明 |
|------|--------------|------|
| `docs/名词解析.md`、`docs/fdp-enhance-from-matt/` | ✅ 是 | 已发布、README 引用的文档 |
| `docs/_draft/` | ❌ 否（`.gitignore`） | 未实现方案 / 设计草稿，仅本地保留 |

未实现的设计（如 FDP Console 可视化面板）放 `docs/_draft/`，待开发时再迁回 `docs/` 或单独开分支提交。

---

## MECE 自检

- 接入（junction / submodule）互斥，按项目是否 Git 选型 ✅
- 升级路径覆盖 submodule 与 junction ✅
- Feature 文档与 kit 职责分离 ✅
- 业务仓与 canonical 仓提交边界已说明 ✅
- 已发布文档与 `_draft` 草稿区职责分离 ✅
