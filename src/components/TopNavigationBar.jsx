import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Github, LogOut, UserCircle, Search, Loader2, ChevronDown, RefreshCw } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
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

export function TopNavigationBar({
  selectedProject,
  githubUrl,
  isRepoLocked,
  onChangeRepo,
  onAddRepository,
  isLoading,
  isAuthenticated,
  user,
  onLogout,
  onLoginClick,
  availableProjects,
  onProjectSelect
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [inputValue, setInputValue] = useState(githubUrl || '')
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Sync input value when githubUrl prop changes
  useEffect(() => {
    setInputValue(githubUrl || '')
  }, [githubUrl])

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
    if (!isRepoLocked) {
      setShowDropdown(true)
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleRepoSelect = (repoUrl) => {
    setInputValue(repoUrl)
    setShowDropdown(false)
    onAddRepository(repoUrl)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setShowDropdown(false)
      onAddRepository(inputValue)
    }
  }

  const handleChangeRepoClick = () => {
    setInputValue('')
    onChangeRepo()
  }

  // If no project selected (landing page), show minimal top bar
  if (!selectedProject) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/projects"
              className="px-4 py-2 rounded-lg border border-cyan-400/60 text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 dark:text-cyan-200 dark:hover:text-white dark:hover:bg-cyan-500/20 transition-colors text-sm font-medium"
            >
              UC Davis Projects
            </Link>
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                           dark:hover:bg-gray-800 hover:bg-gray-100
                           transition-colors"
                >
                  <UserCircle className="w-5 h-5 dark:text-gray-400 text-gray-600" />
                  <span className="text-sm font-medium dark:text-gray-300 text-gray-700">
                    {user?.email || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 dark:text-gray-500 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48
                               dark:bg-gray-900 bg-white
                               border dark:border-gray-800 border-gray-200
                               rounded-lg shadow-xl z-50"
                    >
                      <button
                        type="button"
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-3
                                 dark:hover:bg-gray-800 hover:bg-gray-50
                                 dark:text-gray-300 text-gray-700
                                 transition-colors rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="px-4 py-2 rounded-lg border-2
                         dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
                         border-gray-300 text-gray-700 hover:bg-gray-100
                         transition-colors font-medium text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>
    )
  }

  // If project selected (chat interface), show full top bar
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-semibold dark:text-white text-gray-900">
              RepoWise
            </h1>
          </div>

          {/* Center: GitHub input + Change/Add Repo button */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl justify-center">

            <form onSubmit={handleSubmit} className="relative flex-1 max-w-xl">
              {/* Animated wave border wrapper - only show when unlocked */}
              {!isRepoLocked && availableProjects.length === 0 && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 25%, rgba(16, 185, 129, 0.8) 50%, rgba(16, 185, 129, 0.3) 75%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 0%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}

              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 z-10" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  readOnly={isRepoLocked}
                  placeholder="Enter GitHub repository URL..."
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all outline-none
                           focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                           read-only:cursor-default read-only:focus:ring-0
                           disabled:opacity-50 ${
                    isRepoLocked
                      ? 'dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-400 bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                      : availableProjects.length === 0
                      ? 'dark:bg-gray-900/50 dark:border-emerald-400/30 dark:text-white bg-white/50 border-emerald-500/40 text-gray-900'
                      : 'dark:bg-gray-900/50 dark:border-gray-800 dark:text-white bg-white/50 border-gray-200 text-gray-900'
                  }`}
                />

              {/* Dropdown for Change Repo state */}
              <AnimatePresence>
                {showDropdown && !isRepoLocked && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full mt-2 left-0 right-0
                             dark:bg-gray-900 bg-white
                             border-2 dark:border-gray-800 border-gray-200
                             rounded-lg shadow-xl z-50
                             max-h-[300px] overflow-y-auto"
                  >
                    <div className="px-4 py-3 border-b dark:border-gray-800 border-gray-200">
                      <h3 className="text-xs font-semibold dark:text-gray-400 text-gray-600 uppercase">
                        Sample Repositories
                      </h3>
                    </div>
                    {EXAMPLE_REPOSITORIES.map((repo) => (
                      <button
                        type="button"
                        key={repo.url}
                        onClick={() => handleRepoSelect(repo.url)}
                        className="w-full px-4 py-3
                                 dark:hover:bg-emerald-900/20 hover:bg-emerald-50
                                 transition-colors flex items-center gap-3 text-left
                                 border-b dark:border-gray-800/50 border-gray-100
                                 last:border-0"
                      >
                        <Github className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium dark:text-white text-gray-900">
                            {repo.name}
                          </div>
                          <div className="text-xs dark:text-gray-500 text-gray-600 truncate font-mono">
                            {repo.url}
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </form>

            <button
              type="button"
              onClick={isRepoLocked ? handleChangeRepoClick : handleSubmit}
              disabled={(!inputValue.trim() && !isRepoLocked) || isLoading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap
                       bg-gradient-to-br from-emerald-500 to-teal-600
                       hover:from-emerald-600 hover:to-teal-700
                       text-white transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
                       flex items-center gap-2 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden lg:inline">Adding...</span>
                </>
              ) : isRepoLocked ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden lg:inline">Change Repo</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span className="hidden lg:inline">Add Repo</span>
                </>
              )}
            </button>

            {/* Project Selector Dropdown - show when multiple projects available */}
            {availableProjects.length > 0 && (
              <div className="relative min-w-[180px]">
                <select
                  value={selectedProject || ''}
                  onChange={onProjectSelect}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium
                           dark:bg-gray-900/50 dark:border-gray-800 dark:text-white
                           bg-white/50 border-gray-200 text-gray-900
                           border focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                           focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a project</option>
                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id} className="dark:bg-gray-800 bg-white">
                      {project.name} ({project.owner})
                    </option>
                  ))}
                </select>
                <Github className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Right side: Theme + Auth */}
          <div className="flex items-center gap-3">
            <Link
              to="/projects"
              className="px-4 py-2 rounded-lg border border-cyan-400/60 text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 dark:text-cyan-200 dark:hover:text-white dark:hover:bg-cyan-500/20 transition-colors text-sm font-medium"
            >
              UC Davis Projects
            </Link>
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                           dark:hover:bg-gray-800 hover:bg-gray-100
                           transition-colors"
                >
                  <UserCircle className="w-5 h-5 dark:text-gray-400 text-gray-600" />
                  <ChevronDown className="w-4 h-4 dark:text-gray-500 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48
                               dark:bg-gray-900 bg-white
                               border dark:border-gray-800 border-gray-200
                               rounded-lg shadow-xl z-50"
                    >
                      <div className="px-4 py-3 border-b dark:border-gray-800 border-gray-200">
                        <div className="text-sm font-medium dark:text-white text-gray-900 truncate">
                          {user?.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-4 py-3
                                 dark:hover:bg-gray-800 hover:bg-gray-50
                                 dark:text-gray-300 text-gray-700
                                 transition-colors rounded-b-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="px-4 py-2 rounded-lg border-2
                         dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
                         border-gray-300 text-gray-700 hover:bg-gray-100
                         transition-colors font-medium text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
