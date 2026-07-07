import React from 'react'
import { Bot } from 'lucide-react'

function TypingIndicator() {
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

export default TypingIndicator
