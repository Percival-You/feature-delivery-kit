---
name: fdp-dual-review
description: 双轴审查协议 — 规格轴（AC/RTM）与规范轴（代码质量）分列；关键词 双轴审查/规格轴/规范轴
---

# FDP 双轴审查

> **目标**：禁止用「代码看起来行」冒充「规格已满足」。规格轴与规范轴**分开列问题**。  
> **借鉴**：mattpocock code-review（Standards × Spec）。

---

## 一、两轴定义

| 轴 | 职责 | 执行者 | 典型产出 |
|----|------|--------|----------|
| **规格轴（Spec）** | AC/RTM/ui-spec 是否落地；原型结构 P0 | `#spec-converge` + `spec-verifier` | `converge-report.md` |
| **规范轴（Standards）** | 分层、安全、风格、错误处理、项目 Skills | 项目 `#cross-review` / bugbot；无则用本 Skill 轻量清单 | 交叉审查报告或下方模板 |

**禁止**：

- 在 Converge 里用代码风格问题顶替 pending AC  
- 在 cross-review 里用「功能好像对」代替对照 AC-ID  

---

## 二、触发

- FDP 步骤 5（开发后 review）与 5.5（Converge）  
- 用户：「双轴审查」「按规格和规范分开查」

---

## 三、报告必须分节

```markdown
## 规格轴（Spec）
| ID | 结论 | 说明 |
|----|------|------|
| AC-xxx | pass / gap | |

## 规范轴（Standards）
| 项 | 结论 | 说明 |
|----|------|------|
| 分层/事务/权限… | pass / issue | |
```

两轴问题列表**不得合并成一张「综合问题」表后丢失轴标签**。

---

## 四、无 cross-review 时的轻量规范轴清单

仅当宿主项目未安装 `#cross-review` 时使用：

| # | 检查项 |
|---|--------|
| S1 | 变更是否落在正确分层（禁止 Domain 调 Infrastructure 细节泄漏到 UI） |
| S2 | 写操作是否有权限/校验；金钱/状态字段是否有单测 |
| S3 | 错误码与现有模块一致；无吞异常 |
| S4 | 无无关大重构；diff 聚焦需求 |
| S5 | 新增公共 API 是否有测试或明确理由 |

---

## 五、与门禁

| 门禁 | 轴 |
|------|-----|
| G7 Converge | **规格轴**必须收敛 |
| 交付前 | 规范轴 P0 应清零或记入遗留 |

---

## MECE 自检

- 两轴互斥、合起来覆盖「做对需求」×「写好代码」✅  
- 不替代 Hook / Spec Lock ✅
