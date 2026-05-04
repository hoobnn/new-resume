import type { Entry } from '../types'
import { RichText } from './RichText'

interface EntryBlockProps {
  entry: Entry
}

export function EntryBlock({ entry }: EntryBlockProps) {
  return (
    <article className="entry">
      <div className="entry-title">
        <span className="org">{entry.title}</span>
        {entry.role ? <span className="role">{entry.role}</span> : null}
        {entry.date ? <span className="date">{entry.date}</span> : null}
      </div>

      {entry.lede ? (
        <p className="entry-lede">
          <RichText text={entry.lede} />
        </p>
      ) : null}

      <ul className="bullets">
        {entry.bullets.map((bullet) => (
          <li key={`${entry.title}-${bullet.lead ?? bullet.text}`}>
            {bullet.lead ? <strong>{bullet.lead} · </strong> : null}
            <RichText text={bullet.text} />
          </li>
        ))}
      </ul>
    </article>
  )
}
