import { useState } from 'react'

type Props = {
  initialValue?: string
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ initialValue = '', onSearch, placeholder }: Props) {
  const [value, setValue] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder ?? 'Search images, #tags, or @creators…'}
        className="search-input"
        aria-label="Search images, hashtags, or creators"
      />
      <button type="submit" className="search-btn">Search</button>
    </form>
  )
}
