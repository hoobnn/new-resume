import { LABELS } from '../lib/i18n'
import type { Locale, Theme } from '../types'

interface ThemeToolbarProps {
  theme: Theme
  locale: Locale
  onThemeChange: (theme: Theme) => void
  onLocaleChange: (locale: Locale) => void
  onPrint: () => void
}

const locales: Array<{ key: Locale; label: string }> = [
  { key: 'zh', label: '中' },
  { key: 'en', label: 'EN' },
]

export function ThemeToolbar({
  theme,
  locale,
  onThemeChange,
  onLocaleChange,
  onPrint,
}: ThemeToolbarProps) {
  const labels = LABELS[locale]
  const themes: Array<{ key: Theme; label: string }> = [
    { key: 'paper', label: labels.themes.paper },
    { key: 'plain', label: labels.themes.plain },
    { key: 'dark', label: labels.themes.dark },
  ]

  return (
    <header className="app-toolbar no-print" aria-label="页面工具栏">
      <div className="toolbar-inner">
        <div className="toolbar-title">{labels.toolbarTitle}</div>
        <div className="toolbar-actions">
          <div className="segmented" aria-label="语言切换">
            {locales.map((item) => (
              <button
                className={`tool-btn${item.key === locale ? ' is-active' : ''}`}
                key={item.key}
                type="button"
                onClick={() => onLocaleChange(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="segmented" aria-label="主题切换">
            {themes.map((item) => (
              <button
                className={`tool-btn${item.key === theme ? ' is-active' : ''}`}
                key={item.key}
                type="button"
                onClick={() => onThemeChange(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button className="tool-btn print-tool" type="button" onClick={onPrint}>
            {labels.print}
          </button>
        </div>
      </div>
    </header>
  )
}
