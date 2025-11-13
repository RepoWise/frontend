/**
 * MainApp Component - The authenticated main application
 * Contains the existing chat interface, dashboard, and all functionality
 * This is a wrapper that imports and renders the original App logic
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../contexts/AuthContext'
import ChatInterface from './ChatInterface'

function MainApp() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProtectedRoute>
  )
}

export default MainApp
