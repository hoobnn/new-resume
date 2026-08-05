# Showcase 布局全面优化设计

日期：2026-08-05
状态：已获用户批准

## 背景与问题

Showcase 布局（默认布局，`src/components/ShowcaseResumePage.tsx` + `src/showcase.css`）现状体检发现：

1. **打印破损**：打印出 3 页（目标 2 页）。第 2、3 页左侧为空白灰栏（grid 双栏跨页时侧栏内容只在第 1 页）；第 1 页主栏在「项目经历」标题处截断留白；第 3 页大半空白。
2. **内容缺失**：6 条个人优势中仅前 2 条展示正文，异构算力、微调与数据工程、AI-Native 开发、开源贡献（9 个 PR）4 条只剩雷达图图例关键词。
3. **雷达图为装饰性假数据**：SVG 顶点坐标硬编码，无真实数值含义。
4. 荣誉 chips 字号 8.5px 打印偏小；指标条数据硬编码于组件 COPY。

## 已确认的决策

- **定位**：屏幕 + 打印双达标；打印目标 2 页 A4，第 1 页双栏、第 2 页起通栏。
- **优势内容**：主栏完整展示全部 6 条，不丢信息。
- **雷达图**：删除，换成真实技能分组标签。
- **打印架构**：Float 单 DOM 方案（屏幕保持 grid；打印时侧栏 `float: left`，主栏环绕，侧栏结束后回流全宽）。

## 设计

### 1. 数据层：可选「技能清单」section

- `local/data/resume.md` 新增 `## 技能清单`，`resume.en.md` 新增 `## Skills`，条目格式沿用现有键值 bullet：`- **推理引擎**：vLLM · MindIE · Transformers`。内容手工精选。
- `resumeMarkdown.ts`：`ResumeSchema.sections` 增加 `skills` 键；解析为**可选**字段（section 缺失时返回空数组，不抛错，保持对旧数据兼容）。复用 `parseKeyValueBullets` + `splitInlineList`。
- `types.ts`：新增 `SkillGroup { name: string; items: string[] }`；`ResumeData` 增加 `skills: SkillGroup[]`。
- 经典版（ResumePage）不消费该字段，行为不变。

### 2. 侧栏：技能分组标签替代雷达图

- 删除 `CapabilityRadar` 组件及其全部 CSS（`.showcase-radar*`）。
- 「核心能力」区改为渲染 `resume.skills`：每组为「分组名 + 标签 chips」的紧凑排版。
- 侧栏总高度需控制在一页 A4 内（打印方案前提）。

### 3. 主栏：补全个人优势

- 「个人简介」保持前 2 条 strengths 的 prose 段落 + 指标条不变。
- 其下新增紧凑清单渲染 `strengths[2..]`：加粗 lead（key）+ 正文（RichText），开源 PR 明细随之回到主栏。
- 指标条数值维持 COPY 硬编码（改动频率低），加 `ponytail:` 注释说明与 markdown 数据存在人工同步。

### 4. 打印：2 页 A4

`@media print` 内：

- `.showcase-document`：`display: block`（覆盖 grid）。
- `.showcase-sidebar`：`float: left` + 固定宽度（约 250px）；主栏内容自然环绕，侧栏结束后回流全宽。
- 分页策略：**移除** `.showcase-entry { break-inside: avoid }`（大空白元凶），改为 `li { break-inside: avoid }` + 标题（h2/h3/header）`break-after: avoid`，允许 entry 内部分页。
- 打印字号 / 行距 / 区块间距按需压缩，迭代至恰好 2 页。

### 5. 细节

- 荣誉 chips 字号提升至约 10px（屏幕与打印一致可读）。
- 移除雷达图相关 aria 标注。

## 错误处理

- 解析器对缺失 `技能清单` section 返回空数组；组件对空 `skills` 不渲染该区块（不出现空标题）。
- 其余解析路径维持现有 fail-fast 行为。

## 验证

- 解析器新增逻辑：`bun test` 最小单测（零新增依赖），覆盖「有 skills section」「无 skills section」两个用例。
- 打印页数：`node scripts/check-print-pages.mjs <showcase-url> 2` 必须通过，且人工检查 PDF 无恶性空白。
- 屏幕端：dev server 截图复查桌面与 720px 以下窄屏。

## 非目标

- 不改经典版（ResumePage）。
- 不引入指标条的 frontmatter 解析。
- 不做主题（dark/plain）适配——showcase 布局目前本就不消费 theme。
