import { useEffect, useCallback } from 'react'
import type { ExplorerTile as TileData } from '../types'

type Props = {
  tile: TileData
  imageIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function Lightbox({ tile, imageIndex, onClose, onNext, onPrev }: Props) {
  const image = tile.images[imageIndex]
  const hasMultiple = tile.images.length > 1

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowRight') onNext()
    else if (e.key === 'ArrowLeft') onPrev()
  }, [onClose, onNext, onPrev])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close image viewer">✕</button>

        <img
          src={image.full}
          alt={image.alt ?? ''}
          className="lightbox-img"
        />

        {hasMultiple && (
          <>
            <button className="lightbox-prev" onClick={onPrev} aria-label="Previous image">‹</button>
            <button className="lightbox-next" onClick={onNext} aria-label="Next image">›</button>
            <div className="lightbox-dots" aria-hidden="true">
              {tile.images.map((_, i) => (
                <span key={i} className={`dot${i === imageIndex ? ' active' : ''}`} />
              ))}
            </div>
          </>
        )}

        <div className="lightbox-meta">
          <a
            href={tile.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lightbox-open-btn"
          >
            Open on Bluesky ↗
          </a>
          {image.alt && <p className="lightbox-alt">{image.alt}</p>}
        </div>
      </div>
    </div>
  )
}
