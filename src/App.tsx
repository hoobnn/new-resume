import { useEffect, useState } from 'react'
import { PrintHint } from './components/PrintHint'
import { ResumePage } from './components/ResumePage'
import { ThemeToolbar } from './components/ThemeToolbar'
import { EN_SCHEMA, ZH_SCHEMA, parseResumeMarkdown } from './lib/resumeMarkdown'
import photoUrl from '../local/data/photo.png'
import resumeZhMarkdown from '../local/data/resume.md?raw'
import resumeEnMarkdown from '../local/data/resume.en.md?raw'
import type { Locale, ResumeData, Theme } from './types'

const THEME_KEY = 'resume-theme'
const LANG_KEY = 'resume-lang'
const PRINT_HINT_KEY = 'resume-pdf-hint-shown'

const resumeByLocale: Record<Locale, ResumeData> = {
  zh: parseResumeMarkdown(resumeZhMarkdown, ZH_SCHEMA),
  en: parseResumeMarkdown(resumeEnMarkdown, EN_SCHEMA),
}

function getInitialTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'paper'
  const saved = localStorage.getItem(THEME_KEY)
  return saved === 'plain' || saved === 'dark' || saved === 'paper' ? saved : 'paper'
}

function getInitialLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'zh'
  const saved = localStorage.getItem(LANG_KEY)
  return saved === 'en' || saved === 'zh' ? saved : 'zh'
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const [showPrintHint, setShowPrintHint] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'
    localStorage.setItem(LANG_KEY, locale)
  }, [locale])

  function printNow() {
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }

  function handlePrintRequest() {
    if (localStorage.getItem(PRINT_HINT_KEY) === '1') {
      printNow()
      return
    }
    setShowPrintHint(true)
  }

  function handleProceedPrint(skipFutureHint: boolean) {
    if (skipFutureHint) {
      localStorage.setItem(PRINT_HINT_KEY, '1')
    }
    setShowPrintHint(false)
    printNow()
  }

  return (
    <>
      <ThemeToolbar
        theme={theme}
        locale={locale}
        onThemeChange={setTheme}
        onLocaleChange={setLocale}
        onPrint={handlePrintRequest}
      />
      <ResumePage photoUrl={photoUrl} resume={resumeByLocale[locale]} locale={locale} />
      {showPrintHint ? (
        <PrintHint
          locale={locale}
          onCancel={() => setShowPrintHint(false)}
          onProceed={handleProceedPrint}
        />
      ) : null}
    </>
  )
}
