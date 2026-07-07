import React from 'react'
import { AlertCircle } from 'lucide-react'

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <AlertCircle className="error-icon" />
      <h4 className="error-title">An Error Occurred</h4>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
