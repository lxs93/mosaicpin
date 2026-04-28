import { useState, useEffect, useCallback, useRef } from 'react'
import type { ExplorerTile, SafetySettings, TopicChip } from './types'
import { DEFAULT_SAFETY } from './types'
import { searchImagePosts, getCreatorImagePosts } from './lib/bluesky'
import { MasonryGrid } from './components/MasonryGrid'
import { TopicBar } from './components/TopicBar'
import { SearchBar } from './components/SearchBar'
import { Lightbox } from './components/Lightbox'
import { SettingsPanel } from './components/SettingsPanel'
import './App.css'

type LightboxState = { tile: ExplorerTile; index: number } | null

const DEFAULT_QUERY = '#art'

function loadSafety(): SafetySettings {
  try {
    const raw = localStorage.getItem('mosaicpin_safety')
    if (raw) return { ...DEFAULT_SAFETY, ...JSON.parse(raw) as SafetySettings }
  } catch { /* ignore */ }
  return DEFAULT_SAFETY
}

function saveSafety(s: SafetySettings) {
  localStorage.setItem('mosaicpin_safety', JSON.stringify(s))
}

export default function App() {
  const [safety, setSafety] = useState<SafetySettings>(loadSafety)
  const [showSettings, setShowSettings] = useState(false)
  const [lightbox, setLightbox] = useState<LightboxState>(null)

  const [tiles, setTiles] = useState<ExplorerTile[]>([])
  const [cursor, setCursor] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [activeQuery, setActiveQuery] = useState<string>('')
  const [creatorHandle, setCreatorHandle] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const prevSearch = useRef<{ activeTopic: string | null; activeQuery: string } | null>(null)

  const effectiveQuery = activeTopic ?? (activeQuery || DEFAULT_QUERY)

  const fetchTiles = useCallback(async (
    query: string,
    creator: string | null,
    cur?: string,
  ) => {
    setLoading(true)
    setError(null)
    try {
      let result: { tiles: ExplorerTile[]; cursor: string | undefined }
      if (creator) {
        result = await getCreatorImagePosts(creator, cur)
      } else {
        result = await searchImagePosts(query)
      }
      setTiles(prev => cur ? [...prev, ...result.tiles] : result.tiles)
      setCursor(result.cursor)
      setHasMore(!!result.cursor && result.tiles.length > 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setTiles([])
    setCursor(undefined)
    setHasMore(true)
    void fetchTiles(effectiveQuery, creatorHandle)
  }, [effectiveQuery, creatorHandle, fetchTiles, refreshKey])

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) void fetchTiles(effectiveQuery, creatorHandle, cursor)
  }, [loading, hasMore, fetchTiles, effectiveQuery, creatorHandle, cursor])

  const handleSearch = (q: string) => {
    if (q.startsWith('@')) {
      setCreatorHandle(q.slice(1).replace(/^@/, ''))
      setActiveTopic(null)
      setActiveQuery('')
    } else {
      setCreatorHandle(null)
      setActiveTopic(null)
      setActiveQuery(q)
    }
  }

  const handleTopicSelect = (topic: TopicChip | null) => {
    setCreatorHandle(null)
    setActiveTopic(topic?.query ?? null)
    setActiveQuery('')
  }

  const handleCreatorClick = (handle: string) => {
    prevSearch.current = { activeTopic, activeQuery }
    setCreatorHandle(handle)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSettingsChange = (s: SafetySettings) => {
    setSafety(s)
    saveSafety(s)
  }

  const handleImageClick = (tile: ExplorerTile, index: number) => {
    setLightbox({ tile, index })
  }

  const closeLightbox = () => setLightbox(null)

  const nextImage = () => {
    if (!lightbox) return
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.tile.images.length })
  }

  const prevImage = () => {
    if (!lightbox) return
    const len = lightbox.tile.images.length
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + len) % len })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon" aria-hidden="true">◈</span>
          <h1 className="brand-name">MosaicPin</h1>
          <span className="brand-sub">Bluesky image explorer</span>
        </div>
        <div className="header-controls">
          <SearchBar onSearch={handleSearch} />
          <button
            className={`refresh-btn${loading ? ' spinning' : ''}`}
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            aria-label="Refresh"
          >
            ↻
          </button>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            aria-label="Open safety settings"
          >
            ⚙
          </button>
        </div>
      </header>

      {creatorHandle ? (
        <div className="creator-banner">
          <button
            className="back-btn"
            onClick={() => {
              setCreatorHandle(null)
              if (prevSearch.current) {
                setActiveTopic(prevSearch.current.activeTopic)
                setActiveQuery(prevSearch.current.activeQuery)
                prevSearch.current = null
              }
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            ← Back
          </button>
          <span className="creator-title">@{creatorHandle}</span>
        </div>
      ) : (
        <TopicBar activeTopic={activeTopic} onSelect={handleTopicSelect} />
      )}

      {error && (
        <div className="error-bar" role="alert">{error}</div>
      )}

      <main className="app-main">
        <MasonryGrid
          tiles={tiles}
          safety={safety}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onCreatorClick={handleCreatorClick}
          onImageClick={handleImageClick}
        />
      </main>

      {lightbox && (
        <Lightbox
          tile={lightbox.tile}
          imageIndex={lightbox.index}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={safety}
          onChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
