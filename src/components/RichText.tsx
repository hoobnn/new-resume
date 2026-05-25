interface RichTextProps {
  text: string
}

export function RichText({ text }: RichTextProps) {
  const parts = text.split(/(\*\*[^*]+\*\*|<br\s*\/?>)/g).filter(Boolean)

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(/^<br\s*\/?>$/)) {
          return <br key={`${part}-${index}`} />
        }

        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
        }

        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </>
  )
}
