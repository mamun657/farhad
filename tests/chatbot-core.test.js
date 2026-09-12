import test from 'node:test'
import assert from 'node:assert/strict'

import { getLocationResponse, getOpeningStatus, getProductAnswer } from '../src/chatbot/businessKnowledge.js'

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(payload) { this.body = payload; return this },
  }
}

test('business knowledge covers the required categories', () => {
  assert.match(getProductAnswer('Do you supply automotive engines?'), /vehicles|engines|spare parts/i)
  assert.match(getProductAnswer('What electronics do you have?'), /chargers|headphones|earphones/i)
  assert.match(getProductAnswer('Do you supply fresh fruit?'), /apples|oranges|grapes/i)
  assert.match(getProductAnswer('Do you supply cattle feed?'), /wheat bran|cattle feed/i)
  assert.match(getProductAnswer('Do you have mobile accessories?'), /chargers|protective screen glass/i)
})

test('basic business questions have knowledge available for the AI prompt', () => {
  assert.match(getOpeningStatus().message, /not listed|latest availability/i)
  assert.match(getLocationResponse().message, /Bangladesh|global sourcing/i)
})

test('chat validation returns the documented error schema', async () => {
  const { handleChatRequest } = await import('../src/chatbot/chatHandler.js')
  const response = createResponse()
  await handleChatRequest({ body: {} }, response)
  assert.equal(response.statusCode, 400)
  assert.deepEqual(response.body, { success: false, error: 'Message is required.' })
})

test('chat rejects oversized input before contacting Groq', async () => {
  const { handleChatRequest } = await import('../src/chatbot/chatHandler.js')
  const response = createResponse()
  await handleChatRequest({ body: { message: 'x'.repeat(2001) } }, response)
  assert.equal(response.statusCode, 413)
  assert.match(response.body.error, /2,000 characters/i)
})

test('chat returns a safe response when the server key is missing', async () => {
  const { handleChatRequest } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  delete process.env.GROQ_API_KEY
  const response = createResponse()
  try {
    await handleChatRequest({ body: { message: 'Which services do you provide?' } }, response)
  } finally {
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
  }
  assert.equal(response.statusCode, 503)
  assert.match(response.body.error, /GROQ_API_KEY|configured/i)
  assert.doesNotMatch(response.body.error, /gsk_|token value|stack trace/i)
})

test('chat sends bounded history and parses a valid Groq response', async () => {
  const { handleChatRequest, setGroqClientFactory } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  const previousModel = process.env.GROQ_MODEL
  let receivedRequest
  process.env.GROQ_API_KEY = 'test-only-placeholder'
  delete process.env.GROQ_MODEL
  setGroqClientFactory(() => ({
    chat: { completions: { create: async (request) => {
      receivedRequest = request
      return { choices: [{ message: { content: 'Farhad Global Trade provides import, sourcing and supply services.' } }] }
    } } },
  }))
  const response = createResponse()
  try {
    await handleChatRequest({ body: { message: 'Which services do you provide?', history: Array.from({ length: 15 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: `message ${index}` })) } }, response)
  } finally {
    setGroqClientFactory(() => ({ chat: { completions: { create: async () => ({ choices: [] }) } } }))
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
    if (previousModel === undefined) delete process.env.GROQ_MODEL
    else process.env.GROQ_MODEL = previousModel
  }
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.body, { success: true, message: 'Farhad Global Trade provides import, sourcing and supply services.' })
  assert.equal(receivedRequest.messages.length, 14)
  assert.equal(receivedRequest.model, 'openai/gpt-oss-20b')
})

test('chat handles malformed Groq responses safely', async () => {
  const { handleChatRequest, setGroqClientFactory } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  const previousModel = process.env.GROQ_MODEL
  process.env.GROQ_API_KEY = 'test-only-placeholder'
  process.env.GROQ_MODEL = 'test-model'
  setGroqClientFactory(() => ({ chat: { completions: { create: async () => ({ choices: [{}] }) } } }))
  const response = createResponse()
  try {
    await handleChatRequest({ body: { message: 'Tell me about an unlisted product.' } }, response)
  } finally {
    setGroqClientFactory(() => ({ chat: { completions: { create: async () => ({ choices: [] }) } } }))
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
    if (previousModel === undefined) delete process.env.GROQ_MODEL
    else process.env.GROQ_MODEL = previousModel
  }
  assert.equal(response.statusCode, 502)
  assert.match(response.body.error, /trouble connecting/i)
})

test('chat converts Groq failures into safe JSON', async () => {
  const { handleChatRequest, setGroqClientFactory } = await import('../src/chatbot/chatHandler.js')
  const previousKey = process.env.GROQ_API_KEY
  const previousModel = process.env.GROQ_MODEL
  const providerError = new Error('provider failure')
  providerError.status = 500
  process.env.GROQ_API_KEY = 'test-only-placeholder'
  process.env.GROQ_MODEL = 'test-model'
  setGroqClientFactory(() => ({ chat: { completions: { create: async () => { throw providerError } } } }))
  const response = createResponse()
  try {
    await handleChatRequest({ body: { message: 'Tell me about an unlisted product.' } }, response)
  } finally {
    setGroqClientFactory(() => ({ chat: { completions: { create: async () => ({ choices: [] }) } } }))
    if (previousKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = previousKey
    if (previousModel === undefined) delete process.env.GROQ_MODEL
    else process.env.GROQ_MODEL = previousModel
  }
  assert.equal(response.statusCode, 502)
  assert.match(response.body.error, /trouble connecting/i)
  assert.doesNotMatch(response.body.error, /provider failure/i)
})
