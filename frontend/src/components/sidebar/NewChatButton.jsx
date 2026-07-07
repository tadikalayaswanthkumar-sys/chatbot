import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

function NewChatButton() {
  const navigate = useNavigate()

  return (
    <button className="new-chat-btn" onClick={() => navigate('/')}>
      <Plus size={16} />
      New Chat
    </button>
  )
}

export default NewChatButton
