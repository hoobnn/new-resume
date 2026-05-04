export type Theme = 'paper' | 'plain' | 'dark'

export interface Profile {
  name: string
  englishName: string
  gender: string
  age: string
  yearsOfExperience: string
  target: string
  expectedSalary: string
  expectedCity: string
  phone: string
  email: string
  wechat: string
}

export interface Strength {
  key: string
  value: string
}

export interface Bullet {
  lead?: string
  text: string
}

export interface Entry {
  title: string
  role?: string
  date?: string
  lede?: string
  bullets: Bullet[]
}

export interface Education {
  school: string
  degree: string
  major: string
  date: string
  courses: string[]
  honors: string[]
}

export interface Honors {
  certificates: string[]
  competitions: string[]
  recognitions: string[]
}

export interface ResumeData {
  profile: Profile
  strengths: Strength[]
  experience: Entry
  projects: Entry[]
  education: Education
  honors: Honors
}
