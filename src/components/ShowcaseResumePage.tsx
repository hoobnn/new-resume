import type { Entry, Locale, ResumeData, SkillGroup } from '../types'
import { RichText } from './RichText'
import '../showcase.css'

interface ShowcaseResumePageProps {
  locale: Locale
  photoUrl: string
  resume: ResumeData
  onLocaleChange: (locale: Locale) => void
}

const COPY = {
  zh: {
    back: '经典版',
    print: '打印 / 保存 PDF',
    profile: '个人简介',
    contact: '联系方式',
    strengths: '核心能力',
    experience: '工作经历',
    projects: '项目经历',
    education: '教育背景',
    honors: '荣誉与证书',
    // ponytail: 指标数值与 local/data/resume.md 手工同步，改简历数据时记得更新
    metrics: [
      ['3 省 / 9 地市', '生产部署'],
      ['近 1 万笔', '日均审核'],
      ['27% → 5%', '异常率'],
      ['9 个', '上游 PR'],
    ],
    contactLabels: ['所在地', '电话', '邮箱', '微信', 'GitHub'],
    honorLabels: { competitions: '竞赛', certificates: '证书', recognitions: '表彰' },
  },
  en: {
    back: 'Classic',
    print: 'Print / Save PDF',
    profile: 'Profile',
    contact: 'Contact',
    strengths: 'Core Skills',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    honors: 'Honors & Certifications',
    // ponytail: 指标数值与 local/data/resume.md 手工同步，改简历数据时记得更新
    metrics: [
      ['3 provinces / 9 cities', 'Deployments'],
      ['~10,000', 'Reviews/day'],
      ['27% → 5%', 'Anomaly rate'],
      ['9', 'Upstream PRs'],
    ],
    contactLabels: ['Location', 'Phone', 'Email', 'WeChat', 'GitHub'],
    honorLabels: {
      competitions: 'Competitions',
      certificates: 'Certifications',
      recognitions: 'Recognitions',
    },
  },
} as const

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="showcase-side-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="showcase-main-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

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

function ResumeEntry({ entry }: { entry: Entry }) {
  return (
    <article className="showcase-entry">
      <header>
        <div>
          <h3>{entry.title.replace(/\*+/g, 'XX')}</h3>
          {entry.role ? <span>{entry.role}</span> : null}
        </div>
        {entry.date ? <time>{entry.date}</time> : null}
      </header>
      {entry.lede ? (
        <p className="showcase-entry-lede">
          <RichText text={entry.lede} />
        </p>
      ) : null}
      <ul>
        {entry.bullets.map((bullet) => (
          <li key={bullet.lead ?? bullet.text}>
            {bullet.lead ? <strong>{bullet.lead} · </strong> : null}
            <RichText text={bullet.text} />
          </li>
        ))}
      </ul>
    </article>
  )
}

export function ShowcaseResumePage({
  locale,
  photoUrl,
  resume,
  onLocaleChange,
}: ShowcaseResumePageProps) {
  const copy = COPY[locale]
  const { profile, strengths, skills, experience, projects, education, honors } = resume
  const contacts = [
    [copy.contactLabels[0], profile.expectedCity],
    [copy.contactLabels[3], profile.wechat],
    [copy.contactLabels[1], profile.phone],
    [copy.contactLabels[2], profile.email],
    [copy.contactLabels[4], profile.github],
  ]
  const featuredHonors = [education.honors[0], education.honors[1], honors.competitions[0]].filter(
    Boolean
  )
  const honorGroups = [
    { title: copy.honorLabels.competitions, items: honors.competitions.slice(1) },
    { title: copy.honorLabels.certificates, items: honors.certificates },
    {
      title: copy.honorLabels.recognitions,
      items: [...education.honors.slice(2), ...honors.recognitions],
    },
  ].filter((group) => group.items.length > 0)

  return (
    <div className="showcase-app">
      <nav className="showcase-toolbar no-print">
        <a href="?style=classic">{copy.back}</a>
        <div>
          <button className={locale === 'zh' ? 'active' : ''} onClick={() => onLocaleChange('zh')}>
            中
          </button>
          <button className={locale === 'en' ? 'active' : ''} onClick={() => onLocaleChange('en')}>
            EN
          </button>
          <button className="showcase-print" onClick={() => window.print()}>
            {copy.print}
          </button>
        </div>
      </nav>

      <main className="showcase-document" aria-label={`${profile.name} resume`}>
        <aside className="showcase-sidebar">
          <figure className="showcase-photo">
            <img src={photoUrl} alt={profile.name} />
          </figure>

          <SidebarSection title={copy.contact}>
            <dl className="showcase-contact-list">
              {contacts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </SidebarSection>

          {skills.length > 0 ? (
            <SidebarSection title={copy.strengths}>
              <SkillGroups groups={skills} />
            </SidebarSection>
          ) : null}

          <SidebarSection title={copy.education}>
            <div className="showcase-education">
              <strong>{education.school}</strong>
              <span>{education.date}</span>
              <p>
                {education.degree} · {education.major}
              </p>
            </div>
          </SidebarSection>

          <SidebarSection title={copy.honors}>
            <div className="showcase-featured-honors">
              {featuredHonors.map((honor, index) => (
                <div key={honor}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{honor}</strong>
                </div>
              ))}
            </div>
            <div className="showcase-honor-groups">
              {honorGroups.map((group) => (
                <div className="showcase-honor-group" key={group.title}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SidebarSection>
        </aside>

        <article className="showcase-content">
          <header className="showcase-hero">
            <span>{profile.englishName}</span>
            <h1>{profile.name}</h1>
            <h2>{profile.target}</h2>
            <p>
              {profile.yearsOfExperience} · {profile.expectedCity}
            </p>
          </header>

          <MainSection title={copy.profile}>
            <div className="showcase-summary">
              <p>
                <RichText text={strengths[0]?.value ?? ''} />
              </p>
              <p>
                <RichText text={strengths[1]?.value ?? ''} />
              </p>
            </div>
            <div className="showcase-metrics">
              {copy.metrics.map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="showcase-strengths">
              {strengths.slice(2).map((strength) => (
                <p key={strength.key}>
                  <strong>{strength.key} · </strong>
                  <RichText text={strength.value} />
                </p>
              ))}
            </div>
          </MainSection>

          <MainSection title={copy.experience}>
            <ResumeEntry entry={experience} />
          </MainSection>

          <MainSection title={copy.projects}>
            {projects.map((project) => (
              <ResumeEntry entry={project} key={project.title} />
            ))}
          </MainSection>
        </article>
      </main>
    </div>
  )
}
