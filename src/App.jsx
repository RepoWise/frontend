import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from './lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  Shield,
  Users,
  GitBranch,
  Share2,
  Download,
  Pencil,
  ExternalLink,
  BookOpen,
  CheckCircle,
  Globe,
  Code,
  Search,
  Github,
  X,
  Check,
  Copy,
  BarChart3,
  MessageSquare
} from 'lucide-react'
import 'highlight.js/styles/atom-one-dark.css'
import { Dashboard } from './components/Dashboard'

function App() {
  const [activeView, setActiveView] = useState('chat') // 'dashboard' or 'chat'
  // Default to null, will be set when projects load
  const [selectedProject, setSelectedProject] = useState(null)
  const [githubUrl, setGithubUrl] = useState('')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [activeTabs, setActiveTabs] = useState({}) // Track active tab per message index
  const [indexingStatus, setIndexingStatus] = useState(null)
  const [copiedMessageId, setCopiedMessageId] = useState(null) // Track copied message
  const [editingMessageId, setEditingMessageId] = useState(null) // Track which message is being edited
  const [editedQuery, setEditedQuery] = useState('') // Store edited query text
  const [loadingStage, setLoadingStage] = useState(0) // Track loading animation stage
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messageRefs = useRef({}) // Store refs for each message

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToMessage = (index) => {
    messageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    // When a new assistant message is added, scroll to its start position
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.type === 'assistant') {
        // Scroll to the assistant message (not the bottom)
        setTimeout(() => {
          scrollToMessage(messages.length - 1)
        }, 100)
      } else {
        // For user messages or loading, scroll to bottom
        scrollToBottom()
      }
    }
  }, [messages])

  // Auto-dismiss indexing status messages after 5 seconds (but not loading state)
  useEffect(() => {
    if (indexingStatus && indexingStatus.status !== 'loading') {
      const timer = setTimeout(() => {
        setIndexingStatus(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [indexingStatus])

  // Fetch available projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.listProjects(),
    refetchInterval: 30000, // Refetch every 30 seconds to keep list updated
  })

  const availableProjects = projectsData?.data?.projects || []

  // Add repository and index mutation
  const addRepoMutation = useMutation({
    mutationFn: (githubUrl) => api.addRepository(githubUrl),
    onSuccess: (data) => {
      try {
        // Check if repository already exists
        if (data?.data?.status === 'already_exists') {
          setIndexingStatus({
            status: 'success',
            message: 'Project added successfully',
            project: data?.data?.project
          })
          // Set the project as active
          if (data?.data?.project?.id) {
            setSelectedProject(data.data.project.id)
          }
          setMessages([])
          return
        }

        // Handle new indexing
        setIndexingStatus({
          status: 'success',
          message: 'Project added successfully',
          project: data?.data?.project
        })
        // Set the project as active
        if (data?.data?.project?.id) {
          setSelectedProject(data.data.project.id)
        }
        setMessages([])
      } catch (err) {
        console.error('Error processing indexing response:', err)
        setIndexingStatus({
          status: 'error',
          message: 'Project could not be added: ' + err.message
        })
      }
    },
    onError: (error) => {
      console.error('Indexing error:', error)

      // Handle Pydantic validation errors
      let errorReason = 'Unknown error occurred'

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail

        // Check if it's a Pydantic validation error (array format)
        if (Array.isArray(detail) && detail.length > 0) {
          errorReason = detail[0].msg || 'Invalid input format'
        } else if (typeof detail === 'string') {
          errorReason = detail
        }
      } else if (error.message) {
        errorReason = error.message
      }

      setIndexingStatus({
        status: 'error',
        message: `Project could not be added: ${errorReason}`
      })
    },
  })

  // Query mutation
  const queryMutation = useMutation({
    mutationFn: ({ projectId, query, conversationHistory }) =>
      api.query(projectId, query, { conversationHistory }),
    onSuccess: (data) => {
      // Safely handle sources with null checking
      const sources = data?.data?.sources || []

      // Deduplicate sources by file_path, keeping highest score and counting matches
      const sourcesByPath = {}

      sources.forEach(source => {
        if (!source || !source.file_path) return // Skip invalid sources

        if (!sourcesByPath[source.file_path]) {
          sourcesByPath[source.file_path] = {
            ...source,
            matchCount: 1
          }
        } else {
          sourcesByPath[source.file_path].matchCount++
          // Keep the highest score
          if (source.score > sourcesByPath[source.file_path].score) {
            sourcesByPath[source.file_path].score = source.score
          }
        }
      })

      const uniqueSources = Object.values(sourcesByPath)

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data?.data?.response || 'No response received',
        sources: uniqueSources,
        metadata: data?.data?.metadata || {},
        suggestedQuestions: data?.data?.suggested_questions || [],
        timestamp: new Date(),
        query: prev[prev.length - 1]?.content
      }])
    },
    onError: (error) => {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }])
    },
  })

  // Auto-focus input after assistant response
  useEffect(() => {
    if (messages.length > 0 && !queryMutation.isPending) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.type === 'assistant') {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }, [messages, queryMutation.isPending])

  const handleSendQuery = (e) => {
    e.preventDefault()
    if (!query.trim() || !selectedProject) return

    // Build conversation history from previous messages (limit to last 5 pairs = 10 messages)
    const conversationHistory = messages
      .filter(msg => msg.type === 'user' || msg.type === 'assistant')
      .slice(-10) // Keep last 10 messages
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: query,
      timestamp: new Date()
    }])

    // Send query with conversation history
    queryMutation.mutate({
      projectId: selectedProject,
      query,
      conversationHistory: conversationHistory.length > 0 ? conversationHistory : null
    })
    setQuery('')
    // Reset textarea height to minimum after submission
    if (inputRef.current) {
      inputRef.current.style.height = '28px'
    }
    inputRef.current?.focus()
  }

  const handleSuggestion = (suggestion) => {
    setQuery(suggestion)
    inputRef.current?.focus()
  }

  const handleAddRepository = (e) => {
    e.preventDefault()
    if (!githubUrl.trim()) return
    setIndexingStatus({ status: 'loading', message: 'Scraping and indexing repository...' })
    addRepoMutation.mutate(githubUrl)
  }

  // Handler for project selection from dropdown
  const handleProjectSelect = (e) => {
    const projectId = e.target.value
    if (projectId) {
      setSelectedProject(projectId)
      setMessages([]) // Clear messages when switching projects
    }
  }

  // Action handlers for Share, Export, Rewrite
  const handleShare = async (messageIdx) => {
    const msg = messages[messageIdx]
    if (!msg) return

    const shareText = `Question: ${msg.query}\n\nAnswer:\n${msg.content}\n\nSources:\n${msg.sources.map(s => `- ${s.file_path} (${(s.score * 100).toFixed(0)}%)`).join('\n')}`

    try {
      await navigator.clipboard.writeText(shareText)
      setCopiedMessageId(messageIdx)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleExport = (messageIdx) => {
    const msg = messages[messageIdx]
    if (!msg) return

    const markdown = `# Question\n${msg.query}\n\n## Answer\n${msg.content}\n\n## Sources\n${msg.sources.map(s => `- **${s.file_path}** (Relevance: ${(s.score * 100).toFixed(0)}%)${s.matchCount > 1 ? ` - ${s.matchCount} matches` : ''}`).join('\n')}\n\n---\nGenerated by OSSPREY Intelligence\n${new Date().toLocaleString()}`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ossprey-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleEdit = (messageIdx) => {
    // Find the corresponding user message (should be idx - 1)
    const userMessageIdx = messageIdx - 1
    const userMsg = messages[userMessageIdx]

    if (!userMsg || userMsg.type !== 'user') return

    setEditingMessageId(userMessageIdx)
    setEditedQuery(userMsg.content)
  }

  const handleEditSubmit = (messageIdx) => {
    if (!editedQuery.trim()) return

    // Build conversation history up to (but not including) the message being edited
    const conversationHistory = messages
      .slice(0, messageIdx)
      .filter(msg => msg.type === 'user' || msg.type === 'assistant')
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.type === 'user' ? msg.content : msg.content
      }))

    // Remove all messages from the editing point onward
    setMessages(prev => prev.slice(0, messageIdx))

    // Add the new edited user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: editedQuery,
      timestamp: new Date()
    }])

    // Submit the new query
    queryMutation.mutate({
      projectId: selectedProject,
      query: editedQuery,
      conversationHistory: conversationHistory.length > 0 ? conversationHistory : null
    })

    // Clear editing state
    setEditingMessageId(null)
    setEditedQuery('')
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditedQuery('')
  }

  // Generate dynamic related questions based on conversation context
  const getRelatedQuestions = () => {
    // All available questions by topic (real test questions)
    const questionBank = {
      governance: [
        'Who currently maintains this project?',
        'What are the voting rules for changes?',
        'What are the required steps before submitting a pull request?',
        'How do I report a security vulnerability?'
      ],
      commits: [
        'Who are the three most active committers?',
        'What are the five latest commits?',
        'Which files have the highest total lines added across all commits?'
      ],
      issues: [
        'How many open vs closed issues are there?',
        'What are the three most recently updated issues?',
        'Which issue has the highest comment count?'
      ]
    }

    // If no messages, show default mix across all categories
    if (messages.length === 0) {
      return [
        'Who currently maintains this project?',
        'What are the required steps before submitting a pull request?',
        'Who are the three most active committers?',
        'How do I report a security vulnerability?'
      ]
    }

    // Get questions that haven't been asked yet
    const askedQuestions = messages
      .filter(m => m.type === 'user')
      .map(m => m.content.toLowerCase())

    // Determine topics from last assistant response
    const lastAssistantMessage = messages
      .slice()
      .reverse()
      .find(m => m.type === 'assistant')

    let relevantTopics = ['governance', 'commits', 'issues']

    if (lastAssistantMessage) {
      const content = lastAssistantMessage.content.toLowerCase()
      relevantTopics = []

      // GOVERNANCE intent indicators
      if (content.includes('maintainer') || content.includes('contribut') ||
          content.includes('pull request') || content.includes('pr') ||
          content.includes('governance') || content.includes('decision') ||
          content.includes('vote') || content.includes('security') ||
          content.includes('vulnerability')) {
        relevantTopics.push('governance')
      }

      // COMMITS intent indicators
      if (content.includes('commit') || content.includes('author') ||
          content.includes('contributor') || content.includes('file') ||
          content.includes('lines added') || content.includes('code change')) {
        relevantTopics.push('commits')
      }

      // ISSUES intent indicators
      if (content.includes('issue') || content.includes('bug') ||
          content.includes('ticket') || content.includes('open') ||
          content.includes('closed')) {
        relevantTopics.push('issues')
      }

      // If no specific topics identified, default to all
      if (relevantTopics.length === 0) {
        relevantTopics = ['governance', 'commits', 'issues']
      }
    }

    // Collect questions from relevant topics that haven't been asked
    const availableQuestions = relevantTopics
      .flatMap(topic => questionBank[topic] || [])
      .filter(q => !askedQuestions.some(asked =>
        asked.includes(q.toLowerCase().substring(0, 15)) // Match first 15 chars
      ))

    // Return first 4 unique questions
    return [...new Set(availableQuestions)].slice(0, 4)
  }

  const relatedQuestions = getRelatedQuestions()

  // Generate dynamic loading messages based on query context
  const getLoadingStages = (query) => {
    const queryLower = query.toLowerCase()

    // Determine query type for context-aware messages
    const isGovernance = queryLower.includes('maintain') || queryLower.includes('contribut') ||
                         queryLower.includes('pull request') || queryLower.includes('security') ||
                         queryLower.includes('vote') || queryLower.includes('decision') ||
                         queryLower.includes('governance') || queryLower.includes('license')

    const isCommits = queryLower.includes('commit') || queryLower.includes('contributor') ||
                      queryLower.includes('author') || queryLower.includes('code') ||
                      queryLower.includes('file') || queryLower.includes('change')

    const isIssues = queryLower.includes('issue') || queryLower.includes('bug') ||
                     queryLower.includes('ticket') || queryLower.includes('open') ||
                     queryLower.includes('closed') || queryLower.includes('report')

    // Context-specific loading stages
    if (isGovernance) {
      return [
        { icon: Search, text: "Searching governance documents...", color: "text-blue-400" },
        { icon: FileText, text: "Reading CONTRIBUTING.md and CODE_OF_CONDUCT.md...", color: "text-purple-400" },
        { icon: Shield, text: "Analyzing project policies...", color: "text-emerald-400" },
        { icon: Sparkles, text: "Synthesizing governance insights...", color: "text-amber-400" }
      ]
    } else if (isCommits) {
      return [
        { icon: Search, text: "Querying commit history...", color: "text-blue-400" },
        { icon: GitBranch, text: "Analyzing contributor activity...", color: "text-purple-400" },
        { icon: Code, text: "Processing code changes...", color: "text-emerald-400" },
        { icon: Sparkles, text: "Generating insights...", color: "text-amber-400" }
      ]
    } else if (isIssues) {
      return [
        { icon: Search, text: "Scanning issue tracker...", color: "text-blue-400" },
        { icon: AlertCircle, text: "Analyzing issue patterns...", color: "text-purple-400" },
        { icon: Users, text: "Evaluating community engagement...", color: "text-emerald-400" },
        { icon: Sparkles, text: "Compiling results...", color: "text-amber-400" }
      ]
    }

    // Default loading stages
    return [
      { icon: Search, text: "Understanding your question...", color: "text-blue-400" },
      { icon: FileText, text: "Searching relevant documents...", color: "text-purple-400" },
      { icon: Sparkles, text: "Analyzing context...", color: "text-emerald-400" },
      { icon: Sparkles, text: "Crafting response...", color: "text-amber-400" }
    ]
  }

  // Cycle through loading stages
  useEffect(() => {
    if (queryMutation.isPending) {
      setLoadingStage(0)
      const interval = setInterval(() => {
        setLoadingStage(prev => (prev + 1) % 4)
      }, 1500) // Change stage every 1.5 seconds
      return () => clearInterval(interval)
    }
  }, [queryMutation.isPending])

  const getSourceIcon = (fileType) => {
    const icons = {
      governance: <BookOpen className="w-4 h-4" />,
      contributing: <Users className="w-4 h-4" />,
      code_of_conduct: <Shield className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
      maintainers: <Users className="w-4 h-4" />,
      license: <FileText className="w-4 h-4" />,
      readme: <FileText className="w-4 h-4" />,
      commits: <GitBranch className="w-4 h-4" />,
      issues: <AlertCircle className="w-4 h-4" />
    }
    return icons[fileType] || <FileText className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    OSS Forensics
                  </h1>
                  <p className="text-xs text-gray-500">
                    AI-powered OSS governance and commit analysis
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              {/* <div className="flex items-center space-x-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === 'dashboard'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === 'chat'
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
              </div> */}
            </div>

            <form onSubmit={handleAddRepository} className="flex gap-2 min-w-[500px]">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!githubUrl.trim() || addRepoMutation.isPending}
                className="px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              >
                <Github className="w-4 h-4" />
                Add Repo
              </button>
            </form>
 
            {/* Project Display - keras-io */}
            {/* <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg">
              <Github className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-white">Keras.io</span>
              <span className="text-xs text-gray-500">keras-team/keras-io</span>
            </div> */}
          </div>

          {/* Indexing Status */}
          {indexingStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-3 p-4 rounded-lg border ${
                indexingStatus.status === 'success'
                  ? 'bg-emerald-900/20 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : indexingStatus.status === 'error'
                  ? 'bg-red-900/20 border-red-500/30 shadow-lg shadow-red-500/10'
                  : 'bg-blue-900/20 border-blue-500/30 shadow-lg shadow-blue-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {indexingStatus.status === 'loading' && (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  )}
                  {indexingStatus.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                  {indexingStatus.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    indexingStatus.status === 'success'
                      ? 'text-emerald-300'
                      : indexingStatus.status === 'error'
                      ? 'text-red-300'
                      : 'text-blue-300'
                  }`}>
                    {indexingStatus.status === 'success' && 'Success!'}
                    {indexingStatus.status === 'error' && 'Error'}
                    {indexingStatus.status === 'loading' && 'Processing...'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    indexingStatus.status === 'success'
                      ? 'text-emerald-400'
                      : indexingStatus.status === 'error'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}>
                    {indexingStatus.message}
                  </p>
                  {indexingStatus.status === 'error' && (
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Use format https://github.com/owner/repository
                    </p>
                  )}
                </div>
                {indexingStatus.status !== 'loading' && (
                  <button
                    onClick={() => setIndexingStatus(null)}
                    className="flex-shrink-0 p-1 hover:bg-gray-800/50 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard selectedProject={selectedProject} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-5xl mx-auto px-6 py-8">
                <AnimatePresence mode="popLayout">
                  {/* Welcome State */}
                  {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-16"
              >
                <div className="inline-flex p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-2xl border border-emerald-500/20 mb-8">
                  <Sparkles className="w-16 h-16 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Explore OSS Governance with AI
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
                  {selectedProject
                    ? "Ask anything about this project's governance, contribution guidelines, commit history, or issue tracking."
                    : "Enter a GitHub repository URL above to start exploring its governance documents with AI."}
                </p>

                {/* Suggested Questions - only show when project is indexed */}
                {selectedProject && (
                  <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
                    {[
                      { q: 'Who currently maintains this project?', icon: <Users className="w-4 h-4" /> },
                      { q: 'What are the required steps before submitting a pull request?', icon: <Code className="w-4 h-4" /> },
                      { q: 'Who are the three most active committers?', icon: <GitBranch className="w-4 h-4" /> },
                      { q: 'How do I report a security vulnerability?', icon: <Shield className="w-4 h-4" /> },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleSuggestion(item.q)}
                        className="flex items-center space-x-3 px-5 py-4 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-xl transition-all text-left group"
                      >
                        <div className="p-2 bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-lg transition-colors">
                          {item.icon}
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {item.q}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                ref={(el) => (messageRefs.current[idx] = el)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                {msg.type === 'user' && (
                  <div className="mb-8">
                    <div className="flex-1">
                      {editingMessageId === idx ? (
                        <div className="space-y-3">
                          <textarea
                            value={editedQuery}
                            onChange={(e) => setEditedQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleEditSubmit(idx)
                              } else if (e.key === 'Escape') {
                                handleCancelEdit()
                              }
                            }}
                            className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditSubmit(idx)}
                              disabled={!editedQuery.trim()}
                              className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-all"
                            >
                              Cancel
                            </button>
                            <span className="text-xs text-gray-500 ml-2">
                              Press Enter to submit · Esc to cancel
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-base font-normal text-white/90" style={{ lineHeight: '1.7' }}>
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {msg.type === 'assistant' && (
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex items-center space-x-1 border-b border-gray-800">
                      {['answer', 'sources'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTabs({...activeTabs, [idx]: tab})}
                          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            (activeTabs[idx] || 'answer') === tab
                              ? 'text-emerald-500'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          {(activeTabs[idx] || 'answer') === tab && (
                            <motion.div
                              layoutId={`activeTab-${idx}`}
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Answer Tab */}
                    {(activeTabs[idx] || 'answer') === 'answer' && (
                      <div className="space-y-6">
                        {/* Main Answer */}
                        <div className="prose prose-invert prose-lg max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              p: ({ children }) => (
                                <p className="text-base text-gray-300 mb-4" style={{ lineHeight: '1.7' }}>{children}</p>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-3xl font-bold text-white mb-6">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-2xl font-bold text-white mb-4 mt-8">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="space-y-2 mb-4">{children}</ul>
                              ),
                              li: ({ children }) => (
                                <li className="text-gray-300 leading-relaxed">{children}</li>
                              ),
                              code: ({ node, inline, children, ...props }) => {
                                if (inline) {
                                  return (
                                    <code className="px-1.5 py-0.5 bg-gray-800 text-emerald-400 rounded text-sm font-mono" {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                                return (
                                  <code className="block bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm" {...props}>
                                    {children}
                                  </code>
                                )
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-400 my-4">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* Source Cards */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">Sources</span>
                              <span className="text-gray-600">·</span>
                              <span>{msg.sources.length} {msg.sources.length === 1 ? 'document' : 'documents'}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {msg.sources.map((source, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className="flex items-start space-x-4 p-4 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-xl transition-all group cursor-pointer"
                                >
                                  <div className="flex-shrink-0 p-2 bg-emerald-500/10 rounded-lg">
                                    {getSourceIcon(source.file_type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h4 className="text-sm font-medium text-white truncate">
                                        {source.file_path.split('/').pop()}
                                      </h4>
                                      <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                      {source.file_path}
                                    </p>
                                    <div className="flex items-center space-x-3 mt-2">
                                      <span className="text-xs text-gray-600">
                                        Relevance: {(source.score * 100).toFixed(0)}%
                                      </span>
                                      {source.matchCount && source.matchCount > 1 && (
                                        <span className="text-xs text-emerald-400">
                                          ({source.matchCount} {source.matchCount === 1 ? 'match' : 'matches'})
                                        </span>
                                      )}
                                      {source.file_type && (
                                        <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 capitalize">
                                          {source.file_type.replace('_', ' ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 pt-4 border-t border-gray-800">
                          <button
                            onClick={() => handleShare(idx)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-lg transition-all text-sm text-gray-400 hover:text-gray-300"
                          >
                            {copiedMessageId === idx ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleExport(idx)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-lg transition-all text-sm text-gray-400 hover:text-gray-300"
                          >
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                          </button>
                          <button
                            onClick={() => handleEdit(idx)}
                            disabled={editingMessageId !== null && editingMessageId !== idx - 1}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-lg transition-all text-sm text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Related Questions - Use API suggestions if available, fallback to hardcoded */}
                        <div className="space-y-3 pt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium">Suggested Questions</span>
                          </div>
                          <div className="space-y-2">
                            {(() => {
                              // Use API-provided suggestions if available, otherwise fallback to hardcoded
                              const questions = msg.suggestedQuestions && msg.suggestedQuestions.length > 0
                                ? msg.suggestedQuestions
                                : relatedQuestions.slice(0, 4)

                              return questions.map((question, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleSuggestion(question)}
                                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/30 hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700 rounded-lg transition-all text-left group"
                                >
                                  <span className="text-sm text-gray-400 group-hover:text-gray-300">
                                    {question}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-gray-500" />
                                </button>
                              ))
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sources Tab */}
                    {(activeTabs[idx] || 'answer') === 'sources' && msg.sources && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                          {msg.sources.length} source {msg.sources.length === 1 ? 'document' : 'documents'} referenced
                        </p>
                        {msg.sources.map((source, i) => (
                          <div
                            key={i}
                            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                {getSourceIcon(source.file_type)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">
                                  {source.file_path.split('/').pop()}
                                </h4>
                                <p className="text-xs text-gray-500">{source.file_path}</p>
                                <div className="flex items-center space-x-3 mt-2">
                                  <span className="text-xs text-gray-600">
                                    Relevance: {(source.score * 100).toFixed(0)}%
                                  </span>
                                  {source.matchCount && source.matchCount > 1 && (
                                    <span className="text-xs text-emerald-400">
                                      ({source.matchCount} {source.matchCount === 1 ? 'match' : 'matches'})
                                    </span>
                                  )}
                                  {source.file_type && (
                                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 capitalize">
                                      {source.file_type.replace('_', ' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {msg.type === 'error' && (
                  <div className="flex items-start space-x-3 p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{msg.content}</p>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Enhanced Loading State - Perplexity-style */}
            {queryMutation.isPending && (() => {
              const lastUserMessage = messages.filter(m => m.type === 'user').pop()
              const loadingStages = lastUserMessage ? getLoadingStages(lastUserMessage.content) : getLoadingStages('')
              const currentStage = loadingStages[loadingStage]
              const Icon = currentStage.icon

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Main Loading Card */}
                  <div className="relative overflow-hidden p-6 bg-gradient-to-br from-gray-900/50 to-gray-900/30 border border-gray-800 rounded-2xl">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />

                    <div className="relative space-y-4">
                      {/* Current Stage Display */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse" />
                            <div className="relative p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-emerald-500/30">
                              <Icon className={`w-6 h-6 ${currentStage.color} animate-pulse`} />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={loadingStage}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <p className="text-base font-medium text-white">
                                {currentStage.text}
                              </p>
                            </motion.div>
                          </AnimatePresence>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex space-x-1">
                              {loadingStages.map((_, idx) => (
                                <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${
                                  idx === loadingStage ? 'w-8 bg-gradient-to-r from-emerald-500 to-blue-500'
                                  : idx < loadingStage ? 'w-4 bg-emerald-500/50' : 'w-4 bg-gray-700'
                                }`} />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              Step {loadingStage + 1} of {loadingStages.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Timeline */}
                      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-800/50">
                        {loadingStages.map((stage, idx) => {
                          const StageIcon = stage.icon
                          const isCompleted = idx < loadingStage
                          const isCurrent = idx === loadingStage
                          const isPending = idx > loadingStage

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30"
                            >
                              <div className={`p-2 rounded-lg ${
                                isCurrent
                                  ? 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20'
                                  : isCompleted
                                  ? 'bg-emerald-500/10'
                                  : 'bg-gray-800/50'
                              }`}>
                                <StageIcon className={`w-4 h-4 ${
                                  isCurrent ? stage.color : isCompleted ? 'text-emerald-400' : 'text-gray-600'
                                }`} />
                              </div>
                              <span className={`text-xs text-center ${
                                isCurrent ? 'text-white font-medium' : 'text-gray-500'
                              }`}>
                                {stage.text.split('...')[0]}
                              </span>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })()}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area - Fixed at Bottom - Only show in Chat view */}
      {activeView === 'chat' && (
      <div className="sticky bottom-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f] to-transparent pt-8 pb-6">
        <div className="max-w-5xl mx-auto px-6">
          <form onSubmit={handleSendQuery} className="relative">
            <div className="flex items-end space-x-3 p-4 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl transition-all focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/10">
              <div
                className="flex-1 cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                <textarea
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    // Auto-expand textarea height
                    const target = e.target
                    target.style.height = 'auto'
                    target.style.height = `${target.scrollHeight}px`
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendQuery(e)
                    }
                  }}
                  placeholder="Ask about governance, commits, issues, or contribution guidelines..."
                  disabled={!selectedProject || queryMutation.isPending || editingMessageId !== null}
                  rows={1}
                  className="w-full bg-transparent border-0 focus:outline-none resize-none text-gray-100 placeholder-gray-500 text-base disabled:opacity-50 max-h-32 disabled:cursor-not-allowed overflow-y-auto"
                  style={{ minHeight: '28px', lineHeight: '1.6', height: '28px' }}
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim() || !selectedProject || queryMutation.isPending || editingMessageId !== null}
                className="flex-shrink-0 p-3 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 px-2">
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>Powered by Llama 3.2</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <GitBranch className="w-3 h-3" />
                  <span>RAG-Enhanced Responses</span>
                </div>
              </div>
              <span className="text-xs text-gray-600">
                Press Enter to send · Shift+Enter for new line
              </span>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  )
}

export default App
