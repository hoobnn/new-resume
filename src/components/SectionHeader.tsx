interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="sec-head">
      <span className="pip" />
      <span className="zh">{title}</span>
      {subtitle ? <span className="en">{subtitle}</span> : null}
      <span className="rule" />
    </div>
  )
}
