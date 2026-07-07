import React from 'react'
import ConversationItem from './ConversationItem'

function ConversationList({ conversations, activeId, onDelete, loading }) {
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

export default ConversationList
