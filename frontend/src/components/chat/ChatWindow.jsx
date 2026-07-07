import React from 'react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

function ChatWindow({ messages, sending, messagesEndRef }) {
  return (
    <div className="chat-messages-container">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      
      {sending && <TypingIndicator />}
      
      {/* Anchor element for scrolling to bottom */}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatWindow
