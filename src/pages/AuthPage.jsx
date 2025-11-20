/**
 * Authentication Page
 * Beautiful login/signup interface inspired by Perplexity and Claude
 * Supports email/password and OAuth (Google, GitHub)
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  Mail, Lock, User, AlertCircle, Loader2, Sparkles,
  Github, Chrome, Eye, EyeOff
} from 'lucide-react'

const AuthPage = () => {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { login, signup, loginWithOAuth, getOAuthUrl, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const provider = searchParams.get('provider')

    if (code && provider) {
      // Validate state to prevent CSRF attacks
      const storedState = sessionStorage.getItem('oauth_state')
      if (!storedState || storedState !== state) {
        setErrorMessage('Invalid OAuth state. Please try again.')
        return
      }

      // Clear stored state after validation
      sessionStorage.removeItem('oauth_state')
      handleOAuthCallback(provider, code)
    }
  }, [searchParams])

  const handleOAuthCallback = async (provider, code) => {
    setIsLoading(true)
    const result = await loginWithOAuth(provider, code, window.location.origin + '/auth')

    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setErrorMessage(result.error || 'OAuth authentication failed')
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (mode === 'signup') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (mode === 'signup' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!validateForm()) return

    setIsLoading(true)

    let result
    if (mode === 'login') {
      result = await login(formData.email, formData.password)
    } else {
      result = await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      )
    }

    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setErrorMessage(result.error || 'Authentication failed')
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36)
    sessionStorage.setItem('oauth_state', state)

    const authUrl = await getOAuthUrl(provider)
    if (authUrl) {
      // Store current location to return after OAuth
      sessionStorage.setItem('oauth_return_url', '/')
      // Add state parameter to URL
      const urlWithState = `${authUrl}&state=${encodeURIComponent(state)}`
      window.location.href = urlWithState
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setErrors({})
    setErrorMessage('')
    setFormData({ firstName: '', lastName: '', email: '', password: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-[#0f0f0f] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 dark:bg-emerald-500/5 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 dark:bg-blue-500/5 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center p-3 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-blue-500/20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl mb-4"
          >
            <Sparkles className="w-8 h-8 dark:text-emerald-400 text-emerald-600" />
          </motion.div>

          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
            Welcome to RepoWise
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        {/* Main Form Card */}
        <motion.div
          layout
          className="dark:bg-gray-900/50 dark:border-gray-800 dark:backdrop-blur-xl
                     bg-white border-2 border-gray-200
                     rounded-2xl shadow-2xl p-8"
        >
          {/* Error Message */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 dark:bg-red-500/10 dark:border-red-500/30 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 dark:text-red-400 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm dark:text-red-300 text-red-700">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OAuth Buttons - Hidden for now */}
          {/*
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3
                       dark:bg-white/10 dark:hover:bg-white/15 dark:border-gray-700
                       bg-white hover:bg-gray-50 border-2 border-gray-300
                       rounded-xl font-medium transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       dark:text-white text-gray-900"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3
                       dark:bg-white/10 dark:hover:bg-white/15 dark:border-gray-700
                       bg-white hover:bg-gray-50 border-2 border-gray-300
                       rounded-xl font-medium transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       dark:text-white text-gray-900"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full dark:border-gray-700 border-gray-300 border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 dark:bg-gray-900/50 dark:text-gray-400 bg-white text-gray-600">
                Or continue with email
              </span>
            </div>
          </div>
          */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-200
                          dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500
                          bg-white text-gray-900 placeholder-gray-400
                          focus:outline-none
                          ${errors.firstName
                            ? 'dark:border-red-500 border-red-500'
                            : 'dark:border-gray-700 dark:focus:border-emerald-500 border-gray-300 focus:border-emerald-500'
                          }`}
                        placeholder="John"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-xs dark:text-red-400 text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-200
                          dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500
                          bg-white text-gray-900 placeholder-gray-400
                          focus:outline-none
                          ${errors.lastName
                            ? 'dark:border-red-500 border-red-500'
                            : 'dark:border-gray-700 dark:focus:border-emerald-500 border-gray-300 focus:border-emerald-500'
                          }`}
                        placeholder="Doe"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-xs dark:text-red-400 text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-200
                    dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500
                    bg-white text-gray-900 placeholder-gray-400
                    focus:outline-none
                    ${errors.email
                      ? 'dark:border-red-500 border-red-500'
                      : 'dark:border-gray-700 dark:focus:border-emerald-500 border-gray-300 focus:border-emerald-500'
                    }`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs dark:text-red-400 text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:text-gray-500 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 transition-all duration-200
                    dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500
                    bg-white text-gray-900 placeholder-gray-400
                    focus:outline-none
                    ${errors.password
                      ? 'dark:border-red-500 border-red-500'
                      : 'dark:border-gray-700 dark:focus:border-emerald-500 border-gray-300 focus:border-emerald-500'
                    }`}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-gray-500 dark:hover:text-gray-300 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs dark:text-red-400 text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-emerald-500 to-teal-600
                       hover:from-emerald-600 hover:to-teal-700
                       text-white font-medium rounded-xl
                       transition-all duration-200 transform hover:-translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </span>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              disabled={isLoading}
              className="text-sm dark:text-gray-400 dark:hover:text-emerald-400 text-gray-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              {mode === 'login' ? (
                <>Don't have an account? <span className="font-medium">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-medium">Sign in</span></>
              )}
            </button>
          </div>

          {/* Continue without login */}
          <div className="mt-6 pt-6 border-t dark:border-gray-700 border-gray-200">
            <button
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="w-full py-3 px-4
                       dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-300
                       bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 text-gray-700
                       font-medium rounded-xl
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue without login
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AuthPage
