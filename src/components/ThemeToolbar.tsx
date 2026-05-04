import type { Theme } from '../types'

interface ThemeToolbarProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onPrint: () => void
}

const themes: Array<{ key: Theme; label: string }> = [
  { key: 'paper', label: '纸张' },
  { key: 'plain', label: '明亮' },
  { key: 'dark', label: '夜间' },
]

export function ThemeToolbar({ theme, onThemeChange, onPrint }: ThemeToolbarProps) {
  return (
    <header className="app-toolbar no-print" aria-label="页面工具栏">
      <div className="toolbar-inner">
        <div className="toolbar-title">Resume Engineering</div>
        <div className="toolbar-actions">
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
            导出 PDF
          </button>
        </div>
      </div>
    </header>
  )
}
