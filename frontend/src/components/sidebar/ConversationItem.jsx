import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Trash2 } from 'lucide-react'

function ConversationItem({ conversation, isActive, onDelete }) {
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

export default ConversationItem
