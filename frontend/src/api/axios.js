import axios from 'axios'

// Create a configured Axios instance pointing to the FastAPI backend API prefix
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
