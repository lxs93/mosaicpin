import { useEffect, useRef, useState } from 'react'
import type { ExplorerTile as TileData, SafetySettings } from '../types'
import { ExplorerTile } from './ExplorerTile'

type Props = {
  tiles: TileData[]
  safety: SafetySettings
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onCreatorClick: (handle: string) => void
  onImageClick: (tile: TileData, index: number) => void
}

function getColumnCount(width: number): number {
  if (width <= 425) return 2
  if (width <= 768) return 3
  if (width <= 1024) return 5
  if (width <= 1440) return 6
  return 7
}

function distributeRoundRobin(items: TileData[], cols: number): TileData[][] {
  const columns: TileData[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => columns[i % cols].push(item))
  return columns
}

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

export function MasonryGrid({
  tiles, safety, loading, hasMore, onLoadMore, onCreatorClick, onImageClick,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const windowWidth = useWindowWidth()
  const colCount = getColumnCount(windowWidth)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) onLoadMore()
      },
      { rootMargin: '600px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  if (!loading && tiles.length === 0) {
    return <div className="empty-state">No images found. Try a different search or topic.</div>
  }

  const columns = distributeRoundRobin(tiles, colCount)

  return (
    <>
      <div className="masonry-grid">
        {columns.map((col, ci) => (
          <div key={ci} className="masonry-column">
            {col.map(tile => (
              <ExplorerTile
                key={tile.uri}
                tile={tile}
                safety={safety}
                onCreatorClick={onCreatorClick}
                onImageClick={onImageClick}
              />
            ))}
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="masonry-sentinel" aria-hidden="true" />
      {loading && (
        <div className="masonry-loading" aria-live="polite">Loading…</div>
      )}
    </>
  )
}
