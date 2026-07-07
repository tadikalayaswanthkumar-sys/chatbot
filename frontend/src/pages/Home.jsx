import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar'
import Navbar from '../components/navbar/Navbar'
import EmptyChat from '../components/chat/EmptyChat'
import MessageInput from '../components/chat/MessageInput'
import ErrorMessage from '../components/common/ErrorMessage'
import { chatApi } from '../api/chatApi'
import { conversationApi } from '../api/conversationApi'

function Home() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  // Load conversations for sidebar
  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await conversationApi.getConversations()
      setConversations(data)
      setError(null)
    } catch (err) {
      setError('Could not load chats. Make sure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // Start new conversation by sending first message
  const handleSendMessage = async (text) => {
    if (!text.trim()) return
    try {
      setSending(true)
      setError(null)
      const result = await chatApi.sendMessage(text, null)
      // Redirect to the newly created chat ID
      navigate(`/chat/${result.user_message.conversation_id}`, {
        state: { initialMessages: [result.user_message, result.ai_message] }
      })
    } catch (err) {
      setError('Failed to send message. Please try again.')
      setSending(false)
    }
  }

  const handleDeleteConversation = async (id) => {
    try {
      await conversationApi.deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError('Failed to delete conversation.')
    }
  }

  return (
    <div className="page-container">
      <Sidebar 
        conversations={conversations} 
        activeId={null} 
        onDelete={handleDeleteConversation}
        loading={loading}
      />
      <div className="main-content">
        <Navbar />
        {error && <ErrorMessage message={error} onRetry={fetchConversations} />}
        <EmptyChat onSelectSuggestion={handleSendMessage} />
        <div className="chat-input-wrapper">
          <MessageInput onSend={handleSendMessage} disabled={sending} />
        </div>
      </div>
    </div>
  )
}

export default Home
