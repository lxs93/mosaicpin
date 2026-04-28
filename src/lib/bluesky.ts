import type { ExplorerTile } from '../types'
import { toExplorerTile } from './transforms'

const BASE_URL = 'https://api.bsky.app'

async function apiFetch(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (res.status === 429) throw new Error('Too many requests. Please wait a moment and try again.')
  if (res.status === 400) throw new Error('Invalid request. Please check your search term.')
  if (!res.ok) throw new Error(`Request failed (${res.status}). Please try again.`)
  return res.json()
}

// Unauthenticated searchPosts only allows the first page (cursor pagination returns 403).
// We fetch the max allowed (100) and disable further pagination.
export async function searchImagePosts(
  query: string,
): Promise<{ tiles: ExplorerTile[]; cursor: string | undefined }> {
  const q = encodeURIComponent(query)
  const data = await apiFetch(
    `/xrpc/app.bsky.feed.searchPosts?q=${q}&limit=100&sort=latest`
  ) as Record<string, unknown>

  const posts = data.posts as Array<Record<string, unknown>>
  if (!Array.isArray(posts)) return { tiles: [], cursor: undefined }

  const tiles = posts.flatMap(p => {
    const tile = toExplorerTile(p)
    return tile ? [tile] : []
  })

  return { tiles, cursor: undefined }
}

export async function getCreatorImagePosts(
  handle: string,
  cursor?: string,
): Promise<{ tiles: ExplorerTile[]; cursor: string | undefined }> {
  const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''
  const data = await apiFetch(
    `/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=50&filter=posts_with_media${cursorParam}`
  ) as Record<string, unknown>

  const feed = data.feed as Array<Record<string, unknown>>
  if (!Array.isArray(feed)) return { tiles: [], cursor: undefined }

  const tiles = feed.flatMap(item => {
    const post = item.post as Record<string, unknown>
    const tile = toExplorerTile(post)
    return tile ? [tile] : []
  })

  return { tiles, cursor: data.cursor as string | undefined }
}
