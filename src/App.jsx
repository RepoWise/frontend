/**
 * Main App Component with Routing
 * Implements flexible authentication:
 * - Users can continue without login
 * - Optional authentication for future features
 * - Clean routing structure
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import ProjectsPage from './pages/ProjectsPage'
import ChatInterface from './components/ChatInterface'

function App() {
  const { isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-[#0f0f0f] bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="dark:text-gray-400 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Authentication page */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Main chat interface - accessible with or without auth */}
      <Route path="/" element={<ChatInterface />} />

      {/* OSS Sustainability Tools Suite landing page */}
      <Route path="/oss-sustainability" element={<ProjectsPage />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
