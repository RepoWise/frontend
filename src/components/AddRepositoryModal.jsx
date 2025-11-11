import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default function AddRepositoryModal({ isOpen, onClose, onSubmit, isLoading, result }) {
  const [githubUrl, setGithubUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!githubUrl.trim()) {
      setError('Please enter a GitHub URL')
      return
    }

    onSubmit(githubUrl)
  }

  const handleClose = () => {
    setGithubUrl('')
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Github className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Add Repository</h2>
                      <p className="text-sm text-blue-100">Add any GitHub repository to analyze</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {!result ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="github-url" className="block text-sm font-medium text-slate-300 mb-2">
                        GitHub Repository URL
                      </label>
                      <input
                        id="github-url"
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/owner/repo or owner/repo"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      <p className="mt-2 text-xs text-slate-400">
                        Supported formats: https://github.com/owner/repo, owner/repo, or git@github.com:owner/repo.git
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{error}</p>
                      </motion.div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding Repository...
                          </>
                        ) : (
                          'Add Repository'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {/* Success State */}
                    {result.status === 'success' && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3"
                        >
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="text-green-300 font-medium mb-1">Repository Added Successfully!</h3>
                            <p className="text-sm text-green-200">
                              {result.message}
                            </p>
                          </div>
                        </motion.div>

                        {/* Summary */}
                        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                          <h4 className="text-sm font-medium text-slate-300">Extraction Summary</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/50 rounded p-3">
                              <p className="text-xs text-slate-400">Files Found</p>
                              <p className="text-lg font-semibold text-white">{result.extraction?.files_found || 0}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded p-3">
                              <p className="text-xs text-slate-400">Chunks Indexed</p>
                              <p className="text-lg font-semibold text-white">{result.indexing?.chunks_created || 0}</p>
                            </div>
                          </div>

                          {result.summary && (
                            <div className="text-xs text-slate-400 space-y-1">
                              {Object.entries(result.summary).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="uppercase">{key}:</span>
                                  <span className="text-slate-300">{value ? '✓' : '✗'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleClose}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
                        >
                          Start Chatting
                        </button>
                      </>
                    )}

                    {/* Error State */}
                    {result.status === 'already_exists' && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3"
                        >
                          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="text-yellow-300 font-medium mb-1">Repository Already Exists</h3>
                            <p className="text-sm text-yellow-200">
                              {result.message}
                            </p>
                          </div>
                        </motion.div>

                        <button
                          onClick={handleClose}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                          Close
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
