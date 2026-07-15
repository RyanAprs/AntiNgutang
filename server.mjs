import { createServer } from 'node:http'
import { callGroqAPI } from './api/lib/parse.js'

const PORT = 3001

const handler = async (req, res) => {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/api/check') {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: 'GROQ_API_KEY not set' }))
      return
    }

    try {
      const model = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Reply with just: OK' }],
          max_tokens: 10,
        }),
      })
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: !!text, text }))
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: e.message }))
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
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw Object.assign(new Error('GROQ_API_KEY not set'), { statusCode: 500 })
    }

    const result = await callGroqAPI(image, apiKey)

    if (result._error) {
      res.writeHead(422, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: result._error, raw: result.raw }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      items: result.items,
      tax: result.tax,
      serviceCharge: result.serviceCharge,
      currency: result.currency,
      raw: result.raw,
    }))
  } catch (err) {
    console.error('API error:', err)
    const statusCode = err.statusCode || 500
    res.writeHead(statusCode, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message }))
  }
}

createServer(handler).listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
