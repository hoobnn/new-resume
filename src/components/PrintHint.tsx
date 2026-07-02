import { LABELS } from '../lib/i18n'
import type { Locale } from '../types'

interface PrintHintProps {
  locale: Locale
  onCancel: () => void
  onProceed: (skipFutureHint: boolean) => void
}

export function PrintHint({ locale, onCancel, onProceed }: PrintHintProps) {
  const hint = LABELS[locale].printHint

  return (
    <div className="pdf-hint no-print" role="presentation" onClick={onCancel}>
      <div
        className="pdf-hint-card"
        role="dialog"
        aria-labelledby="pdf-hint-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pdf-hint-title" id="pdf-hint-title">
          {hint.title}
        </div>
        <ol className="pdf-hint-list">
          <li>
            {hint.step1Pre}
            <strong>{hint.step1Strong}</strong>
          </li>
          <li>
            {hint.step2Pre}
            <strong>{hint.step2Strong}</strong>
            {hint.step2Post}
          </li>
        </ol>
        <div className="pdf-hint-actions">
          <button type="button" className="pdf-hint-cancel" onClick={onCancel}>
            {hint.cancel}
          </button>
          <button
            type="button"
            className="pdf-hint-go"
            onClick={() => {
              const checkbox = document.getElementById('pdf-hint-skip') as HTMLInputElement | null
              onProceed(Boolean(checkbox?.checked))
            }}
          >
            {hint.proceed}
          </button>
        </div>
        <label className="pdf-hint-skip">
          <input type="checkbox" id="pdf-hint-skip" /> {hint.skip}
        </label>
      </div>
    </div>
  )
}
