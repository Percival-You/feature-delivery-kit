---
name: spec-converge
description: 实现后收敛 Converge — 对照 RTM/AC 查漏、更新状态、可循环直至收敛；关键词 Converge/收敛
---

# Spec Converge（实现后收敛）

> **目标**：开发完成后机械检查 AC 覆盖与测试映射，发现遗漏则生成补任务，循环直至收敛。

---

## 一、触发条件

- FDP 步骤 5.5
- 用户：「执行 Converge」「检查 AC 覆盖」
- Hook `fdp-converge-check.mjs` 返回 followup 时

---

## 二、输入

- `spec/rtm.md`、`spec/acceptance.md`
- `git diff`、测试目录
- `test-cases/`、`context.md`

---

## 三、执行方式

1. 运行本 Skill 逻辑（更新 RTM 状态、扫 diff 与测试）
2. **必须**委派只读 `spec-verifier` 对照 acceptance + diff
3. 合并产出 `converge-report.md`
4. 未收敛 → 生成补任务（写入 `tasks.md` 或 rtm 备注），回到 `#dev-expert`
5. 已收敛 → 更新 context G7，进入步骤 6 或 cross-review

---

## 四、收敛判定

```
已收敛 =
  ∀ P0 AC ∈ rtm: status ∈ {implemented, verified}
  AND 每个 P0 AC 的测试列非空或 git 中存在对应用例
  AND spec-verifier 报告无 P0 符合性差异
  AND（如配置 testCommand）测试命令退出码 0
  AND（有 UI 时）ui-spec 结构化项已 verifier 核对，且 ui-diff-checklist「结构复核」已勾选或注明遗留 P0
```

**不收敛**：

- 列出 pending P0 AC
- 建议下一步修改文件
- 更新 `context.md`：`converge: in_progress`，`round: N+1`

---

## 五、循环执行

| 模式 | 说明 |
|------|------|
| 手动 | 用户重复「执行 Converge」 |
| Skill 内 | dev 补完后同一会话再跑 Converge |
| Hook | `stop` + `followup_message`，`loop_limit` 默认 5 |

Hook 脚本做**机械检查**（RTM pending + 测试命令）；语义审查靠 `spec-verifier`。

---

## 六、输出 `converge-report.md`

> **双轴**：本报告只承担 **规格轴（Spec）**。代码风格/分层等归 **规范轴**，见 `#fdp-dual-review` 与项目 `#cross-review`，**禁止**混在 Pending P0 里用「重构建议」冒充 AC 缺口。

```markdown
# {feature} Converge 报告

> 轮次：{N} | 状态：converged / in_progress

## 摘要
- P0 AC 总数 / 已 verified / pending

## 规格轴（Spec）

### Pending P0
| AC-ID | 缺口 | 建议动作 |

### Verifier 差异（来自 spec-verifier）
...

## 规范轴（Standards）指针
- 详见 cross-review / `#fdp-dual-review`（本文件不展开规范问题清单）

## 下一步
- 已收敛 → 步骤 5.6 `#fdk-contribute`（踩坑回流，可选）→ 步骤 6 交付 / cross-review（规范轴）
- 未收敛 → 补任务列表

## 可回流 FDK 踩坑（已收敛时填写）
| 摘要 | 建议 TRAP | 是否建议晋升 |
|------|-----------|--------------|
| … | TRAP-BSA / TRAP-UID / 新模式 | 引用 / 晋升 / 待观察 |
```

收敛后 **建议** Read `#fdk-contribute`，将上表条目写入 `fdk-promotion-report.md`。

---

## 七、UI 范围说明

| 类型 | Converge 机械检查 | 人工走查 |
|------|-------------------|----------|
| 筛选/列/分栏/展示格式 | `ui-spec` + P0 AC + `prototype-fidelity-rules`（TRAP-UID） | ui-diff-checklist **结构复核** |
| 颜色/间距/字体 | 不自动 | ui-diff-checklist **视觉** |

**禁止**：用「像素走人工」覆盖未写入 ui-spec 的结构项。规则见 `templates/feature/spec/prototype-fidelity-rules.md`。

## 八、与 Hook 协作

`fdp-converge-check.mjs` 在 stop 时：

1. 读 `activeFeature` + checklist；**未 `approved: true` 则直接跳过**（Spec Lock / 澄清阶段不跑 Converge）
2. 读 `rtm.md`，统计 pending P0
3. 可选跑 `testCommand`
4. 有缺口 → `followup_message` 提示补 AC

---

## 九、与双轴审查

执行本 Skill 前可 Read `#fdp-dual-review`。规格轴未收敛时，不要宣布「开发完成可交付」。

---

## MECE 自检

- 功能覆盖（RTM）× 符合性（Verifier）× 客观测试（testCommand）互补 ✅
- 视觉 UI 归人工，不声称自动覆盖 ✅
- 规格轴 × 规范轴分离（`#fdp-dual-review`）✅
