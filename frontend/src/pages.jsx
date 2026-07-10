import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { SendHorizontal, Code, HelpCircle, Database, FileText, Home as HomeIcon } from 'lucide-react'
import { chatApi, conversationApi } from './api'
import { Sidebar, Navbar, ErrorMessage, Loader, ChatWindow, MessageInput } from './components'

const suggestions = [
  { icon: <Code size={15} />, label: 'Write code', prompt: 'Can you show me a simple example of a React custom hook and a FastAPI route?' },
  { icon: <HelpCircle size={15} />, label: 'Explain concepts', prompt: 'Explain what database normalization is and why it is important.' },
  { icon: <Database size={15} />, label: 'Draft a SQL query', prompt: 'Write a SQL query example that joins two tables and filters by a date range.' },
  { icon: <FileText size={15} />, label: 'Help me write', prompt: 'Draft a short, professional welcome email template for new users of a productivity app.' },
]

// ==========================================
// 1. Home Page View
// ==========================================

export function Home() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await conversationApi.getConversations()
      setConversations(data)
      setError(null)
    } catch (err) {
      setError('Could not load chats. Make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConversations() }, [])

  const handleSend = async (messageText) => {
    const msg = (messageText || text).trim()
    if (!msg) return
    try {
      setSending(true)
      setError(null)
      const result = await chatApi.sendMessage(msg, null)
      navigate(`/chat/${result.user_message.conversation_id}`, {
        state: { initialMessages: [result.user_message, result.ai_message] }
      })
    } catch (err) {
      setError('Failed to send message. Please try again.')
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDeleteConversation = async (id) => {
    try {
      await conversationApi.deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
    } catch {
      setError('Failed to delete conversation.')
    }
  }

  return (
    <div className="page-container">
      <Sidebar
        conversations={conversations}
        activeId={null}
        onDelete={handleDeleteConversation}
        loading={loading}
      />
      <div className="main-content">
        <Navbar />
        {error && <ErrorMessage message={error} onRetry={fetchConversations} />}

        <div className="home-centered">
          <h1 className="home-title">What's on your mind today?</h1>

          <div className="home-input-wrapper">
            <div className="home-input-form">
              <input
                type="text"
                className="chat-input-field"
                placeholder={sending ? 'Sending...' : 'Ask anything...'}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                autoFocus
              />
              <button
                className="chat-send-btn"
                onClick={() => handleSend()}
                disabled={!text.trim() || sending}
              >
                <SendHorizontal size={17} />
              </button>
            </div>
          </div>

          <div className="home-suggestions">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="suggestion-pill"
                onClick={() => handleSend(s.prompt)}
                disabled={sending}
              >
                <span className="suggestion-pill-icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. Chat Transcript View
// ==========================================

export function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [sidebarLoading, setSidebarLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      setSidebarLoading(true)
      const data = await conversationApi.getConversations()
      setConversations(data)
    } catch (err) {
      console.error('Failed to load conversations sidebar', err)
    } finally {
      setSidebarLoading(false)
    }
  }

  const fetchConversationDetails = async (convId) => {
    try {
      setChatLoading(true)
      setError(null)
      const data = await conversationApi.getConversationDetails(convId)
      setMessages(data.messages || [])
    } catch (err) {
      setError('Could not retrieve conversation logs. Try refreshing.')
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
    
    if (location.state?.initialMessages) {
      setMessages(location.state.initialMessages)
      setChatLoading(false)
      window.history.replaceState({}, document.title)
    } else {
      fetchConversationDetails(id)
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, sending])

  const handleSendMessage = async (text) => {
    if (!text.trim()) return
    
    const tempUserMsg = {
      id: 'temp-user-id',
      conversation_id: id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, tempUserMsg])
    setSending(true)
    setError(null)

    try {
      const result = await chatApi.sendMessage(text, id)
      setMessages(prev => 
        prev.filter(m => m.id !== 'temp-user-id').concat([result.user_message, result.ai_message])
      )
      const data = await conversationApi.getConversations()
      setConversations(data)
    } catch (err) {
      setError('Failed to send message. Please check connection and try again.')
      setMessages(prev => prev.filter(m => m.id !== 'temp-user-id'))
    } finally {
      setSending(false)
    }
  }

  const handleDeleteConversation = async (convId) => {
    try {
      await conversationApi.deleteConversation(convId)
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (convId === id) {
        navigate('/')
      }
    } catch (err) {
      setError('Failed to delete conversation.')
    }
  }

  return (
    <div className="page-container">
      <Sidebar 
        conversations={conversations} 
        activeId={id} 
        onDelete={handleDeleteConversation}
        loading={sidebarLoading}
      />
      <div className="main-content">
        <Navbar hideBrand />
        {error && <ErrorMessage message={error} onRetry={() => fetchConversationDetails(id)} />}
        
        {chatLoading ? (
          <Loader text="Retrieving conversation transcript..." />
        ) : (
          <ChatWindow 
            messages={messages} 
            sending={sending} 
            messagesEndRef={messagesEndRef}
          />
        )}
        
        <div className="chat-input-wrapper">
          <MessageInput onSend={handleSendMessage} disabled={sending || chatLoading} />
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. NotFound Error View
// ==========================================

export function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-code">404</div>
      <h2 className="notfound-title">Page Not Found</h2>
      <p className="notfound-text">The conversation or workspace you are looking for does not exist.</p>
      <Link to="/" className="notfound-link">
        <HomeIcon size={18} />
        Back to Home Workspace
      </Link>
    </div>
  )
}
