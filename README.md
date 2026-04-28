# ◈ MosaicPin

A Pinterest-style visual explorer for Bluesky. Browse image posts in a masonry grid, filter by topic or hashtag, search by creator, and click any tile to open the original post.

**No login required.** All data is fetched from Bluesky's public API.

---

## Getting started

```bash
npm install
npm run dev
```

---

## How it works

### Modes

The app operates in three mutually exclusive modes, driven by URL state in React:

| Mode | Triggered by | Description |
|---|---|---|
| **Topic** | Clicking a topic chip | Searches by preset hashtag (e.g. `#art`) |
| **Search** | Typing in the search bar | Free-text or `#hashtag` search |
| **Creator** | Typing `@handle` or clicking a creator name on a tile | Shows all image posts from one account |

Navigating to a creator saves the previous topic/search state so the Back button restores it exactly.

---

### API

All requests go to `https://api.bsky.app` — Bluesky's public AppView. No authentication or API key required. CORS headers (`Access-Control-Allow-Origin: *`) are present on all used endpoints.

#### Search mode — `app.bsky.feed.searchPosts`

```
GET https://api.bsky.app/xrpc/app.bsky.feed.searchPosts
  ?q=<query>
  &limit=100
  &sort=latest
```

- Returns up to 100 posts sorted by newest first.
- **No pagination.** Cursor-based pagination returns 403 for unauthenticated requests, so this is a single fetch capped at 100.
- Posts without images are filtered out client-side after the fetch.
- The `has:images` operator is **not supported** by this endpoint and returns zero results if included.

#### Creator mode — `app.bsky.feed.getAuthorFeed`

```
GET https://api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed
  ?actor=<handle>
  &limit=50
  &filter=posts_with_media
  [&cursor=<cursor>]
```

- `filter=posts_with_media` pre-filters server-side to reduce noise.
- **Full infinite scroll supported.** Cursor pagination works without authentication on this endpoint.
- Each scroll-to-bottom appends the next 50 posts.

---

### Response filtering

Every post passes through `toExplorerTile()` (`src/lib/transforms.ts`) before being displayed:

1. **Image check** — keeps only posts where `embed.$type` is `app.bsky.embed.images#view`. Also unwraps `app.bsky.embed.recordWithMedia#view` (quoted posts with attached images) to extract the inner media.
2. **Post URL** — constructs `https://bsky.app/profile/<handle>/post/<rkey>` from the AT URI.
3. **Hashtag extraction** — regex over post text to populate `tags[]` for mute filtering.
4. **Label extraction** — filters Bluesky content labels (`porn`, `nudity`, `gore`, etc.) into `labels[]` for the safety overlay.

---

### Safety

Settings are stored in `localStorage` under `mosaicpin_safety` and applied client-side:

| Setting | Default | Effect |
|---|---|---|
| Blur sensitive content | On | Blurs tiles with known sensitive labels; tap to reveal |
| Strict mode | Off | Hides sensitive tiles entirely |
| Hide posts without alt text | Off | Removes tiles with no image description |
| Muted tags | Empty | Hides tiles whose hashtags match the mute list |

---

### Layout

The masonry grid uses round-robin column distribution to preserve left-to-right, top-to-bottom reading order (newest images across the top row). Column count is fixed per breakpoint:

| Window width | Columns |
|---|---|
| ≤ 425px | 2 |
| ≤ 768px | 3 |
| ≤ 1024px | 5 |
| ≤ 1440px | 6 |
| > 1440px | 7 |

---

## Stack

- React 19 + TypeScript + Vite
- Vanilla CSS (no UI framework)
- No backend — 100% client-side
