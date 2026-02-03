import { useState, useRef, useEffect } from 'react'
import { Search, Github, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLE_REPOSITORIES = [
  {
    name: 'Google meridian',
    url: 'https://github.com/google/meridian',
  },
  {
    name: 'Apple pkl',
    url: 'https://github.com/apple/pkl',
  },
  {
    name: 'Netflix Hollow',
    url: 'https://github.com/Netflix/hollow',
  },
  {
    name: 'Microsoft Lisa',
    url: 'https://github.com/microsoft/lisa',
  }
]

export function LandingHero({ onAddRepository, isLoading, indexingStatus, user, isAuthenticated }) {
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    // Keep dropdown visible even when typing (per user requirement)
  }

  const validateGithubUrl = (url) => {
    // Support multiple GitHub URL formats
    const patterns = [
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?\/?$/,
      /^git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/,
      /^([^/]+)\/([^/]+)$/
    ]

    return patterns.some(pattern => pattern.test(url.trim()))
  }

  const handleRepoSelect = (repoUrl) => {
    setInputValue(repoUrl)
    setShowDropdown(false)
    onAddRepository(repoUrl)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedValue = inputValue.trim()

    if (!trimmedValue) {
      return
    }

    // Validate GitHub URL format
    if (!validateGithubUrl(trimmedValue)) {
      // Call onAddRepository with invalid URL - backend will handle error
      setShowDropdown(false)
      onAddRepository(trimmedValue)
      return
    }

    setShowDropdown(false)
    onAddRepository(trimmedValue)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-20 blur-3xl rounded-full"></div>
            <Sparkles className="w-20 h-20 text-emerald-500 relative" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl sm:text-7xl font-bold mb-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent"
        >
          RepoWise
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 mb-6 font-light"
        >
          Where OSS exploration begins
        </motion.p>

        {/* User Greeting */}
        {isAuthenticated && user && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-base dark:text-gray-400 text-gray-600 mb-10"
          >
            Hi <span className="font-semibold dark:text-gray-300 text-gray-700">{user.first_name}</span>, enter a GitHub repository URL to start exploring
          </motion.p>
        )}

        {!isAuthenticated && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-base dark:text-gray-500 text-gray-500 mb-10"
          >
            Enter a GitHub repository URL to start exploring
          </motion.p>
        )}

        {/* Input Section */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl"></div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              data-testid="repo-url-input"
              placeholder="microsoft/codetour"
              disabled={isLoading}
              className="relative w-full px-6 py-5 text-lg rounded-2xl border-2
                       dark:bg-gray-900/50 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
                       bg-white border-gray-300 text-gray-900 placeholder-gray-400
                       focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20
                       transition-all duration-200 outline-none
                       disabled:opacity-50 disabled:cursor-not-allowed
                       backdrop-blur-sm"
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-600 pointer-events-none" />
          </div>

          {/* Featured Repos Dropdown */}
          <AnimatePresence>
            {showDropdown && !isLoading && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-3 w-full
                         dark:bg-gray-900 dark:border-gray-800
                         bg-white border-gray-200
                         rounded-2xl shadow-2xl border-2 z-50
                         backdrop-blur-xl"
              >
                {/* Header */}
                <div className="px-5 py-2.5 border-b dark:border-gray-800 border-gray-200">
                  <h3 className="text-xs font-semibold dark:text-gray-400 text-gray-600 uppercase tracking-wide">
                    Try these sample repositories
                  </h3>
                </div>

                {/* Repository List */}
                <div className="py-1">
                  {EXAMPLE_REPOSITORIES.map((repo, index) => (
                    <motion.button
                      type="button"
                      key={repo.url}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleRepoSelect(repo.url)}
                      className="w-full px-5 py-2.5
                               dark:hover:bg-emerald-900/20 dark:text-white
                               hover:bg-emerald-50 text-gray-900
                               transition-all flex items-center gap-3 text-left
                               border-b dark:border-gray-800/50 border-gray-100
                               last:border-0 group"
                    >
                      <div className="flex-shrink-0 p-1.5 rounded-lg
                                    dark:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20
                                    bg-emerald-100 group-hover:bg-emerald-200
                                    transition-colors">
                        <Github className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold dark:text-white text-gray-900 mb-0.5">
                          {repo.name}
                        </div>
                        <div className="text-xs dark:text-gray-500 text-gray-600 truncate font-mono">
                          {repo.url}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Add Repository Button */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isLoading}
          data-testid="repo-add-button"
          className="px-12 py-4
                   bg-gradient-to-br from-emerald-500 to-teal-600
                   hover:from-emerald-600 hover:to-teal-700
                   text-white text-lg font-semibold rounded-xl
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200
                   shadow-lg hover:shadow-xl hover:scale-105
                   active:scale-95
                   flex items-center gap-3 mx-auto"
        >
          <Github className="w-5 h-5" />
          Add Repository
        </motion.button>

        {/* Status Messages - Single loader for all loading states */}
        <AnimatePresence>
          {indexingStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
              data-testid="repo-indexing-status"
              data-status={indexingStatus.status}
            >
              {indexingStatus.status === 'success' && (
                <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{indexingStatus.message || 'Repository added successfully!'}</span>
                </div>
              )}
              {indexingStatus.status === 'error' && (
                <div className="flex items-center justify-center gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{indexingStatus.message || 'Failed to add repository'}</span>
                </div>
              )}
              {indexingStatus.status === 'loading' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">{indexingStatus.message || 'Processing...'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
