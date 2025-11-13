/**
 * Authentication Context
 * Manages user authentication state, login, signup, logout
 * Provides authentication utilities throughout the app
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('repowise_token')
      const storedUser = localStorage.getItem('repowise_user')

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setToken(storedToken)
          setUser(parsedUser)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
          localStorage.removeItem('repowise_token')
          localStorage.removeItem('repowise_user')
        }
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed')
      }

      // Store auth data
      localStorage.setItem('repowise_token', data.access_token)
      localStorage.setItem('repowise_user', JSON.stringify(data.user))

      setToken(data.access_token)
      setUser(data.user)
      setIsAuthenticated(true)

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }, [])

  // Signup function
  const signup = useCallback(async (firstName, lastName, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed')
      }

      // Store auth data
      localStorage.setItem('repowise_token', data.access_token)
      localStorage.setItem('repowise_user', JSON.stringify(data.user))

      setToken(data.access_token)
      setUser(data.user)
      setIsAuthenticated(true)

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: error.message }
    }
  }, [])

  // OAuth login
  const loginWithOAuth = useCallback(async (provider, code, redirectUri) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/oauth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          code,
          redirect_uri: redirectUri,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'OAuth login failed')
      }

      // Store auth data
      localStorage.setItem('repowise_token', data.access_token)
      localStorage.setItem('repowise_user', JSON.stringify(data.user))

      setToken(data.access_token)
      setUser(data.user)
      setIsAuthenticated(true)

      return { success: true, user: data.user }
    } catch (error) {
      console.error('OAuth login error:', error)
      return { success: false, error: error.message }
    }
  }, [])

  // Get OAuth authorization URL
  const getOAuthUrl = useCallback(async (provider) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/oauth/${provider}/authorize`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get OAuth URL')
      }

      return data.authorization_url
    } catch (error) {
      console.error('Get OAuth URL error:', error)
      return null
    }
  }, [])

  // Logout function - clears auth state and prevents browser back button access
  const logout = useCallback(() => {
    // Clear stored auth data
    localStorage.removeItem('repowise_token')
    localStorage.removeItem('repowise_user')

    // Clear state
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)

    // Clear browser history to prevent back button access
    // This replaces the current history entry instead of adding a new one
    window.history.pushState(null, '', window.location.href)
    window.history.pushState(null, '', window.location.href)

    // Prevent back button from showing authenticated pages
    window.addEventListener('popstate', function(event) {
      window.history.pushState(null, '', window.location.href)
    })

    return { success: true }
  }, [])

  // Get current user profile
  const fetchCurrentUser = useCallback(async () => {
    if (!token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, logout
          logout()
        }
        return null
      }

      const userData = await response.json()
      setUser(userData)
      localStorage.setItem('repowise_user', JSON.stringify(userData))

      return userData
    } catch (error) {
      console.error('Fetch current user error:', error)
      return null
    }
  }, [token, logout])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    signup,
    logout,
    loginWithOAuth,
    getOAuthUrl,
    fetchCurrentUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/auth', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Show loading spinner while checking authentication
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

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return children
}

export default AuthContext
