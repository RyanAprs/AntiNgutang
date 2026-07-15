import { useState, useCallback } from 'react'

export interface ExtractedItem {
  name: string
  price: number
}

export interface GeminiResult {
  items: ExtractedItem[]
  tax: number
  serviceCharge: number
  currency?: string
  raw?: string
}

export function useGemini() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeImage = useCallback(async (imageBase64: string): Promise<GeminiResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || `HTTP ${res.status}`)
      }

      const data: GeminiResult = await res.json()

      if (!data.items?.length) {
        throw new Error('Tidak ada item yang terdeteksi. Coba foto ulang struknya.')
      }

      return data
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal menganalisis struk'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { analyzeImage, loading, error, clearError: () => setError(null) }
}
