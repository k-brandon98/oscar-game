import { useEffect, useState } from 'react'
import { getImageQuery, getImageSearchType } from '../lib/scoring'

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim()

export default function NomineeImage({ categoryName, nominee }) {
  const [imagePath, setImagePath] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadImage() {
      if (!TMDB_API_KEY || !nominee) return

      try {
        setLoading(true)
        const searchType = getImageSearchType(categoryName)
        const query = getImageQuery(categoryName, nominee)
        const url = new URL(`https://api.themoviedb.org/3/search/${searchType}`)
        url.searchParams.set('api_key', TMDB_API_KEY)
        url.searchParams.set('query', query)
        url.searchParams.set('include_adult', 'false')

        const res = await fetch(url.toString())
        const data = await res.json()
        const pathField = searchType === 'person' ? 'profile_path' : 'poster_path'
        const firstWithImage = (data?.results || []).find((item) => item?.[pathField])

        if (!cancelled) setImagePath(firstWithImage?.[pathField] || '')
      } catch {
        if (!cancelled) setImagePath('')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadImage()
    return () => {
      cancelled = true
    }
  }, [categoryName, nominee])

  if (!TMDB_API_KEY) {
    return (
      <div
        style={{
          width: 80,
          height: 112,
          display: 'grid',
          placeItems: 'center',
          border: '1px dashed #666',
          borderRadius: 12,
          fontSize: 10,
        }}
      >
        No key
      </div>
    )
  }

  if (imagePath) {
    return (
      <img
        src={`${IMAGE_BASE}${imagePath}`}
        alt={nominee?.name || 'Nominee'}
        style={{ width: 80, height: 112, objectFit: 'cover', borderRadius: 12 }}
      />
    )
  }

  return (
    <div
      style={{
        width: 80,
        height: 112,
        display: 'grid',
        placeItems: 'center',
        border: '1px solid #333',
        borderRadius: 12,
        fontSize: 10,
      }}
    >
      {loading ? 'Loading…' : 'No image'}
    </div>
  )
}