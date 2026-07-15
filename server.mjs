import { createServer } from 'node:http'

const PORT = 3001

const handler = async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/check') {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return res.writeHead(200).end(JSON.stringify({ ok: false, error: 'GROQ_API_KEY not set' }))
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: 'Reply with just: OK' }],
          max_tokens: 10,
        }),
      })
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      res.writeHead(200).end(JSON.stringify({ ok: !!text, text }))
    } catch (e) {
      res.writeHead(200).end(JSON.stringify({ ok: false, error: e.message }))
    }
    return
  }

  if (req.method !== 'POST' || req.url !== '/api/analyze') {
    res.writeHead(404).end()
    return
  }

  let body = ''
  for await (const chunk of req) body += chunk

  try {
    const { image } = JSON.parse(body)
    if (!image) throw new Error('Image is required')

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY not set in .env')

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
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
    const text = groqData.choices?.[0]?.message?.content
    if (!text) throw new Error('AI returned empty response')

    const jsonStr = text.replace(/```json?/gi, '').replace(/```/g, '').trim()
    const data = JSON.parse(jsonStr)

    if (!Array.isArray(data.items)) throw new Error('Invalid response structure')
    data.items = data.items.filter(item => item.name && typeof item.price === 'number' && item.price > 0)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('API error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message }))
  }
}

createServer(handler).listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
