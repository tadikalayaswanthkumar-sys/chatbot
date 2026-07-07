import React from 'react'
import NewChatButton from './NewChatButton'
import ConversationList from './ConversationList'

function Sidebar({ conversations, activeId, onDelete, loading }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NewChatButton />
      </div>
      
      <div className="sidebar-content">
        <h3 className="sidebar-section-title">Conversations</h3>
        <ConversationList 
          conversations={conversations} 
          activeId={activeId} 
          onDelete={onDelete}
          loading={loading}
        />
      </div>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-role">Developer Workspace</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
