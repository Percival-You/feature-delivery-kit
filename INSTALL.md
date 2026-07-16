# Feature Delivery Kit — 安装与移植指南

> 日常怎么用（口令、场景、门禁）请看 **[使用指南.md](./使用指南.md)**。

## 一、系统要求

- Cursor IDE（支持 Hooks v1、Subagents）
- Node.js 18+（Hook 脚本为 `.mjs`，跨 Windows / macOS / Linux）
- Git 仓库（可选，Hook 会读 `git diff`）

---

## 二、安装步骤

### 2.1 复制 kit 到目标项目

将整个 `feature-delivery-kit/` 目录复制到**项目工作区根目录**。

```
your-project/
├── feature-delivery-kit/    ← 保留，便于升级 kit
├── .cursor/                 ← 安装目标
└── ...
```

### 2.2 执行安装脚本

**Windows（PowerShell）：**

```powershell
cd your-project
.\feature-delivery-kit\scripts\install.ps1
```

**macOS / Linux：**

```bash
cd your-project
chmod +x feature-delivery-kit/scripts/install.sh
./feature-delivery-kit/scripts/install.sh
```

脚本会：

1. 复制 `cursor/skills/*` → `.cursor/skills/`
2. 复制 `cursor/agents/*` → `.cursor/agents/`
3. 复制 `cursor/hooks/*` → `.cursor/hooks/`
4. 合并或创建 `.cursor/hooks.json`（见 2.4）
5. 若不存在则创建 `.cursor/fdp.config.json`（从 example 复制）

### 2.3 配置 `fdp.config.json`

```powershell
copy .cursor\fdp.config.example.json .cursor\fdp.config.json
```

必改项：

| 字段 | 说明 | 示例 |
|------|------|------|
| `docsRoot` | feature 文档根目录 | `.kiro/docs/tech` 或 `docs/features` |
| `codePathGlobs` | 受 Spec Lock 保护的代码路径 | `["src/**", "app/**"]` |
| `testCommand` | Converge stop hook 跑的测试 | `pnpm vitest --run` |
| `activeFeature` | 当前开发的 feature 名 | `work-brief` |

### 2.4 合并已有 `hooks.json`

若项目已有 `.cursor/hooks.json`，安装脚本**不会覆盖**，而是生成 `.cursor/hooks.fdp.json` 片段。

手动合并示例：

```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "command": "node .cursor/hooks/fdp-spec-lock-gate.mjs",
        "matcher": "Write",
        "timeout": 15
      }
    ],
    "stop": [
      {
        "command": "node .cursor/hooks/fdp-converge-check.mjs",
        "loop_limit": 5,
        "timeout": 120
      }
    ]
  }
}
```

### 2.5 启用路由规则（可选）

将 `feature-delivery-kit/cursor/rules/fdp-routing.mdc` 复制到 `.cursor/rules/`，或在现有 `expert-routing.mdc` 末尾追加 FDP 章节。

### 2.6 重启 Cursor

保存 `hooks.json` 后重启 Cursor，在 **Settings → Hooks** 确认已加载。

---

## 三、文档目录约定

每个 feature 在 `{docsRoot}/{feature}/` 下：

```
{feature}/
├── context.md
├── tech-design.md          # 可选，步骤 2 产出
├── test-cases/             # 可选；含 common-traps.md（FDK 通用边界陷阱）
├── tasks.md                # 可选
└── spec/
    ├── acceptance.md
    ├── ui-spec.md          # 有 UI 时
    ├── rtm.md
    └── acceptance-checklist.md
```

从模板初始化：

```powershell
$feature = "my-feature"
$dest = ".kiro/docs/tech/$feature"
New-Item -ItemType Directory -Force -Path "$dest/spec"
Copy-Item feature-delivery-kit/templates/feature/* $dest -Recurse
# 替换模板中的 {feature} 占位符
```

---

## 四、升级 kit

1. 用新版本覆盖 `feature-delivery-kit/`
2. 重新运行 `install.ps1`
3. 对比 `fdp.config.example.json` 是否有新增字段

---

## 五、卸载

1. 删除 `.cursor/skills/feature-delivery-pipeline` 等 4 个 skill 目录
2. 删除 `.cursor/agents/spec-analyzer.md`、`spec-verifier.md`
3. 删除 `.cursor/hooks/fdp-*.mjs`
4. 从 `hooks.json` 移除 FDP 相关条目
5. 删除 `feature-delivery-kit/`（可选）

---

## MECE 自检

- 安装 / 配置 / 文档约定 / 升级 / 卸载 互斥 ✅
- 覆盖 Windows 与 Unix 安装路径 ✅
- ⚠️ 多工作区 monorepo 需为每个子项目单独配置 `codePathGlobs`
