import { useState } from 'react'
import type { SafetySettings } from '../types'

type Props = {
  labels?: string[]
  safety: SafetySettings
  children: React.ReactNode
}

export function SafetyOverlay({ labels, safety, children }: Props) {
  const [revealed, setRevealed] = useState(false)

  const isSensitive = labels && labels.length > 0
  const shouldBlur = isSensitive && safety.blurSensitive && !revealed

  if (!shouldBlur) return <>{children}</>

  return (
    <div className="safety-wrapper">
      <div className="safety-blur">{children}</div>
      <button
        className="safety-reveal"
        onClick={e => { e.stopPropagation(); setRevealed(true) }}
        aria-label="Reveal sensitive content"
      >
        Sensitive content
        <span>Tap to reveal</span>
      </button>
    </div>
  )
}
