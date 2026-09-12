import Groq from 'groq-sdk'
import { getContactResponse, getLocationResponse, getOpeningStatus, isContactQuestion, isLocationQuestion, isOpeningStatusQuestion } from './businessKnowledge.js'

const defaultModel = 'openai/gpt-oss-20b'
const maxMessageLength = 2000
const maxHistoryEntries = 12
const requestWindowMs = 60_000
const requestLimit = 30
const requestLog = new Map()
const groqRequestTimeoutMs = 14_000
const safeErrorMessage = 'Sorry, I’m having trouble connecting right now. Please try again in a moment.'
let groqClientFactory = (apiKey) => new Groq({ apiKey })

function isRateLimited(request) {
  const address = request.ip || request.socket?.remoteAddress || request.headers?.['x-forwarded-for'] || 'unknown'
  const now = Date.now()
  const recentRequests = (requestLog.get(address) || []).filter((time) => now - time < requestWindowMs)
  recentRequests.push(now)
  requestLog.set(address, recentRequests)
  return recentRequests.length > requestLimit
}

function getSystemPrompt(openingStatus) {
  return `You are Farhad Global Trade Business Assistant.

Farhad Global Trade is an import, sourcing and supply business operating in Bangladesh. It connects international suppliers and products with the Bangladeshi market.
Founder: Mir Mohammed Farhad. Role: Founder. Tagline: Global Connections.
Contact: +880 1884 821475. Email: miafarhad01636@gmail.com.
Address: Oriant Tower (7th flood), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh.

Known product categories:
- Automotive: vehicles, car engines and automotive products.
- Engine & Spare Parts: car engines, spare parts and automotive components.
- Consumer Electronics: chargers, headphones and earphones.
- Mobile Accessories: mobile chargers, earphones, headphones, protective screen glass and small electronic accessories.
- Fresh Fruits: apples, oranges / malta and grapes.
- Cattle Feed: wheat bran, গরুর ভুসি and cattle feed.

Business model: international supplier -> sourcing -> import -> Bangladesh -> supply -> dealer/customer.
Known services: global sourcing, import coordination, product supply connections, dealer enquiries, customer enquiries and business enquiries.
Current operating detail: ${openingStatus.message}

Answer basic questions about the business and the categories above directly and naturally. Do not invent prices, current stock, delivery dates, supplier names, countries of origin, warranties, customs promises, shipping costs, certifications, unsupported specifications, guaranteed availability or legal claims. If a detail is not in this knowledge, say exactly: "I don't have confirmed information about that yet. Please contact Farhad Global Trade directly for the latest details."
Use the confirmed phone, email and address when users ask how to contact or locate the business. Never invent additional contact details. Keep answers concise, professional and helpful. Match the user's language where practical.`
}

function getSafeHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter((entry) => entry && ['user', 'assistant'].includes(entry.role) && typeof entry.content === 'string' && entry.content.trim())
    .slice(-maxHistoryEntries)
    .map((entry) => ({ role: entry.role, content: entry.content.trim().slice(0, maxMessageLength) }))
}

function getReplyContent(completion) {
  const content = completion?.choices?.[0]?.message?.content
  if (typeof content === 'string') return content.trim()
  if (Array.isArray(content)) return content.map((part) => typeof part === 'string' ? part : part?.text || '').join('').trim()
  return ''
}

export function getConfiguredModel() {
  return (globalThis.process.env.GROQ_MODEL || defaultModel).trim() || defaultModel
}

export function getSafeErrorMessage() {
  return safeErrorMessage
}

export function setGroqClientFactory(factory) {
  groqClientFactory = factory
}

export async function handleChatRequest(request, response) {
  const body = request.body || {}
  const trimmedMessage = typeof body.message === 'string' ? body.message.trim() : ''

  if (!trimmedMessage) return response.status(400).json({ success: false, error: 'Message is required.' })
  if (trimmedMessage.length > maxMessageLength) return response.status(413).json({ success: false, error: 'Please keep your message under 2,000 characters.' })
  if (isRateLimited(request)) return response.status(429).json({ success: false, error: 'Please wait a moment before trying again.' })

  if (isLocationQuestion(trimmedMessage)) {
    const result = getLocationResponse()
    return response.json({ success: true, message: result.message, link: result.link })
  }

  if (isContactQuestion(trimmedMessage)) {
    const result = getContactResponse()
    return response.json({ success: true, message: result.message, link: result.link })
  }

  if (isOpeningStatusQuestion(trimmedMessage)) {
    return response.json({ success: true, message: getOpeningStatus().message })
  }

  const apiKey = globalThis.process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured.')
    return response.status(503).json({ success: false, error: 'The AI assistant is not configured. Add GROQ_API_KEY to the server environment and restart the server.' })
  }

  const model = getConfiguredModel()
  const client = groqClientFactory(apiKey)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), groqRequestTimeoutMs)
  const history = getSafeHistory(body.history)

  try {
    const completion = await client.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          { role: 'system', content: getSystemPrompt(getOpeningStatus()) },
          ...history,
          { role: 'user', content: trimmedMessage },
        ],
      }, { signal: controller.signal })

    const message = getReplyContent(completion)
    if (!message) {
      console.error('Groq response did not contain a message.')
      return response.status(502).json({ success: false, error: safeErrorMessage })
    }
    return response.json({ success: true, message })
  } catch (error) {
    if (error?.name === 'AbortError') console.error('Groq request timed out.')
    else console.error('Groq request failed:', error?.status || error?.name || 'unknown error')
    const status = error?.status === 429 ? 429 : error?.name === 'AbortError' ? 504 : 502
    return response.status(status).json({ success: false, error: safeErrorMessage })
  } finally {
    clearTimeout(timeoutId)
  }
}

export { getSafeHistory, getReplyContent }