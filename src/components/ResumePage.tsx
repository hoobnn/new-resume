import type { ResumeData } from '../types'
import { EntryBlock } from './EntryBlock'
import { RichText } from './RichText'
import { SectionHeader } from './SectionHeader'

interface ResumePageProps {
  photoUrl: string
  resume: ResumeData
}

export function ResumePage({ photoUrl, resume }: ResumePageProps) {
  const { profile, strengths, experience, projects, education, honors } = resume
  const [firstProject, ...remainingProjects] = projects
  const firstProjectIntro = firstProject
    ? { ...firstProject, bullets: firstProject.bullets.slice(0, 2) }
    : null
  const firstProjectContinuation =
    firstProject && firstProject.bullets.length > 2
      ? {
          ...firstProject,
          date: undefined,
          lede: undefined,
          bullets: firstProject.bullets.slice(2),
        }
      : null

  return (
    <main className="resume-document" aria-label={`${profile.name} 简历`}>
      <article className="sheet">
        <header className="masthead">
          <div className="name-block">
            <h1 className="name">
              {profile.name}
              <span className="name-en">{profile.englishName}</span>
            </h1>

            <div className="target">
              <span className="target-key">求职意向</span>
              <span className="target-val">{profile.target}</span>
            </div>

            <div className="info-bar">
              <span className="seg meta-text">
                {profile.gender}
                <span className="dot">·</span>
                {profile.age}
                <span className="dot">·</span>
                {profile.yearsOfExperience}
                <span className="dot">·</span>
                期望城市：{profile.expectedCity}
                <span className="dot">·</span>
                <span className="salary">期望薪资：{profile.expectedSalary}</span>
              </span>
              <span className="seg contact-seg">
                <span className="k">电话</span>
                <span className="v">{profile.phone}</span>
                <span className="dot">·</span>
                <span className="k">邮箱</span>
                <span className="v">{profile.email}</span>
                <span className="dot">·</span>
                <span className="k">微信</span>
                <span className="v">{profile.wechat}</span>
              </span>
            </div>
          </div>

          <div className="photo" aria-label="照片">
            <div className="frame">
              <img src={photoUrl} alt={profile.name} />
            </div>
          </div>
        </header>

        <section className="sec">
          <SectionHeader title="个人优势" subtitle="Capabilities" />
          <div className="strengths">
            {strengths.map((strength) => (
              <div className="str" key={strength.key}>
                <span className="key">{strength.key}</span>
                <span className="val">
                  <RichText text={strength.value} />
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="sec">
          <SectionHeader title="工作经历" subtitle="Experience" />
          <EntryBlock entry={experience} />
        </section>

        <section className="sec">
          <SectionHeader title="项目经历" subtitle="Selected Projects" />
          {firstProjectIntro ? <EntryBlock entry={firstProjectIntro} /> : null}
        </section>
      </article>

      <article className="sheet">
        {remainingProjects.length > 0 ? (
          <section className="sec first-sec">
            {firstProjectContinuation ? (
              <EntryBlock entry={firstProjectContinuation} showTitle={false} />
            ) : null}
            {remainingProjects.map((project) => (
              <EntryBlock entry={project} key={project.title} />
            ))}
          </section>
        ) : null}

        <section className="sec">
          <SectionHeader title="教育经历" subtitle="Education" />
          <div className="edu">
            <div className="edu-head">
              <div>
                <span className="school">{education.school}</span>
                <span className="school-meta">
                  {education.degree} · {education.major}
                </span>
              </div>
              <span className="school-date">{education.date}</span>
            </div>

            <div className="edu-line">
              <span className="key">专业课程</span>
              <span className="val">{education.courses.join(' · ')}</span>
            </div>

            <div className="edu-line">
              <span className="key">核心荣誉</span>
              <span className="val">
                {education.honors.map((honor, index) => (
                  <span key={honor}>
                    {index > 0 ? <span className="sep">·</span> : null}
                    <span className="honor-top">{honor}</span>
                  </span>
                ))}
              </span>
            </div>
          </div>
        </section>

        <section className="sec">
          <SectionHeader title="荣誉与证书" subtitle="Honors & Certifications" />
          <div className="edu">
            <div className="edu-line">
              <span className="key">专业证书</span>
              <span className="val">
                {honors.certificates.map((certificate, index) => (
                  <span key={certificate}>
                    {index > 0 ? <span className="sep">·</span> : null}
                    <span className="honor-top">{certificate}</span>
                  </span>
                ))}
              </span>
            </div>

            <div className="edu-line">
              <span className="key">学科竞赛</span>
              <span className="val">{honors.competitions.join(' · ')}</span>
            </div>

            <div className="edu-line">
              <span className="key">综合表彰</span>
              <span className="val">{honors.recognitions.join(' · ')}</span>
            </div>
          </div>
        </section>
      </article>
    </main>
  )
}
