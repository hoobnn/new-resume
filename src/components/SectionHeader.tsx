interface SectionHeaderProps {
  title: string
  subtitle: string
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="sec-head">
      <span className="pip" />
      <span className="zh">{title}</span>
      <span className="en">{subtitle}</span>
      <span className="rule" />
    </div>
  )
}
