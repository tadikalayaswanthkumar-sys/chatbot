import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bot, RefreshCw } from 'lucide-react'
import api from '../../api/axios'

function Navbar() {
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    online: false,
    aiFallback: true
  })

  const checkHealth = async () => {
    try {
      setHealthStatus(prev => ({ ...prev, loading: true }))
      const response = await api.get('/health')
      setHealthStatus({
        loading: false,
        online: true,
        aiFallback: response.data.ai_fallback
      })
    } catch (error) {
      setHealthStatus({
        loading: false,
        online: false,
        aiFallback: true
      })
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="nav-logo">💬</span>
        <span className="nav-title">DeepMind Chat</span>
      </Link>
      
      <div className="nav-status" onClick={checkHealth} style={{ cursor: 'pointer' }} title="Click to refresh status">
        {healthStatus.loading ? (
          <>
            <RefreshCw size={12} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Checking...</span>
          </>
        ) : healthStatus.online ? (
          <>
            <span className={`status-dot ${healthStatus.aiFallback ? 'simulated' : ''}`}></span>
            <span>{healthStatus.aiFallback ? 'Simulation Mode' : 'OpenAI Live'}</span>
          </>
        ) : (
          <>
            <span className="status-dot" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
            <span>Offline</span>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
