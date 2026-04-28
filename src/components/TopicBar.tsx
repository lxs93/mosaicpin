import type { TopicChip } from '../types'
import { TOPICS } from '../types'

type Props = {
  activeTopic: string | null
  onSelect: (topic: TopicChip | null) => void
}

export function TopicBar({ activeTopic, onSelect }: Props) {
  return (
    <nav className="topic-bar" aria-label="Topic filters">
      <button
        className={`topic-chip${activeTopic === null ? ' active' : ''}`}
        onClick={() => onSelect(null)}
        aria-pressed={activeTopic === null}
      >
        All
      </button>
      {TOPICS.map(topic => (
        <button
          key={topic.query}
          className={`topic-chip${activeTopic === topic.query ? ' active' : ''}`}
          onClick={() => onSelect(activeTopic === topic.query ? null : topic)}
          aria-pressed={activeTopic === topic.query}
        >
          {topic.label}
        </button>
      ))}
    </nav>
  )
}
