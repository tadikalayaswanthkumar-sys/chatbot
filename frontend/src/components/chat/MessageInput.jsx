import React, { useState } from 'react'
import { SendHorizontal } from 'lucide-react'

function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e) => {
    // Submit on Enter keypress (without Shift key)
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

export default MessageInput
