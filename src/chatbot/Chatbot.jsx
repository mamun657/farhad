import { useEffect, useRef, useState } from 'react'
import { businessKnowledge, getOpeningStatus, isOpeningStatusQuestion } from './businessKnowledge'
import './chatbot.css'

const quickQuestions = [
  'What products do you import?',
  'Which services do you provide?',
  'Do you supply automotive parts?',
  'Do you import fresh fruits?',
  'Do you supply cattle feed?',
  'How can I contact you?',
]

const navigationLabels = {
  home: 'Home',
  about: 'About',
  products: 'Products',
  services: 'Services',
  contact: 'Contact',
  location: 'View Location',
  officeHours: 'View Office Hours',
}

const navigationTargets = {
  home: businessKnowledge.sections.Home,
  about: businessKnowledge.sections.About,
  products: businessKnowledge.sections.Products,
  services: businessKnowledge.sections.Services,
  contact: businessKnowledge.sections.Contact,
  location: businessKnowledge.sections.Location,
  officeHours: businessKnowledge.sections.OfficeHours,
}

const productionApiUrl = 'https://farhadglobaltrade.onrender.com'

function getNavigationAction(question, answer) {
  const text = `${question} ${answer}`.toLowerCase()
  if (isOpeningStatusQuestion(question)) return { label: navigationLabels.officeHours, href: navigationTargets.officeHours }

  if (text.includes('address') || text.includes('located') || text.includes('location') || text.includes('visit')) return { label: navigationLabels.location, href: navigationTargets.location }
  if (text.includes('automotive') || text.includes('engine') || text.includes('spare')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('electronics') || text.includes('charger') || text.includes('earphone') || text.includes('mobile')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('fruit') || text.includes('grape') || text.includes('apple') || text.includes('orange')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('feed') || text.includes('cattle') || text.includes('livestock')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('contact') || text.includes('enquiry') || text.includes('dealer') || text.includes('phone') || text.includes('email')) return { label: navigationLabels.contact, href: navigationTargets.contact }
  if (text.includes('import') || text.includes('supply') || text.includes('source')) return { label: navigationLabels.services, href: navigationTargets.services }
  return { label: navigationLabels.home, href: navigationTargets.home }
}

function formatAssistantContent(content) {
  return String(content || '')
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```[^\n]*\n?|```$/g, ''))
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cleanAssistantContent(content) {
  return { visibleContent: formatAssistantContent(content), embeddedUrl: null }
}

function getChatErrorMessage(error) {
  if (error?.name === 'AbortError') {
    return 'The assistant is taking longer than usual to respond. Please try again in a moment.'
  }
  if (error instanceof TypeError) {
    return 'The assistant is temporarily unavailable. Please try again or contact Farhad Global Trade directly.'
  }
  return error?.message || 'The assistant is temporarily unavailable. Please try again or contact Farhad Global Trade directly.'
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: 'Hello! Welcome to Farhad Global Trade. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messageIdRef = useRef(0)
  const apiBaseUrl = (
    import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : productionApiUrl)
  ).trim().replace(/\/+$/, '')
  const requestTimeoutMs = 30_000

  const getApiUrl = () => {
    if (!apiBaseUrl) {
      console.error('[Chatbot] Missing VITE_API_URL in the production build; chat requests cannot be sent.')
      return null
    }
    return `${apiBaseUrl}/api/chat`
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isLoading])

  useEffect(() => {
    if (!isOpen) return undefined
    inputRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const sendMessage = async (question) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) return

    const requestId = `${Date.now()}-${messageIdRef.current + 1}`
    messageIdRef.current += 1
    const userMessage = { id: `${requestId}-user`, role: 'user', content: trimmedQuestion }
    setMessages((current) => [...current, userMessage])
    setInput('')
    setShowQuickReplies(false)
    setIsLoading(true)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs)
    const connectingTimeoutId = window.setTimeout(() => setIsConnecting(true), 2000)

    const chatApiUrl = getApiUrl()
    if (!chatApiUrl) {
      setMessages((current) => [...current, {
        id: `${requestId}-error`,
        role: 'assistant',
        content: 'The assistant is temporarily unavailable. Please try again or contact Farhad Global Trade directly.',
      }])
      setIsLoading(false)
      window.clearTimeout(connectingTimeoutId)
      return
    }

    try {
      console.log('[Chatbot] API URL:', chatApiUrl)
      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmedQuestion,
          history: [...messages, userMessage].slice(-12).map(({ role, content }) => ({ role, content })),
        }),
      })

      console.log('[Chatbot] Request status:', response.status)
      console.log('[Chatbot] Response content type:', response.headers.get('content-type'))

      let data
      let rawText = ''
      try {
        rawText = await response.clone().text()
        console.log('[Chatbot] Response:', rawText.slice(0, 500))
        data = JSON.parse(rawText)
      } catch (parseError) {
        console.error('[Chatbot] Error: invalid JSON response', parseError)
        throw new Error('The chat service returned an invalid response.')
      }

      console.log('[Chatbot] Parsed response:', data)

      if (!response.ok) {
        const errorMessage = typeof data.error === 'string' && data.error.trim() ? data.error : `HTTP ${response.status}: ${response.statusText}`
        console.error('[Chatbot] Error:', `HTTP ${response.status}`, errorMessage)
        throw new Error(errorMessage)
      }

      if (data.success !== true) {
        const errorMessage = typeof data.error === 'string' && data.error.trim() ? data.error : 'Backend returned success: false'
        console.error('[Chatbot] Error:', errorMessage)
        throw new Error(errorMessage)
      }

      const answer = data.message

      if (typeof answer !== 'string') {
        console.error('[Chatbot] Error: response message is not a string', data)
        throw new Error('The chat service returned no assistant message.')
      }

      if (!answer.trim()) {
        console.error('[Chatbot] Error: response message is empty')
        throw new Error('The chat service returned no assistant message.')
      }
      const confirmedAnswer = isOpeningStatusQuestion(trimmedQuestion)
        ? getOpeningStatus(trimmedQuestion).message
        : answer
      const { visibleContent } = cleanAssistantContent(confirmedAnswer)
      setMessages((current) => [...current, {
        id: `${requestId}-assistant`,
        role: 'assistant',
        content: visibleContent,
        action: getNavigationAction(trimmedQuestion, visibleContent),
      }])
    } catch (error) {
      console.error('[Chatbot] Error:', error)
      setMessages((current) => [...current, {
        id: `${requestId}-error`,
        role: 'assistant',
        content: getChatErrorMessage(error),
      }])
    } finally {
      window.clearTimeout(timeoutId)
      window.clearTimeout(connectingTimeoutId)
      setIsConnecting(false)
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  const handleNavigationActionClick = (event, action) => {
    if (action.href?.startsWith('#')) {
      const target = document.querySelector(action.href)
      if (target) {
        event.preventDefault()
        const targetTop = target.getBoundingClientRect().top + window.scrollY - 118
        window.scrollTo({ top: targetTop, behavior: 'smooth' })
        window.history.pushState(null, '', action.href)
      }
    }
    setIsOpen(false)
  }

  return (
    <div className="chatbot-root">
      {isOpen && (
        <section className="chatbot-window" aria-label="Farhad Global Trade assistant chat" aria-live="polite">
          <header className="chatbot-header">
            <div>
              <p className="chatbot-eyebrow">FARHAD GLOBAL TRADE</p>
              <h2>Business Assistant</h2>
              <span>Online / Business Assistant</span>
            </div>
            <button type="button" className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">&times;</button>
          </header>

          <div className="chatbot-messages" role="log" aria-label="Conversation">
            {messages.map((message) => (
              <div className={`chatbot-message-row ${message.role}`} key={message.id}>
                <div className="chatbot-message">
                  {message.content}
                  {message.action && (
                    <a className="chatbot-action" href={message.action.href} target={message.action.external ? '_blank' : undefined} rel={message.action.external ? 'noopener noreferrer' : undefined} onClick={(event) => handleNavigationActionClick(event, message.action)}>{message.action.label} <span aria-hidden="true">&rarr;</span></a>
                  )}
                </div>
              </div>
            ))}
            {isLoading && <div className="chatbot-message-row assistant"><div className="chatbot-message chatbot-thinking">{isConnecting && <span className="chatbot-connecting">Connecting to the business assistant...</span>}<span /> <span /> <span /></div></div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-suggestions">
            <div className={`chatbot-quick-questions ${showQuickReplies ? 'is-visible' : ''}`} aria-label="Suggested questions" aria-hidden={!showQuickReplies}>
              {quickQuestions.map((question) => (
                <button type="button" key={question} onClick={() => sendMessage(question)} tabIndex={showQuickReplies ? 0 : -1} disabled={!showQuickReplies}>{question}</button>
              ))}
            </div>
            <button type="button" className="chatbot-hint-toggle" onClick={() => setShowQuickReplies((current) => !current)} aria-label={showQuickReplies ? 'Hide suggested questions' : 'Show suggested questions'} aria-expanded={showQuickReplies}>
              <span aria-hidden="true">✦</span>
            </button>
          </div>

          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about products, import, supply or enquiries..."
              aria-label="Ask Farhad Global Trade assistant"
              disabled={isLoading}
            />
            <button type="submit" aria-label="Send message" disabled={isLoading || !input.trim()}>&rarr;</button>
          </form>
        </section>
      )}
      <button type="button" className="chatbot-trigger" onClick={() => setIsOpen((current) => !current)} aria-label={isOpen ? 'Close business assistant' : 'Open business assistant'} aria-expanded={isOpen} title={isOpen ? 'Close business assistant' : 'Open business assistant'}>
        <svg className="chatbot-trigger-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 22.5V10.2A2.2 2.2 0 0 1 9.2 8h13.6A2.2 2.2 0 0 1 25 10.2v8.6a2.2 2.2 0 0 1-2.2 2.2H12l-5 4v-2.5Z" />
          <path d="M11 13h10M11 17h7" />
        </svg>
      </button>
    </div>
  )
}

export default Chatbot
