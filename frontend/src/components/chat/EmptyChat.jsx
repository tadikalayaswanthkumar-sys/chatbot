import React from 'react'
import { Sparkles, Code, FileText, Database, HelpCircle } from 'lucide-react'

function EmptyChat({ onSelectSuggestion }) {
  const suggestions = [
    {
      icon: <Code size={18} />,
      title: 'Write code',
      desc: 'Show me an example of a React custom hook or FastAPI route.',
      prompt: 'Can you show me a simple example of a React custom hook and a FastAPI route?'
    },
    {
      icon: <HelpCircle size={18} />,
      title: 'Explain concepts',
      desc: 'What is database normalization and why is it important?',
      prompt: 'Explain what database normalization is and why it is important.'
    },
    {
      icon: <Database size={18} />,
      title: 'Draft a database query',
      desc: 'How do I join two tables and filter results in SQL?',
      prompt: 'Write a SQL query example that joins two tables and filters by a date range.'
    },
    {
      icon: <FileText size={18} />,
      title: 'Help me write',
      desc: 'Draft a short welcome email template for a new app.',
      prompt: 'Draft a short, professional welcome email template for new users of a productivity app.'
    }
  ]

  return (
    <div className="empty-chat">
      <div className="empty-chat-icon-container">
        <Sparkles size={36} />
      </div>
      <h1 className="empty-chat-title">Welcome to DeepMind Chat</h1>
      <p className="empty-chat-subtitle">
        An interactive workspace powered by AI. Ask questions, generate code snippets, 
        or start brainstorming ideas. Select a suggestion card below or type in the input box.
      </p>
      
      <div className="empty-chat-suggestions">
        {suggestions.map((item, index) => (
          <div 
            key={index} 
            className="suggestion-card" 
            onClick={() => onSelectSuggestion(item.prompt)}
          >
            <div className="suggestion-header">
              <span className="suggestion-icon">{item.icon}</span>
              <span>{item.title}</span>
            </div>
            <div className="suggestion-text">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmptyChat
