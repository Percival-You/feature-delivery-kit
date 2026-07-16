---
name: spec-lock
description: Spec Lock — 从 PRD/原型/技术方案生成 acceptance、ui-spec、rtm、acceptance-checklist；开发前规格固化
---

# Spec Lock（规格锁定）

> **目标**：开发前将需求转化为可执行规格合同，经人工确认后 `approved: true`，作为后续开发与审查的唯一依据。

---

## 一、触发条件

- FDP 步骤 2.5 / `from_spec_lock`
- 已有 tech-design，尚未 Spec Lock
- 用户：「生成 Spec Lock」「出实现清单」

---

## 二、输入

| 产物 | 路径 |
|------|------|
| 产品说明 / PRD | `{docsRoot}/{feature}/product-guide.md` 或 `design-standard/**/prd/` |
| 原型 | `{docsRoot}/{feature}/prototype.html` 或设计稿路径 |
| 技术方案 | `tech-design.md` |
| 测试矩阵 | `test-cases/`（如有） |
| 修订裁决 | `*-revision.md`（如有，优先级高于主文档） |

读取 `.cursor/fdp.config.json` 解析 `docsRoot`、`activeFeature`。

---

## 三、输出（`spec/` 目录）

```
{docsRoot}/{feature}/spec/
├── acceptance.md       # 可执行 AC（EARS / AC-xxx）
├── ui-spec.md          # 有 UI 时：页面→元素→约束
├── rtm.md              # 追溯矩阵
└── acceptance-checklist.md  # 汇总 + approved 开关
```

从 `feature-delivery-kit/templates/feature/spec/` 复制结构后填充。

---

## 四、执行步骤

```
Step 1: 确定 SSOT
    - 列出 product-guide、revision、prototype、tech-design 版本
    - 冲突以 revision / 评审表为准，写入 acceptance.md 头部
Step 2: 生成 acceptance.md
    - 每条 AC：ID、EARS 句式、优先级(P0/P1)、来源章节
    - P0 AC 必须可二值判定（能写测试或 Grep 断言）
Step 3: 生成 ui-spec.md（有 UI 时）
    - 必读 `templates/feature/spec/prototype-fidelity-rules.md`
    - 逐页运行 **U1～U6**；每页含「控件边界 / 列表列 / 分栏 / 展示格式」
    - 页面 ID、字段、按钮文案、布局约束；标注原型锚点
    - **禁止**把筛选器、表格列、双栏方向仅写成「走人工 ui-diff」
Step 4: 生成 rtm.md
    - 列：AC-ID | 来源 | 原型锚点 | 计划实现 | 测试 | 状态(pending)
Step 5: 生成 acceptance-checklist.md
    - frontmatter: approved: false, complexity, feature, date
    - 表格汇总全部 P0 AC
Step 5b: 运行 `test-cases/common-traps.md` **§1 通用侦测**（Q1～Q4）
    - 命中 TRAP-BSA / TRAP-RAS / TRAP-DAS → 在 `test-cases/` 按 **§5 派生表** 引用场景码（至少含 **BSA-MULTI-NEW**）
Step 5c: 有原型时 — `prototype-fidelity-rules.md` **U1～U6**
    - 生成/更新 `{feature}/ui-diff-checklist.md`（含结构复核节）
    - P0 UI AC 须可二值判定（含 TRAP-UID 禁止项）
Step 6: 暂停 — 请用户确认
    - 用户确认后改 approved: true，更新 context.md G3
    - 同步 fdp.config.json activeFeature
```

---

## 五、AC 编写规范

**好的 AC（可执行）：**

```markdown
### AC-RULE-03 [P0]
- **EARS**: When 用户提交 remark 超过 100 字, the system shall 返回 bizCode≠0
- **来源**: product-guide-revision D6
- **验证**: 集成测试 / API 断言
```

**差的 AC（禁止）：**

- 「布局合理」「体验良好」

---

## 六、人工门禁

**未获用户明确确认前**：

- 不得将 `approved` 改为 `true`
- 不得开始写业务代码

用户确认话术示例：「Spec Lock 确认，可以开发」

---

## 七、与 Hook 协作

`fdp-spec-lock-gate.mjs` 在 `approved: false` 时阻断对 `codePathGlobs` 的 Write。

允许写入 `spec/`、`test-cases/`、`context.md` 等（见 `exemptWritePaths`）。

---

## MECE 自检

- acceptance（行为）× ui-spec（结构）× rtm（追溯）× checklist（门禁）互不重叠 ✅
- 穷尽 P0 需求与 UI 结构 ⚠️ P2 视觉细节依赖人工 ui-diff-checklist
