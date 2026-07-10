import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RefreshCw, Plus, MessageSquare, Trash2, User, Bot, SendHorizontal, AlertCircle } from 'lucide-react'
import api from './api'

// ==========================================
// 1. Common Components
// ==========================================

export function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      {text && <span className="loader-text">{text}</span>}
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <AlertCircle className="error-icon" />
      <h4 className="error-title">An Error Occurred</h4>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

// ==========================================
// 2. Navigation / Navbar Component
// ==========================================

export function Navbar({ hideBrand = false }) {
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    online: false,
    aiFallback: true
  })

  const checkHealth = async () => {
    try {
      setHealthStatus(prev => ({ ...prev, loading: true }))
      const response = await api.get('/health')
      setHealthStatus({
        loading: false,
        online: true,
        aiFallback: response.data.ai_fallback
      })
    } catch {
      setHealthStatus({ loading: false, online: false, aiFallback: true })
    }
  }

  useEffect(() => { checkHealth() }, [])

  return (
    <nav className="navbar">
      {!hideBrand ? (
        <Link to="/" className="nav-brand">
          <span className="nav-logo">💬</span>
          <span className="nav-title">DeepMind Chat</span>
        </Link>
      ) : (
        <div />
      )}

      <div className="nav-status" onClick={checkHealth} title="Click to refresh status">
        {healthStatus.loading ? (
          <>
            <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Checking...</span>
          </>
        ) : healthStatus.online ? (
          <>
            <span className={`status-dot ${healthStatus.aiFallback ? 'simulated' : ''}`}></span>
            <span>{healthStatus.aiFallback ? 'Simulation Mode' : 'Groq Live'}</span>
          </>
        ) : (
          <>
            <span className="status-dot" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 6px #ef4444' }}></span>
            <span>Offline</span>
          </>
        )}
      </div>
    </nav>
  )
}

// ==========================================
// 3. Sidebar Components
// ==========================================

export function NewChatButton() {
  const navigate = useNavigate()
  return (
    <button className="new-chat-btn" onClick={() => navigate('/')}>
      <span className="new-chat-icon">
        <Plus size={15} />
      </span>
      New chat
    </button>
  )
}

export function ConversationItem({ conversation, isActive, onDelete }) {
  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete "${conversation.title}"?`)) {
      onDelete(conversation.id)
    }
  }

  return (
    <Link
      to={`/chat/${conversation.id}`}
      className={`conversation-item ${isActive ? 'active' : ''}`}
    >
      <div className="conversation-info">
        <MessageSquare size={16} className="conversation-icon" />
        <span className="conversation-title" title={conversation.title}>
          {conversation.title}
        </span>
      </div>
      <button 
        className="delete-chat-btn" 
        onClick={handleDelete}
        title="Delete conversation"
      >
        <Trash2 size={14} />
      </button>
    </Link>
  )
}

export function ConversationList({ conversations, activeId, onDelete, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Loading chats...
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No conversations yet
      </div>
    )
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeId}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export function Sidebar({ conversations, activeId, onDelete, loading }) {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none' }}>
        <span className="sidebar-brand-logo">💬</span>
        <span className="sidebar-brand-name">DeepMind Chat</span>
      </Link>

      <div className="sidebar-header">
        <NewChatButton />
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section-title">Recents</div>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onDelete={onDelete}
          loading={loading}
        />
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">YK</div>
          <div className="user-info">
            <span className="user-name">Yaswanth Kumar</span>
            <span className="user-role">Personal workspace</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ==========================================
// 4. Chat Components
// ==========================================

export function TypingIndicator() {
  return (
    <div className="typing-indicator-row">
      <div className="message-avatar" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--accent-color)' }}>
        <Bot size={18} />
      </div>
      <div className="typing-bubble">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  )
}

export function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  const renderMessageContent = (text) => {
    if (!text) return ''
    const regex = /(```[\s\S]*?```)/g
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3).trim()
        const firstNewLine = codeContent.indexOf('\n')
        
        let language = 'code'
        let code = codeContent
        
        if (firstNewLine !== -1) {
          const possibleLang = codeContent.substring(0, firstNewLine).trim()
          if (possibleLang && !possibleLang.includes(' ') && possibleLang.length < 15) {
            language = possibleLang
            code = codeContent.substring(firstNewLine + 1)
          }
        }

        return (
          <div key={index} className="markdown-code-container">
            <div className="markdown-code-header">
              <span>{language.toUpperCase()}</span>
            </div>
            <pre className="markdown-code-block">
              <code>{code}</code>
            </pre>
          </div>
        )
      }

      return (
        <span key={index} className="markdown-text">
          {part.split('\n\n').map((para, pIdx) => (
            <p key={pIdx} style={{ marginBottom: pIdx < part.split('\n\n').length - 1 ? '12px' : '0' }}>
              {para.split('\n').map((line, lIdx) => (
                <React.Fragment key={lIdx}>
                  {line}
                  {lIdx < para.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          ))}
        </span>
      )
    })
  }

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className="message-bubble">
        <div className="message-content">
          {renderMessageContent(message.content)}
        </div>
        <span className="message-time">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}

export function ChatWindow({ messages, sending, messagesEndRef }) {
  return (
    <div className="chat-messages-container">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      
      {sending && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  )
}

export function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input-field"
        placeholder={disabled ? 'Waiting for assistant response...' : 'Type a message...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus
      />
      <button 
        type="submit" 
        className="chat-send-btn" 
        disabled={!text.trim() || disabled}
      >
        <SendHorizontal size={18} />
      </button>
    </form>
  )
}
