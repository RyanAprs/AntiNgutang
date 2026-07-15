import type { VercelRequest, VercelResponse } from '@vercel/node'

interface ReceiptResponse {
  items: { name: string; price: number }[]
  tax: number
  serviceCharge: number
  currency?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { image } = req.body
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Image is required' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
  }

  try {
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image
    const imageUrl = `data:image/jpeg;base64,${base64Data}`

    const prompt = `Analyze this receipt image and extract all items with their prices.
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Groq API error: ${errText}`)
    }

    const groqData = await response.json()
    const text: string = groqData.choices?.[0]?.message?.content
    if (!text) {
      return res.status(422).json({ error: 'AI returned empty response' })
    }

    const jsonStr = text.replace(/```json?/gi, '').replace(/```/g, '').trim()
    const data: ReceiptResponse = JSON.parse(jsonStr)

    if (!Array.isArray(data.items)) {
      throw new Error('Invalid response structure')
    }

    data.items = data.items.filter(
      (item) => item.name && typeof item.price === 'number' && item.price > 0,
    )

    return res.status(200).json(data)
  } catch (error) {
    console.error('Groq API error:', error)
    const message = error instanceof Error ? error.message : 'Failed to analyze receipt'
    return res.status(500).json({ error: message })
  }
}
