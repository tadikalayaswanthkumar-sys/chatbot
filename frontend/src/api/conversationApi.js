import api from './axios'

export const conversationApi = {
  /**
   * Fetch all user conversations.
   * @returns {Promise<Array>} List of conversation records.
   */
  getConversations: async () => {
    try {
      const response = await api.get('/conversations')
      return response.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  },

  /**
   * Fetch details for a specific conversation including its message thread.
   * @param {string} id - The UUID of the conversation.
   * @returns {Promise<object>} Detailed conversation object.
   */
  getConversationDetails: async (id) => {
    try {
      const response = await api.get(`/conversations/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching conversation details:', error)
      throw error
    }
  },

  /**
   * Delete a conversation.
   * @param {string} id - The UUID of the conversation to delete.
   * @returns {Promise<object>} Status result from delete.
   */
  deleteConversation: async (id) => {
    try {
      const response = await api.delete(`/conversations/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  },
}
