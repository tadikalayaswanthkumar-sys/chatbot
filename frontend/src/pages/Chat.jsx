import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/sidebar/Sidebar'
import Navbar from '../components/navbar/Navbar'
import ChatWindow from '../components/chat/ChatWindow'
import MessageInput from '../components/chat/MessageInput'
import ErrorMessage from '../components/common/ErrorMessage'
import Loader from '../components/common/Loader'
import { chatApi } from '../api/chatApi'
import { conversationApi } from '../api/conversationApi'

function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [sidebarLoading, setSidebarLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load all conversations for sidebar
  const fetchConversations = async () => {
    try {
      setSidebarLoading(true)
      const data = await conversationApi.getConversations()
      setConversations(data)
    } catch (err) {
      console.error('Failed to load conversations sidebar', err)
    } finally {
      setSidebarLoading(false)
    }
  }

  // Load message logs for this specific conversation
  const fetchConversationDetails = async (convId) => {
    try {
      setChatLoading(true)
      setError(null)
      const data = await conversationApi.getConversationDetails(convId)
      setMessages(data.messages || [])
    } catch (err) {
      setError('Could not retrieve conversation logs. Try refreshing.')
    } finally {
      setChatLoading(false)
    }
  }

  // Reload chats lists and sync conversation log
  useEffect(() => {
    fetchConversations()
    
    // Check if initialMessages were passed via state navigation
    if (location.state?.initialMessages) {
      setMessages(location.state.initialMessages)
      setChatLoading(false)
      // Clear location state to prevent reload issues
      window.history.replaceState({}, document.title)
    } else {
      fetchConversationDetails(id)
    }
  }, [id])

  // Scroll on message change
  useEffect(() => {
    scrollToBottom()
  }, [messages, sending])

  const handleSendMessage = async (text) => {
    if (!text.trim()) return
    
    // Optimistically add user message to list
    const tempUserMsg = {
      id: 'temp-user-id',
      conversation_id: id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, tempUserMsg])
    setSending(true)
    setError(null)

    try {
      const result = await chatApi.sendMessage(text, id)
      
      // Update with exact saved message from database
      setMessages(prev => 
        prev.filter(m => m.id !== 'temp-user-id').concat([result.user_message, result.ai_message])
      )
      
      // Refresh sidebar list to update timestamps/titles
      const data = await conversationApi.getConversations()
      setConversations(data)
    } catch (err) {
      setError('Failed to send message. Please check connection and try again.')
      // Rollback optimistic message if error
      setMessages(prev => prev.filter(m => m.id !== 'temp-user-id'))
    } finally {
      setSending(false)
    }
  }

  const handleDeleteConversation = async (convId) => {
    try {
      await conversationApi.deleteConversation(convId)
      setConversations(prev => prev.filter(c => c.id !== convId))
      
      // If we deleted the active chat session, navigate back to home screen
      if (convId === id) {
        navigate('/')
      }
    } catch (err) {
      setError('Failed to delete conversation.')
    }
  }

  return (
    <div className="page-container">
      <Sidebar 
        conversations={conversations} 
        activeId={id} 
        onDelete={handleDeleteConversation}
        loading={sidebarLoading}
      />
      <div className="main-content">
        <Navbar />
        {error && <ErrorMessage message={error} onRetry={() => fetchConversationDetails(id)} />}
        
        {chatLoading ? (
          <Loader text="Retrieving conversation transcript..." />
        ) : (
          <ChatWindow 
            messages={messages} 
            sending={sending} 
            messagesEndRef={messagesEndRef}
          />
        )}
        
        <div className="chat-input-wrapper">
          <MessageInput onSend={handleSendMessage} disabled={sending || chatLoading} />
        </div>
      </div>
    </div>
  )
}

export default Chat
