# 原型保真规则（FDK 通用）

> **分类维度**：按「规格固化阶段 × 实现偏离类型 × 验收手段」  
> **用途**：减少「Converge 通过但与原型不一致」；**不绑定任何业务模块**。  
> 各 feature 在 Spec Lock 派生 `ui-spec.md` / P0 AC / `ui-diff-checklist.md`，Analyze 与 Converge 机械检查。

---

## 0. 核心原则

| 原则 | 说明 |
|------|------|
| **Converge ≠ 原型验收** | Converge 验 AC + 单测；**未写入 spec 的原型细节不会被自动发现** |
| **结构进 spec，像素走人工** | 筛选器有无、表格列、双栏左右、展示格式 → **P0 进 ui-spec + AC**；颜色间距 → ui-diff-checklist |
| **禁止用前端补规格洞** | 后端应返展示字段时，不得长期用前端拉组织树/拼路径代替（除非 AC 明确「前端派生」） |
| **同组件多语境** | 同一业务实体在不同页面可有**不同布局**；禁止无脑复用 A 页组件到 B 页 |
| **同仓对齐（TRAP-IRA）** | 「AC 能过」≠做完；有同类参照须 Grep 对齐，禁止自创精简版（分页/筛选/导出等） |

---

## 1. 偏离模式库（TRAP-UID）

| 模式 ID | 名称 | 典型症状 | 示例（各 feature 在 test-cases/ui-spec 写本模块实例） |
|---------|------|----------|--------------------------------------------------------|
| **UID-EXTRA-CTL** | 多余控件 | 原型无某下拉/Tab/筛选，实现自行添加 | 汇总页多加「团队下拉」 |
| **UID-MISS-COL** | 列/字段缺失或错位 | 表缺列、列展示错类型（时间 vs 比率） | 列表「进度」未展示 `6/8` |
| **UID-LAYOUT-CTX** | 布局语境错误 | 左右栏方向、双栏比例与**该页**原型不符 | A 页双栏误用 B 页布局 |
| **UID-DISP-FMT** | 展示格式不符 | 只显示末级名称、缺全路径、缺单位 | 部门只显示末级名 |
| **UID-API-SHIM** | 前端补后端展示 | 为列表/详情重复请求树或拼路径 | 前端拼路径代替 API 字段 |
| **UID-NAV-DIFF** | 导航/入口不一致 | 换上下文路径与原型不同（可接受须写 revision） | 入口路径变更须在 ui-spec 写明 |
| **UID-VIF-ELSE** | 条件链挂错节点 | 互斥态（有值/空态）同时出现；`v-else-if` 挂在无关兄弟上 | 有数据仍显示「未设置」行 |

模式可叠加（如 UID-MISS-COL + UID-API-SHIM）。与 **TRAP-IRA**（同仓实现对齐）正交：有原型先 UID，无原型或原型未覆盖的细节再 IRA。

---

## 1.1 UID-VIF-ELSE — 互斥条件链

### 反模式

```text
❌ <div v-if="hasValue">展示值</div>
   <div v-if="extraBanner">提示条</div>          <!-- 独立块 -->
   <div v-else-if="canEdit">空态 / 去设置</div>  <!-- else 绑在提示条上 → hasValue 时仍可能显示空态 -->

✅ <div v-if="hasValue">展示值</div>
   <div v-else-if="canEdit">空态 / 去设置</div>  <!-- 互斥链紧邻 -->
   <div v-if="extraBanner">提示条</div>           <!-- 独立 v-if，不参与 else -->
```

### 场景码

| 场景码 | 场景 | 预期 |
|--------|------|------|
| **VIF-WRONG-ELSE** | 主字段有值且可编辑 | **只**显示有值行，不显示空态行 |
| **VIF-EMPTY-ONLY** | 主字段无值且可编辑 | 只显示空态行 |

### FDP 动作

| 阶段 | 动作 |
|------|------|
| Spec Lock | 互斥展示写入 ui-spec（有值 / 空态 / 附加条分列） |
| Analyze / Converge | diff 中新增 `v-else-if` → 核对是否与目标 `v-if` 紧邻；命中 **VIF-WRONG-ELSE** |
| 开发 | 附加 Tag/信息条用独立 `v-if`，禁止插入互斥链中间 |

---

## 1.2 TRAP-IRA — 同仓既有实现对齐（In-Repo Alignment）

> **根因**：把「规格最低可过」当成交付完成，跳过对同仓既有实现的对照，交付自创精简版。  
> **不限于分页**：筛选条、状态徽标、行操作、导出/下载、空态等凡有同类参照却偷懒的，均属本模式。

### 与 TRAP-UID 的分工

| | TRAP-UID | TRAP-IRA |
|--|----------|----------|
| 对齐对象 | **原型 / ui-spec** | **同仓已有代码**（同模块或同类型页面/接口） |
| 典型时机 | 有 prototype | 无原型、或原型未写到的交互细节（如每页条数） |

可叠加：先满足 UID，再答 IRA 侦测。

### 通用侦测（Spec Lock / 开发 / Analyze）

| # | 侦测问题 | 命中则必须 |
|---|----------|------------|
| **IRA-Q1** | 是否新增/改动用户可见控件或列表行为（分页、筛选、空态、主次按钮、状态徽标）？ | 指定同仓 UI 参照，或 ui-spec 写明「首创无参照」 |
| **IRA-Q2** | 是否新增/改动接口契约或导出/下载形态？ | 指定同模块既有导出/列表 API 参照 |
| **IRA-Q3** | 参照与实现是否一致？不一致是否已写入 spec？ | 未写差异 → 视为未对齐（IRA-SIBLING-SKIP） |

### 反模式

```text
❌ 不 Grep 同仓同类 el-pagination / 筛选条 / export，直接写「能翻页/能导出」的最小实现
✅ 动手前锁定 ≥1 个参照路径；对齐 layout/page-sizes/MIME/错误行为，或在 ui-spec/tech-design 写明有意差异
```

### 场景码

| 场景码 | 场景 | 预期 |
|--------|------|------|
| **IRA-UI-PAGER** | 新增/改列表分页，同仓同类列表含 `sizes` | 本页含 `sizes` 与合理 `page-sizes`，或 ui-spec 写明不提供原因 |
| **IRA-UI-FILTER** | 新增/改页级筛选条 | 密度/宽度/清空与同模块筛选条同级；禁止无约束拉满 flex |
| **IRA-UI-STATUS** | 列表状态展示且存在筛选维度 | 主展示须覆盖筛选所用状态维度；次要维度不得单独顶替 |
| **IRA-UI-ACTION** | 行内操作随状态变化 | 不可达操作不得展示为可点主操作 |
| **IRA-API-EXPORT** | 新增导出/下载 | MIME、BOM、空数据/错误行为对齐同仓既有导出 |
| **IRA-SIBLING-SKIP** | 任意上述改动 | 能指出参照路径（或 spec 写明首创）；否则未对齐 |

> 新偷懒点优先**追加场景码**，不新开平行 TRAP 文件。

### FDP 动作

| 阶段 | 动作 |
|------|------|
| Spec Lock | 有列表/筛选/导出时答 IRA-Q1～Q3；参照写入 ui-spec「同仓参照」 |
| 开发 | 写控件/导出前 Grep 参照；自检 IRA-SIBLING-SKIP |
| Analyze | diff 新增分页/筛选条/export → 无参照说明则记 IRA（建议 P1，项目可升 P0） |
| Converge | ui-diff 结构复核含「同仓对齐」勾选 |

---

## 2. Spec Lock 必问（有原型时）

在生成 `ui-spec.md` / P0 AC 前，**逐页**对照 `prototype.html`（或设计稿）填写：

| # | 侦测问题 | 命中则 Spec Lock 必须产出 |
|---|----------|---------------------------|
| **U1** | 该页是否有**筛选/下拉/Tab**？列出每一个 | ui-spec「禁止多余控件」+「已有控件清单」；无则写 **无页级筛选** |
| **U2** | 该页表格/列表有哪些**列**？每列**展示格式**？ | ui-spec 元素表 + P0 AC（如 `进度` = `submitted/total`） |
| **U3** | 是否存在**双栏/分栏**？每栏内容是什么？ | 每页单独写清「左栏 / 右栏」；多页不得混用同一布局描述 |
| **U4** | 名称类字段是**全路径还是末级**？谁生成？ | AC 写 `department_name` 等由 **API 返回** 或 **前端从树派生（注明）** |
| **U5** | 同一实体是否在**多个页面**展示？ | ui-spec 为每页建独立 `page-*` 节，标注布局是否相同 |
| **U6** | 原型 revision 是否裁决过与原型直接冲突？ | 冲突项写入 `*-revision.md` 并同步到 ui-spec，禁止实现时自行发挥 |

**未答 U1～U6 不得将 Spec Lock 标为 complete。**

---

## 3. ui-spec 最低要求（有 UI 的 feature）

每个 `page-*` 除元素表外，**必须**包含：

```markdown
### 控件边界
- 页级筛选：（无 | 列出控件 ID）
- 禁止：（如：不得增加团队下拉）

### 列表/表格（如有）
| 列名 | 展示格式 | 数据来源字段 | 原型锚点 |

### 分栏（如有）
| 栏位 | 内容 | 原型函数/区块 |
```

引用 TRAP-UID：若某页有双栏，在布局表注明 **UID-LAYOUT-CTX 敏感**。

---

## 4. P0 AC 编写模板（UI 结构）

```markdown
### AC-UI-XX [P0]
- **EARS**: When 用户打开 {页面}, the system shall {结构化行为，可二值判定}
- **原型锚点**: prototype.html #{page-id} / {函数名}
- **禁止**: UID-EXTRA-CTL — 不得出现 {控件}
- **验证**: ui-spec 元素 ID + Converge grep / ui-diff-checklist 勾选项
```

**差的 AC（禁止当作已验收）**：「布局合理」「与原型基本一致」「视觉走人工」—— 不得作为 P0 唯一描述。

---

## 5. ui-diff-checklist 分工（修订）

| 类型 | 进 spec 还是走查 | 示例 |
|------|------------------|------|
| 筛选器有无、表格列、双栏方向、字段格式 | **P0 → ui-spec + AC**；走查 **复核** | 无团队下拉、进度为 x/y |
| 颜色、间距、字体、图标 | P1 → **ui-diff-checklist** 人工 | 主色、圆角 |

走查清单**必须**含「结构复核」节（见模板 `ui-diff-checklist.md`），不得只勾视觉项。

---

## 6. FDP 各阶段动作

| 阶段 | 动作 |
|------|------|
| **Spec Lock** | 运行 §2 U1～U6；有列表/筛选/导出时答 **IRA-Q1～Q3**；生成 ui-spec；P0 AC 含可判定 UI 结构项 |
| **Analyze** | 对照 prototype + ui-spec：缺 U1～U6 → **P0**；命中 TRAP-UID 无 AC → P0；命中 **TRAP-IRA** 无参照 → P1（或项目升 P0） |
| **开发** | 新增页级控件/列/布局须先改 spec；禁止 UID-API-SHIM；控件/导出前 Grep 同仓参照（IRA） |
| **Converge** | spec-verifier 查 ui-spec + TRAP-UID + **TRAP-IRA**；ui-diff 结构节须勾 |
| **提测前** | 负责人勾选 ui-diff-checklist「结构复核」+「视觉」+「同仓对齐」 |

---

## 7. spec-verifier / spec-analyzer 检查项（追加）

- [ ] 每个原型页在 ui-spec 有 `page-*` 节且含「控件边界」
- [ ] P0 UI AC 均含原型锚点，非「体验良好」类模糊句
- [ ] diff 中新增 `el-select`/筛选器 → ui-spec 有对应元素 ID 或 AC 明确允许
- [ ] 列表列与 ui-spec 一致；展示字段有 API 字段或 AC 注明前端派生
- [ ] 双栏页面：左右内容与 ui-spec 一致（UID-LAYOUT-CTX）
- [ ] 未引入 spec 未要求的页级导航/筛选（UID-EXTRA-CTL）
- [ ] diff 中新增 `v-else-if` → 与目标 `v-if` **紧邻**；互斥空态不得与有值态并存（**UID-VIF-ELSE** / VIF-WRONG-ELSE）
- [ ] 新增/改分页、筛选条、导出 → 已指定同仓参照或 spec 写明首创（**TRAP-IRA** / IRA-SIBLING-SKIP）
- [ ] 分页：同仓同类含 `sizes` 时本页不得无故省略（**IRA-UI-PAGER**）

---

## 8. Feature 派生清单（Spec Lock 时复制到 feature 目录）

在 `{feature}/ui-diff-checklist.md` 从模板生成，并增加：

```markdown
## 结构复核（P0，对照 prototype）
| 页面 | U1 控件 | U2 列 | U3 分栏 | U4 展示格式 | 通过 |

## 同仓对齐（TRAP-IRA）
| 页面/能力 | 参照路径 | 场景码 | 通过 |
|-----------|----------|--------|------|
| （例：列表分页） | （例：同类列表页） | IRA-UI-PAGER | ⬜ |
```

在 `{feature}/spec/acceptance-checklist.md` 人工确认增加：

```markdown
- [ ] 已按 prototype-fidelity-rules §2 完成 U1～U6
- [ ] 结构化 UI 已进 ui-spec/P0 AC（非仅「走人工」）
- [ ] 列表/筛选/导出已答 IRA-Q1～Q3（同仓参照或写明首创）
```

---

## MECE 自检

- **偏离类型（UID）**：EXTRA-CTL / MISS-COL / LAYOUT-CTX / DISP-FMT / API-SHIM / NAV-DIFF / VIF-ELSE 互斥 ✅  
- **偏离类型（IRA）**：与 UID 正交；场景码按 UI/API 扩展，不平行开 TRAP 文件 ✅  
- **阶段**：Spec Lock → Analyze → 开发 → Converge → 走查 全覆盖 ✅  
- **职责**：结构 = spec 可机械查；像素 = 人工走查；同仓惯例 = IRA ✅  
- **⚠️**：动效、响应式断点细节仍走 ui-diff-checklist，不强行写入 FDK 模式库
