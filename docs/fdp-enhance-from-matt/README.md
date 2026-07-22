# 借鉴 mattpocock/skills 增强 FDK（方案 B）

> 版本：v1.0  
> 日期：2026-07-22  
> 状态：已落地（kit 1.6.0）  
> 原则：FDK 流水线与门禁不变；增强对齐 / 词表 / 双轴审查 / 诊断 / 交接

---

## 一、新增 Skills

| Skill | 优先级 | 口令示例 |
|-------|--------|----------|
| `#fdp-grill` | P0 | `feature {名}，对齐一下` / `grill` |
| `#fdp-dual-review` | P0 | 随 Converge / cross-review 自动引用 |
| `#fdp-diagnose` | P1 | `诊断这个 bug` / `fdp diagnose` |
| `#fdp-handoff` | P1 | `交接` / `写 handoff` |

---

## 二、模板变更

- `templates/feature/context.md` — 增加「领域词表」「评审确认项」
- `templates/feature/handoff.md` — 跨会话交接

---

## 三、非目标（仍不做）

- 用 to-spec 替换 Spec Lock  
- 整包安装 mattpocock/skills  
- 把 improve-codebase-architecture 绑进门禁  

---

## MECE 自检

- 对齐 × 词表 × 规格轴 × 规范轴 × 诊断 × 交接 — 无重叠  
- 主链门禁语义未改 ✅
