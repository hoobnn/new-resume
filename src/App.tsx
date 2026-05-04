import { useEffect, useState } from 'react'
import { PrintHint } from './components/PrintHint'
import { ResumePage } from './components/ResumePage'
import { ThemeToolbar } from './components/ThemeToolbar'
import { parseResumeMarkdown } from './lib/resumeMarkdown'
import photoUrl from '../local/data/photo.png'
import resumeMarkdown from '../local/data/resume.md?raw'
import type { Theme } from './types'

const THEME_KEY = 'resume-theme'
const PRINT_HINT_KEY = 'resume-pdf-hint-shown'
const resume = parseResumeMarkdown(resumeMarkdown)

function getInitialTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'paper'
  const saved = localStorage.getItem(THEME_KEY)
  return saved === 'plain' || saved === 'dark' || saved === 'paper' ? saved : 'paper'
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [showPrintHint, setShowPrintHint] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

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
      <ThemeToolbar theme={theme} onThemeChange={setTheme} onPrint={handlePrintRequest} />
      <ResumePage photoUrl={photoUrl} resume={resume} />
      {showPrintHint ? (
        <PrintHint onCancel={() => setShowPrintHint(false)} onProceed={handleProceedPrint} />
      ) : null}
    </>
  )
}
