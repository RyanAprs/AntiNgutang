const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const REQUEST_TIMEOUT = 25000
const MAX_RETRIES = 2

const PROMPT = `Analyze this receipt image and extract all items with their prices.
Also find the tax amount (pajak/PPN) and service charge if present.

Respond in this exact JSON format (no markdown, no backticks):
{
  "items": [
    { "name": "item name", "price": 15000 }
  ],
  "tax": 2000,
  "serviceCharge": 3000,
  "currency": "IDR"
}

Rules:
- If tax or service charge is not found, set to 0
- Item prices should be in the numeric form (remove currency symbols)
- Currency defaults to "IDR" for Indonesian receipts
- Only respond with the JSON, nothing else`

export function validateImage(image) {
  if (!image || typeof image !== 'string') {
    const err = new Error('Image is required')
    err.statusCode = 400
    throw err
  }

  const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image

  if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
    const err = new Error('Invalid image format')
    err.statusCode = 400
    throw err
  }

  const decodedSize = Math.ceil((base64Data.length * 3) / 4)
  if (decodedSize > MAX_IMAGE_SIZE) {
    const err = new Error('Image too large (max 5MB)')
    err.statusCode = 400
    throw err
  }

  return base64Data
}

export function extractJSON(text) {
  if (!text) return null

  try {
    return JSON.parse(text.trim())
  } catch {}

  const blockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
  if (blockMatch) {
    try {
      return JSON.parse(blockMatch[1])
    } catch {}
  }

  const objectMatch = text.match(/\{[\s\S]*\}/)
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0])
    } catch {}
  }

  return null
}

export function parseReceiptResponse(text) {
  const raw = text || ''
  const parsed = extractJSON(text)

  if (!parsed) {
    return { items: [], tax: 0, serviceCharge: 0, currency: 'IDR', raw, _error: 'AI returned invalid JSON' }
  }

  const items = Array.isArray(parsed.items)
    ? parsed.items.filter(i => i.name && typeof i.price === 'number' && i.price > 0)
    : []

  return {
    items,
    tax: typeof parsed.tax === 'number' ? parsed.tax : 0,
    serviceCharge: typeof parsed.serviceCharge === 'number' ? parsed.serviceCharge : 0,
    currency: typeof parsed.currency === 'string' ? parsed.currency : 'IDR',
    raw,
  }
}

export async function callGroqAPI(base64Image, apiKey, options = {}) {
  const model = options.model || process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
  const maxTokens = options.maxTokens || Number(process.env.GROQ_MAX_TOKENS) || 2048

  const base64Data = validateImage(base64Image)
  const imageUrl = `data:image/jpeg;base64,${base64Data}`

  const body = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: maxTokens,
  }

  let lastError

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!response.ok) {
        const errText = await response.text()
        const err = new Error(`Groq API error (${response.status}): ${errText}`)
        err.statusCode = 502
        err.retryable = response.status >= 500
        throw err
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      if (!text) {
        const err = new Error('AI returned empty response')
        err.statusCode = 422
        err.retryable = false
        throw err
      }

      return parseReceiptResponse(text)
    } catch (error) {
      lastError = error
      if (error.name === 'AbortError') {
        const err = new Error('Request timed out')
        err.statusCode = 504
        err.retryable = false
        throw err
      }
      if (error.retryable === false) throw error
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError
}
