import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home, Chat, NotFound } from './pages.jsx'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
