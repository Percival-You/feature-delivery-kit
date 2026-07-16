# FDK 贡献指南 — 踩坑回流与模式晋升

> **AI 执行**：Read `#fdk-contribute` Skill（Converge 后或用户说「踩坑回流/晋升 FDK」）。  
> **分类维度**：按「知识层级 × 是否晋升 FDK」

---

## 一、两层知识（MECE）

| 层级 | 存放位置 | 写什么 |
|------|----------|--------|
| **Feature 落地** | 各项目 `{docsRoot}/{feature}/test-cases/`、`ui-spec.md` | 本模块字段名、API、数据要点；**引用** TRAP 场景码 |
| **FDK 通用模式** | 本仓库 `templates/` | 可复用的 TRAP-ID、侦测问题 Q1～Qn、场景码 |

**原则**：相似业务 **不向 FDK 追加新文件**；在 feature 的 test-cases 里换实体名即可（见 `common-traps.md` §5）。

---

## 二、踩坑记录流程

```
开发/Converge 发现问题
    ↓
先写入 feature 文档（test-cases / converge-report / ui-diff-checklist）
    ↓
复盘：能否抽象为 ≥2 个 feature/项目可复用的模式？
    ├─ 否 → 留在 feature 文档，引用已有 TRAP / 场景码
    └─ 是 → 在本仓库提变更（见第三节）
```

---

## 三、晋升到 FDK 的标准

满足 **全部** 条件才修改本仓库 `templates/`：

1. **可复用**：至少 2 个不同 feature 或项目会遇到同一类问题
2. **可机械检查**：能写成「模式 ID + 侦测问题 + 场景码」或 Analyze/Converge 检查项
3. **非业务特例**：不含单一模块的表名、接口路径、页面专有文案

### 晋升时改哪些文件

| 变更类型 | 文件 |
|----------|------|
| 后端持久化/序号类 | `templates/feature/test-cases/common-traps.md` |
| UI/原型保真类 | `templates/feature/spec/prototype-fidelity-rules.md` |
| Spec Lock/Analyze 流程 | `cursor/skills/spec-*/SKILL.md`、`cursor/agents/*.md` |
| Hook/门禁逻辑 | `cursor/hooks/*.mjs` |

### 版本与记录

1. bump `kit.manifest.json` 的 `version`（semver：新模式 → minor，文案修正 → patch）
2. 在 `CHANGELOG.md` 写清变更
3. 各消费项目执行 `install.ps1` 并重启 Cursor

---

## 四、禁止事项

- ❌ 把某个 feature 的实例（如「work-brief 团队下拉」）写进 FDK 模板示例列
- ❌ 在每个业务项目里单独改 `feature-delivery-kit/`（应改 canonical 本仓库）
- ❌ 未 bump 版本就声称「已同步多项目」

---

## 五、编辑环境

在 **canonical 仓库**用 Cursor / VS Code 编辑即可；`.md` 与 `.mjs` / `.ps1` 均在此仓库 `git commit`，各消费项目再 `install.ps1`。

---

## MECE 自检

- Feature 落地 vs FDK 模式 互斥 ✅
- 晋升条件三条 可独立判定 ✅
- 版本/CHANGELOG/install 闭环 ✅
- ⚠️ 未覆盖「私有 fork」场景：若某项目需定制 Hook，应在消费项目 `.cursor/` 扩展而非改 canonical 通用逻辑
