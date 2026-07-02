import type { Bullet, Entry, ResumeData } from '../types'

type Meta = Record<string, string>

interface ParsedMarkdown {
  body: string
  meta: Meta
}

export interface ResumeSchema {
  sections: {
    strengths: string
    experience: string
    projects: string
    education: string
    honors: string
  }
  eduKeys: { courses: string; honors: string }
  honorKeys: { certificates: string; competitions: string; recognitions: string }
}

export const ZH_SCHEMA: ResumeSchema = {
  sections: {
    strengths: '个人优势',
    experience: '工作经历',
    projects: '项目经历',
    education: '教育经历',
    honors: '荣誉与证书',
  },
  eduKeys: { courses: '专业课程', honors: '核心荣誉' },
  honorKeys: { certificates: '专业证书', competitions: '学科竞赛', recognitions: '综合表彰' },
}

export const EN_SCHEMA: ResumeSchema = {
  sections: {
    strengths: 'Highlights',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    honors: 'Honors & Certifications',
  },
  eduKeys: { courses: 'Core Courses', honors: 'Honors' },
  honorKeys: {
    certificates: 'Certifications',
    competitions: 'Competitions',
    recognitions: 'Recognitions',
  },
}

export function parseResumeMarkdown(
  markdown: string,
  schema: ResumeSchema = ZH_SCHEMA
): ResumeData {
  const { body, meta } = parseFrontmatter(markdown)

  return {
    profile: {
      name: getTitle(body),
      englishName: requireMeta(meta, 'englishName'),
      gender: requireMeta(meta, 'gender'),
      age: requireMeta(meta, 'age'),
      yearsOfExperience: requireMeta(meta, 'yearsOfExperience'),
      target: requireMeta(meta, 'target'),
      expectedSalary: requireMeta(meta, 'expectedSalary'),
      expectedCity: requireMeta(meta, 'expectedCity'),
      phone: requireMeta(meta, 'phone'),
      email: requireMeta(meta, 'email'),
      wechat: requireMeta(meta, 'wechat'),
    },
    strengths: parseKeyValueBullets(getSection(body, schema.sections.strengths)).map(
      ({ key, text }) => ({
        key,
        value: text,
      })
    ),
    experience: parseEntry(getSection(body, schema.sections.experience)),
    projects: parseEntries(getSection(body, schema.sections.projects)),
    education: parseEducation(getSection(body, schema.sections.education), schema),
    honors: parseHonors(getSection(body, schema.sections.honors), schema),
  }
}

function parseFrontmatter(markdown: string): ParsedMarkdown {
  const normalized = markdown.replace(/\r\n/g, '\n').trim()
  if (!normalized.startsWith('---\n')) {
    return { body: normalized, meta: {} }
  }

  const end = normalized.indexOf('\n---', 4)
  if (end < 0) {
    throw new Error('Resume markdown frontmatter is not closed')
  }

  const frontmatter = normalized.slice(4, end).trim()
  const body = normalized.slice(end + 4).trim()
  const meta = Object.fromEntries(
    frontmatter
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':')
        if (separator < 0) {
          throw new Error(`Invalid resume metadata line: ${line}`)
        }
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      })
  )

  return { body, meta }
}

function getTitle(markdown: string): string {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim()
  if (!title) {
    throw new Error('Resume markdown must include an H1 name')
  }
  return title
}

function getSection(markdown: string, title: string): string {
  const lines = markdown.split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${title}`)
  if (start < 0) {
    throw new Error(`Resume markdown missing section: ${title}`)
  }

  const next = lines.findIndex((line, index) => index > start && line.startsWith('## '))
  const section = lines
    .slice(start + 1, next < 0 ? undefined : next)
    .join('\n')
    .trim()
  if (!section) {
    throw new Error(`Resume markdown missing section: ${title}`)
  }
  return section
}

function parseEntries(section: string): Entry[] {
  return splitEntries(section).map(parseEntry)
}

function parseEntry(markdown: string): Entry {
  const [heading = '', ...lines] = markdown.split('\n')
  const [title, role, date] = heading
    .replace(/^###\s+/, '')
    .split(' · ')
    .map(clean)
  const contentLines = lines.map((line) => line.trim()).filter(Boolean)
  const lede = contentLines.find((line) => !line.startsWith('- '))
  const bullets = parseBullets(contentLines.filter((line) => line.startsWith('- ')))

  return {
    title,
    role,
    date,
    lede: lede ? clean(lede.replace(/^>\s*/, '')) : undefined,
    bullets,
  }
}

function parseEducation(section: string, schema: ResumeSchema): ResumeData['education'] {
  const [heading = '', ...lines] = section.split('\n')
  const [school, degree, major, date] = heading
    .replace(/^###\s+/, '')
    .split(' · ')
    .map(clean)
  const values = Object.fromEntries(
    parseKeyValueBullets(lines.join('\n')).map(({ key, text }) => [key, stripMarkdown(text)])
  )

  return {
    school,
    degree,
    major,
    date,
    courses: splitInlineList(requireValue(values, schema.eduKeys.courses)),
    honors: splitInlineList(requireValue(values, schema.eduKeys.honors)),
  }
}

function parseHonors(section: string, schema: ResumeSchema): ResumeData['honors'] {
  const values = Object.fromEntries(
    parseKeyValueBullets(section).map(({ key, text }) => [key, stripMarkdown(text)])
  )

  return {
    certificates: splitInlineList(requireValue(values, schema.honorKeys.certificates)),
    competitions: splitInlineList(requireValue(values, schema.honorKeys.competitions)),
    recognitions: splitInlineList(requireValue(values, schema.honorKeys.recognitions)),
  }
}

function parseBullets(lines: string[]): Bullet[] {
  return lines.map((line) => {
    const { key, text } = parseKeyValueLine(line)
    return key ? { lead: key, text } : { text }
  })
}

function parseKeyValueBullets(markdown: string): Array<{ key: string; text: string }> {
  return markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => {
      const item = parseKeyValueLine(line)
      if (!item.key) {
        throw new Error(`Resume list item must start with a bold key: ${line}`)
      }
      return { key: item.key, text: item.text }
    })
}

function parseKeyValueLine(line: string): { key?: string; text: string } {
  const content = line.replace(/^-\s+/, '').trim()
  const matched = content.match(/^\*\*([^*]+)\*\*[：:](.*)$/)
  if (!matched) {
    return { text: clean(content) }
  }
  return { key: clean(matched[1]), text: clean(matched[2]) }
}

function splitEntries(section: string): string[] {
  return section
    .split(/\n(?=###\s+)/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function splitInlineList(value: string): string[] {
  return value
    .split(/\s*[·、]\s*/)
    .map(clean)
    .filter(Boolean)
}

function requireMeta(meta: Meta, key: string): string {
  return requireValue(meta, key)
}

function requireValue(values: Meta, key: string): string {
  const value = values[key]
  if (!value) {
    throw new Error(`Resume markdown missing value: ${key}`)
  }
  return value
}

function stripMarkdown(value: string): string {
  return value.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/[<>]/g, '')
}

function clean(value: string): string {
  return value.trim()
}
