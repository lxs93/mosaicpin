import type { ExplorerTile, TileImage } from '../types'

const SENSITIVE_LABELS = new Set([
  'porn', 'sexual', 'nudity', 'graphic-media', 'gore', 'violence',
])

export function toExplorerTile(post: Record<string, unknown>): ExplorerTile | null {
  let embed = post.embed as Record<string, unknown> | undefined

  // recordWithMedia wraps images inside a `media` field — unwrap it
  if (embed?.['$type'] === 'app.bsky.embed.recordWithMedia#view') {
    embed = embed.media as Record<string, unknown> | undefined
  }

  if (embed?.['$type'] !== 'app.bsky.embed.images#view') return null

  const rawImages = embed.images as Array<Record<string, unknown>>
  if (!Array.isArray(rawImages) || rawImages.length === 0) return null

  const images: TileImage[] = rawImages.map(img => {
    const ar = img.aspectRatio as Record<string, number> | undefined
    return {
      thumb: img.thumb as string,
      full: img.fullsize as string,
      alt: img.alt as string | undefined,
      aspectRatio: ar ? ar.width / ar.height : undefined,
    }
  })

  const author = post.author as Record<string, unknown>
  const record = post.record as Record<string, unknown>
  const uri = post.uri as string
  const rkey = uri.split('/').pop() ?? ''
  const handle = author.handle as string

  const rawLabels = post.labels as Array<Record<string, unknown>> | undefined
  const labels = rawLabels
    ?.map(l => l.val as string)
    .filter(v => SENSITIVE_LABELS.has(v)) ?? []

  const text = (record?.text as string) ?? ''
  const tags = extractTags(text)

  return {
    uri,
    postUrl: `https://bsky.app/profile/${handle}/post/${rkey}`,
    did: author.did as string,
    handle,
    displayName: author.displayName as string | undefined,
    avatar: author.avatar as string | undefined,
    text,
    createdAt: (record?.createdAt as string) ?? new Date().toISOString(),
    images,
    tags,
    labels,
  }
}

function extractTags(text: string): string[] {
  const matches = text.matchAll(/#(\w+)/g)
  return [...matches].map(m => m[1].toLowerCase())
}
