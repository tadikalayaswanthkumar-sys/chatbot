import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-code">404</div>
      <h2 className="notfound-title">Page Not Found</h2>
      <p className="notfound-text">The conversation or workspace you are looking for does not exist.</p>
      <Link to="/" className="notfound-link">
        <Home size={18} />
        Back to Home Workspace
      </Link>
    </div>
  )
}

export default NotFound
