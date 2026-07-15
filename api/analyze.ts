import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callGroqAPI } from './lib/parse.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
  }

  try {
    const { image } = req.body
    const result = await callGroqAPI(image, apiKey)

    if (result._error) {
      return res.status(422).json({ error: result._error, raw: result.raw })
    }

    return res.status(200).json({
      items: result.items,
      tax: result.tax,
      serviceCharge: result.serviceCharge,
      currency: result.currency,
      raw: result.raw,
    })
  } catch (error: unknown) {
    console.error('API error:', error)
    const err = error as Error & { statusCode?: number }
    const statusCode = err.statusCode || 500
    const message = err.message || 'Failed to analyze receipt'
    return res.status(statusCode).json({ error: message })
  }
}
