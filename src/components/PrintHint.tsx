interface PrintHintProps {
  onCancel: () => void
  onProceed: (skipFutureHint: boolean) => void
}

export function PrintHint({ onCancel, onProceed }: PrintHintProps) {
  return (
    <div className="pdf-hint no-print" role="presentation" onClick={onCancel}>
      <div
        className="pdf-hint-card"
        role="dialog"
        aria-labelledby="pdf-hint-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pdf-hint-title" id="pdf-hint-title">
          导出文字可选 PDF
        </div>
        <ol className="pdf-hint-list">
          <li>
            “目标 / Destination” 选择 <strong>另存为 PDF / Save as PDF</strong>
          </li>
          <li>
            勾选 <strong>背景图形 / Background graphics</strong>，保留纸张底色
          </li>
        </ol>
        <div className="pdf-hint-actions">
          <button type="button" className="pdf-hint-cancel" onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className="pdf-hint-go"
            onClick={() => {
              const checkbox = document.getElementById('pdf-hint-skip') as HTMLInputElement | null
              onProceed(Boolean(checkbox?.checked))
            }}
          >
            继续打印
          </button>
        </div>
        <label className="pdf-hint-skip">
          <input type="checkbox" id="pdf-hint-skip" /> 不再提示
        </label>
      </div>
    </div>
  )
}
