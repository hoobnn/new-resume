import type { Locale } from '../types'

export interface SectionCopy {
  title: string
  subtitle?: string
}

export interface PrintHintCopy {
  title: string
  step1Pre: string
  step1Strong: string
  step2Pre: string
  step2Strong: string
  step2Post: string
  cancel: string
  proceed: string
  skip: string
}

export interface Labels {
  toolbarTitle: string
  print: string
  themes: { paper: string; plain: string; dark: string }
  colon: string
  resumeLabel: string
  target: string
  expectedCity: string
  expectedSalary: string
  phone: string
  email: string
  wechat: string
  sections: {
    strengths: SectionCopy
    experience: SectionCopy
    projects: SectionCopy
    education: SectionCopy
    honors: SectionCopy
  }
  eduCourses: string
  eduHonors: string
  certCertificates: string
  certCompetitions: string
  certRecognitions: string
  printHint: PrintHintCopy
}

export const LABELS: Record<Locale, Labels> = {
  zh: {
    toolbarTitle: 'Resume Engineering',
    print: '导出 PDF',
    themes: { paper: '纸张', plain: '明亮', dark: '夜间' },
    colon: '：',
    resumeLabel: '简历',
    target: '求职意向',
    expectedCity: '期望城市',
    expectedSalary: '期望薪资',
    phone: '电话',
    email: '邮箱',
    wechat: '微信',
    sections: {
      strengths: { title: '个人优势', subtitle: 'Capabilities' },
      experience: { title: '工作经历', subtitle: 'Experience' },
      projects: { title: '项目经历', subtitle: 'Selected Projects' },
      education: { title: '教育经历', subtitle: 'Education' },
      honors: { title: '荣誉与证书', subtitle: 'Honors & Certifications' },
    },
    eduCourses: '专业课程',
    eduHonors: '核心荣誉',
    certCertificates: '专业证书',
    certCompetitions: '学科竞赛',
    certRecognitions: '综合表彰',
    printHint: {
      title: '导出文字可选 PDF',
      step1Pre: '“目标 / Destination” 选择 ',
      step1Strong: '另存为 PDF / Save as PDF',
      step2Pre: '勾选 ',
      step2Strong: '背景图形 / Background graphics',
      step2Post: '，保留纸张底色',
      cancel: '取消',
      proceed: '继续打印',
      skip: '不再提示',
    },
  },
  en: {
    toolbarTitle: 'Resume Engineering',
    print: 'Export PDF',
    themes: { paper: 'Paper', plain: 'Light', dark: 'Dark' },
    colon: ': ',
    resumeLabel: 'Resume',
    target: 'Objective',
    expectedCity: 'Location',
    expectedSalary: 'Expected Salary',
    phone: 'Phone',
    email: 'Email',
    wechat: 'WeChat',
    sections: {
      strengths: { title: 'Highlights' },
      experience: { title: 'Experience' },
      projects: { title: 'Selected Projects' },
      education: { title: 'Education' },
      honors: { title: 'Honors & Certifications' },
    },
    eduCourses: 'Core Courses',
    eduHonors: 'Honors',
    certCertificates: 'Certifications',
    certCompetitions: 'Competitions',
    certRecognitions: 'Recognitions',
    printHint: {
      title: 'Export a text-selectable PDF',
      step1Pre: 'Set "Destination" to ',
      step1Strong: 'Save as PDF',
      step2Pre: 'Enable ',
      step2Strong: 'Background graphics',
      step2Post: ' to keep the paper tint',
      cancel: 'Cancel',
      proceed: 'Print',
      skip: "Don't show again",
    },
  },
}
