# Showcase 布局全面优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 showcase 布局屏幕与打印双达标——补全 6 条个人优势、用真实技能标签替换假雷达图、打印恰好 2 页 A4（第 1 页双栏、后续通栏）。

**Architecture:** 数据层在 markdown 加可选「技能清单」section 并由 schema 化解析器读取；组件层删除假数据雷达图、补全主栏优势清单；打印层用 float 单 DOM 方案（屏幕 grid 不变，打印时侧栏 float 让主栏回流全宽）。

**Tech Stack:** React 19 + TypeScript + Vite 8 + Bun（`bun test` 做解析器单测，零新增依赖）。

## Global Constraints

- 提交格式：gitmoji + conventional commits（`<emoji> <type>(<scope>): <描述>`，husky+commitlint 强制），emoji 与 type 1:1（✨ feat / ✅ test / 🎨 style / ♻️ refactor）。
- 每个 commit 末尾加：空行 + `🤖 Generated with [Claude Code](https://claude.com/claude-code)` + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。
- 不改经典版（`ResumePage.tsx`）行为；经典版不消费新增 `skills` 字段。
- 打印验证命令：`node scripts/check-print-pages.mjs http://localhost:5199/ 2`（需 dev server 运行在 5199 端口：`bun run dev --port 5199`）。
- 打印目标：恰好 2 页；`技能清单` section 缺失时解析器返回空数组、组件不渲染空区块。
- 遵循 immutability、早返回、无 console.log。

---

### Task 1: 解析器支持可选「技能清单」section（TDD）

**Files:**

- Modify: `src/types.ts`（新增 `SkillGroup`，`ResumeData` 加 `skills`）
- Modify: `src/lib/resumeMarkdown.ts`（schema 加 `skills` 键、可选 section 解析）
- Test: `tests/resumeMarkdown.test.ts`（新建；放在 `src` 外是有意的——tsconfig 只含 `src` 且未装 `@types/bun`，放 `src` 内会让 `tsc -b` 因 `bun:test` 类型缺失而失败）

**Interfaces:**

- Consumes: 现有 `parseResumeMarkdown(markdown, schema)`、`ZH_SCHEMA`/`EN_SCHEMA`。
- Produces: `interface SkillGroup { name: string; items: string[] }`；`ResumeData.skills: SkillGroup[]`；`ZH_SCHEMA.sections.skills === '技能清单'`，`EN_SCHEMA.sections.skills === 'Skills'`。Task 3 依赖 `resume.skills`。

- [ ] **Step 1: 写失败测试**

创建 `tests/resumeMarkdown.test.ts`：

```typescript
import { describe, expect, test } from 'bun:test'
import { ZH_SCHEMA, parseResumeMarkdown } from '../src/lib/resumeMarkdown'

const BASE_MARKDOWN = `---
englishName: Test User
gender: 男
age: 24 岁
yearsOfExperience: 3 年工作经验
target: 工程师
expectedCity: 成都
phone: 123
email: a@b.c
wechat: w
github: github.com/x
---

# 张三

## 个人优势

- **能力A**：描述一

## 工作经历

### 某公司 · 工程师 · 2023 — 至今

- **要点**：内容

## 项目经历

### 某项目 · 开发 · 2024

- **要点**：内容

## 教育经历

### 某大学 · 本科 · 某专业 · 2020 — 2024

- **专业课程**：课程A
- **核心荣誉**：荣誉A

## 荣誉与证书

- **专业证书**：证书A
- **学科竞赛**：竞赛A
- **综合表彰**：表彰A`

const SKILLS_SECTION = `

## 技能清单

- **推理引擎**：vLLM · MindIE
- **微调**：LLaMA-Factory · LoRA`

describe('parseResumeMarkdown skills', () => {
  test('parses skill groups when 技能清单 section exists', () => {
    const resume = parseResumeMarkdown(BASE_MARKDOWN + SKILLS_SECTION, ZH_SCHEMA)

    expect(resume.skills).toEqual([
      { name: '推理引擎', items: ['vLLM', 'MindIE'] },
      { name: '微调', items: ['LLaMA-Factory', 'LoRA'] },
    ])
  })

  test('returns empty skills when section is missing', () => {
    const resume = parseResumeMarkdown(BASE_MARKDOWN, ZH_SCHEMA)

    expect(resume.skills).toEqual([])
  })
})
```

- [ ] **Step 2: 运行确认失败**

Run: `bun test tests/resumeMarkdown.test.ts`
Expected: FAIL（`resume.skills` 为 undefined——schema 尚无 `skills`）

- [ ] **Step 3: 最小实现**

`src/types.ts` 在 `Strength` 后新增，并在 `ResumeData` 中加字段：

```typescript
export interface SkillGroup {
  name: string
  items: string[]
}
```

```typescript
export interface ResumeData {
  profile: Profile
  strengths: Strength[]
  skills: SkillGroup[]
  experience: Entry
  projects: Entry[]
  education: Education
  honors: Honors
}
```

`src/lib/resumeMarkdown.ts`：

1. `ResumeSchema.sections` 增加 `skills: string`；`ZH_SCHEMA.sections` 加 `skills: '技能清单'`，`EN_SCHEMA.sections` 加 `skills: 'Skills'`。
2. 顶部 import 增加 `SkillGroup` 类型。
3. `parseResumeMarkdown` 返回对象中 `strengths` 之后加：

```typescript
skills: parseSkills(getOptionalSection(body, schema.sections.skills)),
```

4. 新增两个函数（放在 `getSection` 附近）：

```typescript
function getOptionalSection(markdown: string, title: string): string | null {
  const lines = markdown.split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${title}`)
  if (start < 0) {
    return null
  }

  const next = lines.findIndex((line, index) => index > start && line.startsWith('## '))
  const section = lines
    .slice(start + 1, next < 0 ? undefined : next)
    .join('\n')
    .trim()
  return section || null
}

function parseSkills(section: string | null): SkillGroup[] {
  if (!section) {
    return []
  }
  return parseKeyValueBullets(section).map(({ key, text }) => ({
    name: key,
    items: splitInlineList(stripMarkdown(text)),
  }))
}
```

5. 顺手让 `getSection` 复用 `getOptionalSection`（DRY）：

```typescript
function getSection(markdown: string, title: string): string {
  const section = getOptionalSection(markdown, title)
  if (!section) {
    throw new Error(`Resume markdown missing section: ${title}`)
  }
  return section
}
```

- [ ] **Step 4: 运行确认通过**

Run: `bun test tests/resumeMarkdown.test.ts`
Expected: PASS（2 tests）
Run: `bunx tsc -b`
Expected: 无类型错误

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/lib/resumeMarkdown.ts tests/resumeMarkdown.test.ts
git commit -m "✨ feat(parser): 支持可选技能清单 section 解析

- add optional skills section parsing with SkillGroup type
- add bun tests covering present and missing section

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 中英文简历数据新增技能清单

**Files:**

- Modify: `local/data/resume.md`（`## 教育经历` 之前插入 `## 技能清单`）
- Modify: `local/data/resume.en.md`（对应位置插入 `## Skills`）

**Interfaces:**

- Consumes: Task 1 的解析格式（键值 bullet + `·` 分隔）。
- Produces: `resume.skills` 实际数据（4 组），Task 3 渲染。

- [ ] **Step 1: resume.md 插入技能清单**

在 `## 教育经历` 前插入（内容从个人优势正文精选，手工可控）：

```markdown
## 技能清单

- **模型与微调**：Qwen-VL · LLaMA-Factory · LoRA / SFT · 评测集设计
- **推理与算力**：vLLM · MindIE · Transformers · 昇腾 910B · 海光 K100AI
- **工程交付**：FastAPI · Spring · PaddleOCR · YOLO · Playwright · Docker
- **AI-Native**：Claude Code · Codex · Cursor · SDD / TDD
```

- [ ] **Step 2: resume.en.md 插入 Skills**

同位置插入：

```markdown
## Skills

- **Models & Fine-tuning**: Qwen-VL · LLaMA-Factory · LoRA / SFT · Eval design
- **Inference & Compute**: vLLM · MindIE · Transformers · Ascend 910B · Hygon K100AI
- **Engineering**: FastAPI · Spring · PaddleOCR · YOLO · Playwright · Docker
- **AI-Native**: Claude Code · Codex · Cursor · SDD / TDD
```

注意：英文键值行分隔符是 `**key**: text`（半角冒号），解析器正则 `[：:]` 两者都接受。

- [ ] **Step 3: 验证解析**

Run: `bun test && bunx tsc -b && bun run lint`
Expected: 全部通过
再快速冒烟：`bun run dev --port 5199` 启动后页面无报错（此时侧栏尚未渲染 skills，属预期）。

- [ ] **Step 4: 无需提交**

`local/data/` 在 .gitignore 中（隐私数据不入库），本任务只改本地文件，没有 git 提交。

---

### Task 3: 侧栏技能标签替换雷达图 + chips 可读性

**Files:**

- Modify: `src/components/ShowcaseResumePage.tsx`（删 `CapabilityRadar`，加 `SkillGroups`）
- Modify: `src/showcase.css`（删 `.showcase-radar*`，加 `.showcase-skills*`，chips 字号提升）

**Interfaces:**

- Consumes: Task 1 的 `resume.skills: SkillGroup[]`。
- Produces: 侧栏 DOM 结构 `.showcase-skills > .showcase-skill-group`，Task 5 打印样式依赖侧栏总高度 ≤ 一页 A4。

- [ ] **Step 1: 组件改造**

`ShowcaseResumePage.tsx`：

1. 顶部类型 import 增加 `SkillGroup`。
2. 整体删除 `CapabilityRadar` 函数（含 SVG），替换为：

```tsx
function SkillGroups({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="showcase-skills">
      {groups.map((group) => (
        <div className="showcase-skill-group" key={group.name}>
          <h3>{group.name}</h3>
          <div>
            {group.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

3. 解构 `resume` 时加入 `skills`；侧栏「核心能力」区块替换为（skills 为空时整块不渲染，避免空标题）：

```tsx
{
  skills.length > 0 ? (
    <SidebarSection title={copy.strengths}>
      <SkillGroups groups={skills} />
    </SidebarSection>
  ) : null
}
```

- [ ] **Step 2: CSS 改造**

`showcase.css`：

1. 删除 `.showcase-radar-wrap` 至 `.showcase-radar-legend span` 的全部规则（约 148–218 行）。
2. 原位置新增：

```css
.showcase-skills {
  display: grid;
  gap: 12px;
}
.showcase-skill-group h3 {
  color: var(--muted);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin: 0 0 5px;
}
.showcase-skill-group div {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.showcase-skill-group span {
  background: #fff;
  border: 1px solid var(--line);
  color: var(--ink);
  font-size: 10px;
  line-height: 1.4;
  padding: 3px 7px;
}
```

3. chips 可读性：`.showcase-honors span` 的 `font-size: 8.5px` 改为 `10px`；`.showcase-featured-honors strong` 的 `font-size: 10px` 改为 `10.5px`。

- [ ] **Step 3: 验证**

Run: `bunx tsc -b && bun run lint`
Expected: 通过
浏览器打开 `http://localhost:5199/`：侧栏显示 4 组技能标签，无雷达图；中英文切换均正常。

- [ ] **Step 4: Commit**

```bash
git add src/components/ShowcaseResumePage.tsx src/showcase.css
git commit -m "✨ feat(showcase): 侧栏用真实技能标签替换装饰性雷达图

- render skill groups from resume data instead of hardcoded radar svg
- bump honor chip font size for readability

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 主栏补全 6 条个人优势

**Files:**

- Modify: `src/components/ShowcaseResumePage.tsx`（个人简介区新增 strengths[2..] 清单；COPY.metrics 加 ponytail 注释）
- Modify: `src/showcase.css`（新增 `.showcase-strengths`）

**Interfaces:**

- Consumes: 现有 `strengths: Strength[]`（`{ key, value }`）、`RichText`。
- Produces: `.showcase-strengths` 区块（Task 5 分页规则引用其段落）。

- [ ] **Step 1: 组件改造**

`ShowcaseResumePage.tsx` 个人简介 `MainSection` 内、`.showcase-metrics` 之后新增：

```tsx
<div className="showcase-strengths">
  {strengths.slice(2).map((strength) => (
    <p key={strength.key}>
      <strong>{strength.key} · </strong>
      <RichText text={strength.value} />
    </p>
  ))}
</div>
```

COPY 对象 `metrics` 字段上方加注释：

```typescript
// ponytail: 指标数值与 local/data/resume.md 手工同步，改简历数据时记得更新
```

- [ ] **Step 2: CSS 新增**

`showcase.css` 在 `.showcase-metrics` 规则组之后：

```css
.showcase-strengths {
  border-top: 1px solid var(--line);
  margin-top: 16px;
  padding-top: 14px;
}
.showcase-strengths p {
  color: #4d5b67;
  font-size: 12px;
  line-height: 1.68;
  margin: 0 0 6px;
}
.showcase-strengths p:last-child {
  margin-bottom: 0;
}
.showcase-strengths strong {
  color: var(--ink);
}
```

- [ ] **Step 3: 验证**

Run: `bunx tsc -b && bun run lint`
Expected: 通过
浏览器确认：个人简介区依次为 2 段 prose → 指标条 → 4 条紧凑优势（异构算力 / 微调与数据工程 / AI-Native / 开源贡献含 9 PR 明细）；中英文均完整。

- [ ] **Step 4: Commit**

```bash
git add src/components/ShowcaseResumePage.tsx src/showcase.css
git commit -m "✨ feat(showcase): 主栏完整展示全部六条个人优势

- render remaining strengths below metrics so no content is lost
- note manual sync between metrics copy and resume data

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: 打印 2 页 A4（float 布局 + 分页策略 + 尺寸调优）

**Files:**

- Modify: `src/showcase.css`（重写 `@media print` 块）

**Interfaces:**

- Consumes: Task 3/4 的最终 DOM（侧栏高度 ≤ 一页是前提）。
- Produces: 打印恰好 2 页、无空白灰条的 PDF。

- [ ] **Step 1: 重写 @media print**

将现有 `@media print` 块整体替换为：

```css
@media print {
  body[data-layout='showcase'] {
    background: #fff !important;
  }
  .showcase-document {
    box-shadow: none;
    display: block;
    margin: 0;
    max-width: none;
    width: 100%;
  }
  .showcase-sidebar {
    background: transparent;
    float: left;
    padding: 0 18px 18px 0;
    width: 220px;
  }
  .showcase-content {
    padding: 0 0 0 24px;
  }
  .showcase-hero h1 {
    font-size: 32px;
  }
  .showcase-main-section {
    margin-top: 22px;
  }
  .showcase-entry {
    margin-bottom: 16px;
    padding-bottom: 14px;
  }
  /* 允许 entry 内部分页，避免整块推页造成大空白 */
  .showcase-entry li,
  .showcase-summary p,
  .showcase-strengths p,
  .showcase-featured-honors div,
  .showcase-skill-group {
    break-inside: avoid;
  }
  .showcase-main-section > h2,
  .showcase-entry header,
  .showcase-side-section h2 {
    break-after: avoid;
  }
}
```

注意：`.showcase-sidebar` 屏幕规则里的 `border-right` 会保留；若打印视觉上分隔线过重，可在 print 块中改为 `border-right: 1px solid var(--line)` 或去掉。

- [ ] **Step 2: 跑打印页数检查**

确保 dev server 在跑（`bun run dev --port 5199`），然后：

Run: `node scripts/check-print-pages.mjs http://localhost:5199/ 2`
Expected: `print pages: 2`，退出码 0

- [ ] **Step 3: 若页数不等于 2，按旋钮迭代**

只动 print 块内的值，每改一轮重跑 Step 2：

- 3 页 → 依次尝试：主栏正文 `.showcase-entry li` / `.showcase-strengths p` 打印字号降至 11.5px、行高 1.55；`.showcase-main-section` margin-top 降至 18px；侧栏 width 降至 210px。
- 1 页（过度压缩）→ 反向放宽。

- [ ] **Step 4: 人工检查 PDF 版式**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-first-run --no-sandbox --user-data-dir=/tmp/resume-print-profile --print-to-pdf=/tmp/showcase-print.pdf "http://localhost:5199/" && open /tmp/showcase-print.pdf
```

检查项：第 1 页双栏、侧栏完整落在第 1 页；第 2 页通栏无空白灰条；无标题孤行、无恶性空白；chips 可读。

- [ ] **Step 5: Commit**

```bash
git add src/showcase.css
git commit -m "🎨 style(showcase): 打印改用 float 布局实现两页 A4

- float sidebar in print so later pages reflow to full width
- allow entries to split across pages to remove large gaps

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: 全量回归验证

**Files:**

- 无新改动（验证与收尾）

**Interfaces:**

- Consumes: Task 1–5 全部产物。

- [ ] **Step 1: 全量检查**

```bash
bun test && bun run lint && bun run build
node scripts/check-print-pages.mjs http://localhost:5199/ 2
```

Expected: 全部通过、`print pages: 2`。

- [ ] **Step 2: 屏幕回归**

浏览器检查 `http://localhost:5199/`：

- 桌面宽度：双栏正常、技能标签与 6 条优势齐全、中英文切换正常。
- 窄屏（≤720px）：单栏堆叠正常、技能 chips 换行正常。
- `?style=classic`：经典版完全不受影响（含打印提示流程）。

- [ ] **Step 3: 清理与收尾**

- 删除仓库根目录的临时截图 `showcase-full.png`（如仍存在且未被 .gitignore 覆盖）。
- 若一切通过，向用户汇报结果与遗留事项（如有）。
