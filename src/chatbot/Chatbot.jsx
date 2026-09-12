import { useEffect, useRef, useState } from 'react'
import { businessKnowledge } from './businessKnowledge'
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
}

const navigationTargets = {
  home: businessKnowledge.sections.Home,
  about: businessKnowledge.sections.About,
  products: businessKnowledge.sections.Products,
  services: businessKnowledge.sections.Services,
  contact: businessKnowledge.sections.Contact,
  location: businessKnowledge.sections.Location,
}

function getNavigationAction(question, answer) {
  const text = `${question} ${answer}`.toLowerCase()

  if (text.includes('address') || text.includes('located') || text.includes('location') || text.includes('visit')) return { label: navigationLabels.location, href: navigationTargets.location }
  if (text.includes('automotive') || text.includes('engine') || text.includes('spare')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('electronics') || text.includes('charger') || text.includes('earphone') || text.includes('mobile')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('fruit') || text.includes('grape') || text.includes('apple') || text.includes('orange')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('feed') || text.includes('cattle') || text.includes('livestock')) return { label: navigationLabels.products, href: navigationTargets.products }
  if (text.includes('contact') || text.includes('enquiry') || text.includes('dealer') || text.includes('phone') || text.includes('email')) return { label: navigationLabels.contact, href: navigationTargets.contact }
  if (text.includes('import') || text.includes('supply') || text.includes('source')) return { label: navigationLabels.services, href: navigationTargets.services }
  return { label: navigationLabels.home, href: navigationTargets.home }
}

function cleanAssistantContent(content) {
  return { visibleContent: content.trim(), embeddedUrl: null }
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: 'Hello! Welcome to Farhad Global Trade. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messageIdRef = useRef(0)
  const apiBaseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '')).trim().replace(/\/+$/, '')
  const requestTimeoutMs = 14_000

  // Validate API URL configuration in production
  const getApiUrl = () => {
    const url = apiBaseUrl || (typeof window !== 'undefined' && window.location.origin ? window.location.origin : '')
    return url ? `${url}/api/chat` : null
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

    const chatApiUrl = getApiUrl()
    if (!chatApiUrl) {
      setMessages((current) => [...current, {
        id: `${requestId}-error`,
        role: 'assistant',
        content: 'The chat service is not properly configured. Please reload the page and try again.',
      }])
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmedQuestion,
          history: [...messages, userMessage].slice(-12).map(({ role, content }) => ({ role, content })),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data.error === 'string' && data.error.trim() ? data.error : 'Sorry, I’m having trouble connecting right now. Please try again in a moment.')

      const answer = data.message
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('The assistant returned an invalid response.')
      const { visibleContent } = cleanAssistantContent(answer)
      setMessages((current) => [...current, {
        id: `${requestId}-assistant`,
        role: 'assistant',
        content: visibleContent,
        action: getNavigationAction(trimmedQuestion, visibleContent),
      }])
    } catch (error) {
      setMessages((current) => [...current, {
        id: `${requestId}-error`,
        role: 'assistant',
        content: error?.name === 'AbortError'
          ? 'Sorry, I’m having trouble connecting right now. Please try again in a moment.'
          : (error.message || 'Sorry, I’m having trouble connecting right now. Please try again in a moment.'),
      }])
    } finally {
      window.clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
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
                    <a className="chatbot-action" href={message.action.href} target={message.action.external ? '_blank' : undefined} rel={message.action.external ? 'noopener noreferrer' : undefined} onClick={() => setIsOpen(false)}>{message.action.label} <span aria-hidden="true">&rarr;</span></a>
                  )}
                </div>
              </div>
            ))}
            {isLoading && <div className="chatbot-message-row assistant"><div className="chatbot-message chatbot-thinking"><span /> <span /> <span /></div></div>}
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
