export type TileImage = {
  thumb: string
  full: string
  alt?: string
  aspectRatio?: number
}

export type ExplorerTile = {
  uri: string
  postUrl: string
  did: string
  handle: string
  displayName?: string
  avatar?: string
  text?: string
  createdAt: string
  images: TileImage[]
  tags: string[]
  labels?: string[]
}

export type SafetySettings = {
  blurSensitive: boolean
  strictMode: boolean
  mutedTags: string[]
  hideNoAlt: boolean
}

export const DEFAULT_SAFETY: SafetySettings = {
  blurSensitive: true,
  strictMode: false,
  mutedTags: [],
  hideNoAlt: false,
}

export type TopicChip = {
  label: string
  query: string
}

export const TOPICS: TopicChip[] = [
  { label: 'Art', query: '#art' },
  { label: 'Photography', query: '#photography' },
  { label: 'Illustration', query: '#illustration' },
  { label: 'Pixel Art', query: '#pixelart' },
  { label: 'Nature', query: '#nature' },
  { label: 'Architecture', query: '#architecture' },
  { label: 'Fashion', query: '#fashion' },
  { label: 'UI/UX', query: '#ui' },
  { label: 'Posters', query: '#poster' },
  { label: 'Comics', query: '#comics' },
  { label: 'Digital Art', query: '#digitalart' },
]
