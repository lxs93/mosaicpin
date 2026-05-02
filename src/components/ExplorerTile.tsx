import type { ExplorerTile as TileData, SafetySettings } from '../types'
import { SafetyOverlay } from './SafetyOverlay'

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type Props = {
  tile: TileData
  safety: SafetySettings
  onCreatorClick: (handle: string) => void
  onImageClick: (tile: TileData, index: number) => void
}

export function ExplorerTile({ tile, safety, onCreatorClick, onImageClick }: Props) {
  const image = tile.images[0]

  if (safety.hideNoAlt && !image.alt) return null
  if (tile.tags.some(tag => safety.mutedTags.includes(tag))) return null
  if (safety.strictMode && tile.labels && tile.labels.length > 0) return null

  return (
    <div
      className="explorer-tile"
      onClick={() => onImageClick(tile, 0)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onImageClick(tile, 0) }}
      aria-label={`Image post by ${tile.handle}`}
    >
      <SafetyOverlay labels={tile.labels} safety={safety}>
        <div className="tile-image-wrapper">
          <img
            src={image.thumb}
            alt={image.alt ?? ''}
            loading="lazy"
          />
          {tile.images.length > 1 && (
            <span className="tile-multi-badge" aria-label={`${tile.images.length} images`}>
              {tile.images.length}
            </span>
          )}
          <span className="tile-date-badge" aria-label={`Posted ${tile.createdAt}`}>
            {formatRelativeDate(tile.createdAt)}
          </span>
        </div>
        <div className="tile-overlay">
          <button
            className="tile-creator"
            onClick={e => { e.stopPropagation(); onCreatorClick(tile.handle) }}
            aria-label={`View posts by ${tile.handle}`}
          >
            {tile.avatar && <img src={tile.avatar} alt="" className="tile-avatar" />}
            <span>{tile.displayName ?? tile.handle}</span>
          </button>
          {tile.text && (
            <p className="tile-text">
              {tile.text.length > 80 ? `${tile.text.slice(0, 80)}…` : tile.text}
            </p>
          )}
        </div>
      </SafetyOverlay>
    </div>
  )
}
