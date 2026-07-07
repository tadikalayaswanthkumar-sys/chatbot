import React from 'react'
import { User, Bot } from 'lucide-react'

function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  // Format message timestamps
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  // A lightweight parser for markdown code blocks and paragraphs
  const renderMessageContent = (text) => {
    if (!text) return ''
    
    // Split content by markdown code blocks: ```lang ... ```
    const regex = /(```[\s\S]*?```)/g
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const codeContent = part.slice(3, -3).trim()
        const firstNewLine = codeContent.indexOf('\n')
        
        let language = 'code'
        let code = codeContent
        
        if (firstNewLine !== -1) {
          const possibleLang = codeContent.substring(0, firstNewLine).trim()
          // Check if it is a standard short word (no spaces, no special chars)
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

      // Convert double newlines to paragraphs and single newlines to br
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

export default ChatMessage
