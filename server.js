import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { handleChatRequest } from './src/chatbot/chatHandler.js'

const app = express()
const PORT = globalThis.process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configuredFrontendOrigins = (globalThis.process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)
const allowedOrigins = new Set([
  ...configuredFrontendOrigins,
  ...(globalThis.process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173']),
])

app.disable('x-powered-by')
app.use((request, response, next) => {
  const origin = request.headers.origin
  if (request.method === 'OPTIONS') {
    if (!origin || !allowedOrigins.has(origin)) return response.sendStatus(403)
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.setHeader('Vary', 'Origin')
    return response.sendStatus(204)
  }
  if (!origin || !allowedOrigins.has(origin)) return next()

  response.setHeader('Access-Control-Allow-Origin', origin)
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.setHeader('Vary', 'Origin')
  return next()
})
app.use(express.json({ limit: '32kb' }))
app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'farhad-global-trade-api', groqConfigured: Boolean(globalThis.process.env.GROQ_API_KEY) })
})
app.post('/api/chat', handleChatRequest)

const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (_request, response) => response.sendFile(path.join(distPath, 'index.html')))

app.use((error, _request, response, next) => {
  console.error('Request handling error:', error.message)
  if (response.headersSent) return next(error)
  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
    return response.status(400).json({ success: false, error: 'Please send a valid message.' })
  }
  return response.status(500).json({ success: false, error: 'Sorry, I’m having trouble connecting right now. Please try again in a moment.' })
})

app.listen(PORT, '0.0.0.0', () => console.log(`Farhad Global Trade server listening on port ${PORT}`))