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
Address: Oriant Tower (7th floor), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh.
Office hours: Saturday–Thursday, 9:30 AM–10:00 PM. Friday: Closed.

Known product categories:
- Automotive: vehicles, car engines and automotive products.
- Engine & Spare Parts: car engines, spare parts and automotive components.
- Consumer Electronics: chargers, headphones and earphones.
- Mobile Accessories: mobile chargers, earphones, headphones, protective screen glass and small electronic accessories.
- Fresh Fruits: apples, oranges / malta and grapes.
- Cattle Feed: wheat bran, গরুর ভুসি and cattle feed.
- Automotive Lubricants & Accessories: engine oil, gear oil, filters and automotive accessories.

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
  console.log('[GROQ] completion object structure check')
  console.log('[GROQ] typeof completion:', typeof completion)
  console.log('[GROQ] has choices:', Boolean(completion?.choices))
  console.log('[GROQ] choices is array:', Array.isArray(completion?.choices))
  
  if (!completion?.choices || !Array.isArray(completion.choices) || completion.choices.length === 0) {
    console.error('[GROQ] No valid choices in completion')
    return ''
  }
  
  const firstChoice = completion.choices[0]
  console.log('[GROQ] first choice exists:', Boolean(firstChoice))
  console.log('[GROQ] first choice keys:', Object.keys(firstChoice || {}))
  console.log('[GROQ] first choice.message exists:', Boolean(firstChoice?.message))
  console.log('[GROQ] first choice.message type:', typeof firstChoice?.message)
  
  if (!firstChoice?.message) {
    console.error('[GROQ] No message in first choice')
    return ''
  }
  
  const message = firstChoice.message
  console.log('[GROQ] message.content type:', typeof message.content)
  console.log('[GROQ] message.content is array:', Array.isArray(message.content))
  console.log('[GROQ] message.content length:', String(message.content || '').length)
  
  const content = message.content
  
  if (typeof content === 'string') {
    console.log('[GROQ] content is string')
    return content.trim()
  }
  if (Array.isArray(content)) {
    console.log('[GROQ] content is array, processing parts')
    const joined = content.map((part) => typeof part === 'string' ? part : part?.text || '').join('').trim()
    console.log('[GROQ] array content joined, length:', joined.length)
    return joined
  }
  
  console.error('[GROQ] content is neither string nor array, type:', typeof content)
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
  const requestStartedAt = Date.now()
  const body = request.body || {}
  const trimmedMessage = typeof body.message === 'string' ? body.message.trim() : ''
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  console.log(`[CHAT-${requestId}] request received`)
  console.log(`[CHAT-${requestId}] message length: ${trimmedMessage.length}`)
  console.log(`[CHAT-${requestId}] history length: ${Array.isArray(body.history) ? body.history.length : 0}`)

  if (!trimmedMessage) {
    console.log(`[CHAT-${requestId}] empty message rejected`)
    return response.status(400).json({ success: false, error: 'Message is required.' })
  }
  if (trimmedMessage.length > maxMessageLength) {
    console.log(`[CHAT-${requestId}] message too long (${trimmedMessage.length} > ${maxMessageLength})`)
    return response.status(413).json({ success: false, error: 'Please keep your message under 2,000 characters.' })
  }
  if (body.history !== undefined && !Array.isArray(body.history)) {
    console.log(`[CHAT-${requestId}] invalid history rejected`)
    return response.status(400).json({ success: false, error: 'History must be an array.' })
  }
  if (isRateLimited(request)) {
    console.log(`[CHAT-${requestId}] rate limited`)
    return response.status(429).json({ success: false, error: 'Please wait a moment before trying again.' })
  }

  if (isLocationQuestion(trimmedMessage)) {
    console.log(`[CHAT-${requestId}] location question detected`)
    const result = getLocationResponse()
    console.log(`[CHAT-${requestId}] location response sent: ${result.message.length} chars`)
    return response.json({ success: true, message: result.message, link: result.link })
  }

  if (isContactQuestion(trimmedMessage)) {
    console.log(`[CHAT-${requestId}] contact question detected`)
    const result = getContactResponse()
    console.log(`[CHAT-${requestId}] contact response sent: ${result.message.length} chars`)
    return response.json({ success: true, message: result.message, link: result.link })
  }

  if (isOpeningStatusQuestion(trimmedMessage)) {
    console.log(`[CHAT-${requestId}] opening status question detected`)
    const openingStatus = getOpeningStatus(trimmedMessage)
    const statusMessage = openingStatus.message
    console.log(`[CHAT-${requestId}] opening status response sent: ${statusMessage.length} chars`)
    return response.json({ success: true, message: statusMessage, link: openingStatus.link })
  }

  const apiKey = globalThis.process.env.GROQ_API_KEY
  console.log(`[CHAT-${requestId}] groq configured: ${Boolean(apiKey)}`)
  if (!apiKey) {
    console.error(`[CHAT-${requestId}] GROQ_API_KEY is not configured`)
    console.log(`[CHAT-${requestId}] duration: ${Date.now() - requestStartedAt}ms`)
    return response.status(503).json({ success: false, error: 'The AI assistant is not configured. Add GROQ_API_KEY to the server environment and restart the server.' })
  }

  const model = getConfiguredModel()
  console.log(`[CHAT-${requestId}] model: ${model}`)
  
  const client = groqClientFactory(apiKey)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), groqRequestTimeoutMs)
  const history = getSafeHistory(body.history)

  console.log(`[CHAT-${requestId}] Groq request starting`)
  console.log(`[CHAT-${requestId}] safe history length: ${history.length}`)

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

    console.log(`[CHAT-${requestId}] Groq response received`)
    console.log(`[CHAT-${requestId}] has choices: ${Boolean(completion?.choices?.length)}`)
    console.log(`[CHAT-${requestId}] choices length: ${completion?.choices?.length || 0}`)
    
    if (completion?.choices?.length) {
      const choice = completion.choices[0]
      console.log(`[CHAT-${requestId}] choice.message exists: ${Boolean(choice?.message)}`)
      if (choice?.message) {
        console.log(`[CHAT-${requestId}] message.content type: ${typeof choice.message.content}`)
        console.log(`[CHAT-${requestId}] message.content length: ${String(choice.message.content || '').length}`)
        console.log(`[CHAT-${requestId}] message.role: ${choice.message.role}`)
      }
    }

    const message = getReplyContent(completion)
    console.log(`[CHAT-${requestId}] parsed message length: ${message.length}`)
    
    if (!message) {
      console.error(`[CHAT-${requestId}] ERROR: Groq response did not contain a valid message`)
      console.error(`[CHAT-${requestId}] full completion object:`, JSON.stringify(completion, null, 2))
      return response.status(502).json({ success: false, error: safeErrorMessage })
    }

    console.log(`[CHAT-${requestId}] success response sent: ${message.length} chars`)
    console.log(`[CHAT-${requestId}] duration: ${Date.now() - requestStartedAt}ms`)
    return response.json({ success: true, message })
  } catch (error) {
    console.error(`[CHAT-${requestId}] ERROR caught`)
    console.error(`[CHAT-${requestId}] error.name: ${error?.name}`)
    console.error(`[CHAT-${requestId}] error.message: ${error?.message}`)
    console.error(`[CHAT-${requestId}] error.status: ${error?.status}`)
    console.error(`[CHAT-${requestId}] error.code: ${error?.code}`)
    console.error(`[CHAT-${requestId}] error type: ${error?.constructor?.name}`)
    
    if (error?.name === 'AbortError') {
      console.error(`[CHAT-${requestId}] Groq request timed out (${groqRequestTimeoutMs}ms)`)
    }
    
    const status = error?.status === 429 ? 429 : error?.name === 'AbortError' ? 504 : 502
    console.log(`[CHAT-${requestId}] error response status: ${status}`)
    console.log(`[CHAT-${requestId}] duration: ${Date.now() - requestStartedAt}ms`)
    return response.status(status).json({ success: false, error: safeErrorMessage })
  } finally {
    clearTimeout(timeoutId)
    console.log(`[CHAT-${requestId}] request completed`)
  }
}

export { getSafeHistory, getReplyContent }