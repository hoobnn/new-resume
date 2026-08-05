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
