import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
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
  Copy,
  Download,
  Pencil,
  ExternalLink,
  BookOpen,
  CheckCircle,
  Code,
  Search,
  Github,
  X,
  Check,
  LogOut,
  UserCircle,
  RefreshCw,
  Plus,
  Info,
  Award,
  HelpCircle
} from 'lucide-react'
import 'highlight.js/styles/atom-one-dark.css'
import { Dashboard } from './Dashboard'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../contexts/AuthContext'
import { highlightEntities } from '../lib/highlightEntities'
import { highlightSustainabilityTerms } from '../lib/sustainabilityHighlights'

const EXAMPLE_REPOSITORIES = [
  {
    name: 'Google meridian',
    description: 'Meridian is an MMM framework that enables advertisers to set up and run their own in-house models.',
    url: 'https://github.com/google/meridian',
    highlights: ['marketing', 'bayesian causal inference']
  },
  {
    name: 'Apple pkl',
    description: 'A configuration as code language with rich validation and tooling.',
    url: 'https://github.com/apple/pkl',
    highlights: ['kotlin', 'configuration']
  },
  {
    name: 'Netflix Hollow',
    description: 'Hollow is a java library and toolset for disseminating in-memory datasets from a single producer to many consumers for high performance read-only access.',
    url: 'https://github.com/Netflix/hollow',
    highlights: ['java', 'high-performant']
  },
  {
    name: 'Microsoft Lisa',
    description: 'LISA is developed and maintained by Microsoft, to empower Linux validation.',
    url: 'https://github.com/microsoft/lisa',
    highlights: ['testing', 'linux', 'hyperv cloudtesting', 'linux-compatibility']
  }
]

// Confidence chip component for displaying confidence levels
const ConfidenceChip = ({ confidenceLabel, score, chunkCount }) => {
  // Map confidence labels to colors
  const getConfidenceStyles = (label) => {
    switch (label) {
      case 'Very High':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
          border: 'border-emerald-500/30 dark:border-emerald-500/30',
          text: 'text-emerald-700 dark:text-emerald-400',
          icon: 'text-emerald-600 dark:text-emerald-400'
        }
      case 'High':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/10',
          border: 'border-blue-500/30 dark:border-blue-500/30',
          text: 'text-blue-700 dark:text-blue-400',
          icon: 'text-blue-600 dark:text-blue-400'
        }
      case 'Medium':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/10',
          border: 'border-amber-500/30 dark:border-amber-500/30',
          text: 'text-amber-700 dark:text-amber-400',
          icon: 'text-amber-600 dark:text-amber-400'
        }
      case 'Low':
        return {
          bg: 'bg-red-500/10 dark:bg-red-500/10',
          border: 'border-red-500/30 dark:border-red-500/30',
          text: 'text-red-700 dark:text-red-400',
          icon: 'text-red-600 dark:text-red-400'
        }
      default:
        return {
          bg: 'bg-gray-500/10 dark:bg-gray-500/10',
          border: 'border-gray-500/30 dark:border-gray-500/30',
          text: 'text-gray-700 dark:text-gray-400',
          icon: 'text-gray-600 dark:text-gray-400'
        }
    }
  }

  const styles = getConfidenceStyles(confidenceLabel)

  return (
    <div className="group relative inline-flex items-center gap-1.5">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${styles.bg} ${styles.border}`}>
        <Award className={`w-3.5 h-3.5 ${styles.icon}`} />
        <span className={`text-xs font-medium ${styles.text}`}>
          {confidenceLabel}
        </span>
      </div>

      {/* Hover tooltip with detailed information */}
      <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Confidence:</span>
            <span className="font-medium">{confidenceLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Score:</span>
            <span className="font-medium">{(score * 100).toFixed(0)}%</span>
          </div>
          {chunkCount > 1 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Chunks:</span>
              <span className="font-medium">{chunkCount}</span>
            </div>
          )}
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-gray-700 text-gray-400 text-xs">
          Aggregated from {chunkCount === 1 ? '1 chunk' : `${chunkCount} chunks`} using Noisy OR
        </div>
      </div>
    </div>
  )
}

// Overall answer confidence indicator - shows ONE badge for entire answer
const AnswerConfidenceIndicator = ({ confidence, sourceCount }) => {
  const getConfidenceLevel = (score) => {
    if (score >= 0.8) return 'high'
    if (score >= 0.5) return 'moderate'
    return 'limited'
  }

  const confidenceLevel = getConfidenceLevel(confidence)

  const config = {
    high: {
      icon: CheckCircle,
      text: 'High confidence answer',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      borderColor: 'border-emerald-500/20 dark:border-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-500',
      tooltip: 'This answer is well-supported by multiple authoritative sources from the repository'
    },
    moderate: {
      icon: AlertCircle,
      text: 'Moderate confidence answer',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/10',
      borderColor: 'border-amber-500/20 dark:border-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-500',
      tooltip: 'This answer is based on available sources but may benefit from additional verification'
    },
    limited: {
      icon: HelpCircle,
      text: 'Limited information available',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-500/10 dark:bg-gray-500/10',
      borderColor: 'border-gray-500/20 dark:border-gray-500/20',
      iconColor: 'text-gray-600 dark:text-gray-500',
      tooltip: 'Few sources found for this query. Consider rephrasing your question or checking the documentation directly'
    }
  }

  const { icon: Icon, text, color, bgColor, borderColor, iconColor, tooltip } = config[confidenceLevel]

  return (
    <div className="group relative inline-flex items-center gap-2 mt-4 mb-3">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor} ${borderColor}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className={`text-sm font-medium ${color}`}>
          {text}
        </span>
        <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
      </div>

      {/* Hover tooltip */}
      <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
        <p className="text-gray-200 mb-2">{tooltip}</p>
        <div className="pt-2 border-t border-gray-700">
          <div className="flex justify-between text-gray-400">
            <span>Based on:</span>
            <span className="font-medium text-white">
              {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
            </span>
          </div>
          <div className="flex justify-between text-gray-400 mt-1">
            <span>Confidence score:</span>
            <span className="font-medium text-white">{(confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preprocesses markdown content (currently minimal processing to avoid formatting issues)
const enhanceMarkdownContent = (content) => {
  if (!content) return content

  // Return content as-is - LLM should handle its own formatting
  // This prevents double-wrapping and formatting conflicts
  return content
}

function ChatInterface() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeView] = useState('chat') // 'dashboard' or 'chat'
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  // Default to null, will be set when projects load
  const [selectedProject, setSelectedProject] = useState(null)
  const [githubUrl, setGithubUrl] = useState('')
  const [isRepoLocked, setIsRepoLocked] = useState(false) // Track if repo input is locked after successful add
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [activeTabs, setActiveTabs] = useState({}) // Track active tab per message index
  const [indexingStatus, setIndexingStatus] = useState(null)
  const [copiedMessageId, setCopiedMessageId] = useState(null) // Track copied message
  const [editingMessageId, setEditingMessageId] = useState(null) // Track which message is being edited
  const [editedQuery, setEditedQuery] = useState('') // Store edited query text
  const [loadingStage, setLoadingStage] = useState(0) // Track loading animation stage
  const [conversationState, setConversationState] = useState(null) // Running summary state
  const [showFooter, setShowFooter] = useState(false) // Track footer visibility based on scroll
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messageRefs = useRef({}) // Store refs for each message
  const profileMenuRef = useRef(null) // Ref for profile dropdown

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

  // Note: Indexing status messages now stay until manually dismissed by user

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  // Show footer on scroll or when messages exist
  useEffect(() => {
    const handleScroll = () => {
      // On landing page: show footer as soon as user starts scrolling
      if (messages.length === 0) {
        if (window.scrollY > 10) {
          setShowFooter(true)
        } else {
          setShowFooter(false)
        }
      }
    }

    // Always show footer when there are messages (chat has started)
    if (messages.length > 0) {
      setShowFooter(true)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [messages.length])

  // Fetch available projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.listProjects(),
    refetchInterval: 30000, // Refetch every 30 seconds to keep list updated
  })

  // Fetch view count for dashboard footer
  const { data: viewCountData, refetch: refetchViewCount } = useQuery({
    queryKey: ['viewCount'],
    queryFn: () => api.getViewCount().then((res) => res.data),
    refetchInterval: 30000,
  })

  // Fetch user count for dashboard footer
  const { data: userCountData } = useQuery({
    queryKey: ['userCount'],
    queryFn: () => api.getUserCount().then((res) => res.data),
    refetchInterval: 30000,
  })

  // Fetch processed repository count for dashboard footer
  const { data: processedRepoCountData, refetch: refetchProcessedRepoCount } = useQuery({
    queryKey: ['processedRepoCount'],
    queryFn: () => api.getProcessedRepoCount().then((res) => res.data),
    refetchInterval: 30000,
  })

  // Record a view when the dashboard is used
  useEffect(() => {
    const trackView = async () => {
      try {
        await api.recordView()
        await refetchViewCount()
      } catch (error) {
        console.error('Failed to record view:', error)
      }
    }

    trackView()
  }, [refetchViewCount])

  const availableProjects = projectsData?.data?.projects || []

  const viewCount = viewCountData?.view_count ?? viewCountData?.count
  const userCount = userCountData?.count ?? userCountData?.user_count ?? null
  const processedRepoCount = processedRepoCountData?.processed_repo_count ?? processedRepoCountData?.count ?? null

  const trackProcessedRepository = async () => {
    try {
      await api.trackProcessedRepo()
      await refetchProcessedRepoCount()
    } catch (error) {
      console.error('Failed to track processed repository:', error)
    }
  }

  // Add repository and index mutation
  const addRepoMutation = useMutation({
    mutationFn: ({ githubUrl }) => api.addRepository(githubUrl),
    onSuccess: async (data, variables) => {
      try {
        const forceTrackProcessedRepo = variables?.forceTrackProcessedRepo ?? false
        const wasAlreadyIndexed = data?.data?.status === 'already_exists'

        // Check if repository already exists
        if (wasAlreadyIndexed) {
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
          setConversationState(null) // Reset conversation state
          setIsRepoLocked(true) // Lock the input after successful add
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
        setConversationState(null) // Reset conversation state
        setIsRepoLocked(true) // Lock the input after successful add

        if (forceTrackProcessedRepo || !wasAlreadyIndexed) {
          await trackProcessedRepository()
        }
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
    mutationFn: ({ projectId, query, conversationState }) =>
      api.query(projectId, query, { conversationState }),
    onSuccess: (data) => {
      // Update conversation state from response (running summary)
      if (data?.data?.conversation_state) {
        setConversationState(data.data.conversation_state)
      }
      // Backend now handles aggregation with Noisy OR and provides confidence labels
      const sources = data?.data?.sources || []

      // Filter out invalid sources (sources are already aggregated and deduplicated by backend)
      const validSources = sources.filter(source => source && source.file_path)

      const rawResponse = data?.data?.response || 'No response received'
      const entityHighlighted = highlightEntities(rawResponse)
      const styledResponse = highlightSustainabilityTerms(entityHighlighted)

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: rawResponse,
        formattedContent: styledResponse,
        sources: validSources,
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

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: query,
      timestamp: new Date()
    }])

    // Send query with conversation state (running summary)
    queryMutation.mutate({
      projectId: selectedProject,
      query,
      conversationState: conversationState
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

  const startRepositoryIndexing = (repoUrl, options = {}) => {
    const { forceTrackProcessedRepo = false } = options
    const trimmedRepo = repoUrl?.trim()
    if (!trimmedRepo) return
    setGithubUrl(trimmedRepo)
    setIndexingStatus({ status: 'loading', message: 'Scraping and indexing repository...' })
    addRepoMutation.mutate({ githubUrl: trimmedRepo, forceTrackProcessedRepo })
  }

  const handleAddRepository = (e) => {
    e.preventDefault()

    // If repo is locked, unlock it for editing (Change Repo behavior)
    if (isRepoLocked) {
      setIsRepoLocked(false)
      setGithubUrl('') // Clear the URL for new input
      setSelectedProject(null) // Clear selected project
      setMessages([]) // Clear chat messages
      setConversationState(null) // Reset conversation state
      setIndexingStatus(null) // Clear any status messages
      return
    }

    // Otherwise, add the repository
    startRepositoryIndexing(githubUrl)
  }

  const handleExampleSelect = (repoUrl) => {
    startRepositoryIndexing(repoUrl, { forceTrackProcessedRepo: true })
  }

  // Handler for project selection from dropdown
  const handleProjectSelect = (e) => {
    const projectId = e.target.value
    if (projectId) {
      setSelectedProject(projectId)
      setMessages([]) // Clear messages when switching projects
      setConversationState(null) // Reset conversation state
    }
  }

  // Handler for logout
  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  // Action handlers for Share, Export, Rewrite
  const handleShare = async (messageIdx) => {
    const msg = messages[messageIdx]
    if (!msg) return

    const shareText = `Question: ${msg.query}\n\nAnswer:\n${msg.content}\n\nSources:\n${msg.sources.map(s => `- ${s.file_path} (Confidence: ${s.confidence_label || 'Medium'})${s.chunk_count > 1 ? ` - ${s.chunk_count} chunks` : ''}`).join('\n')}`

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

    const markdown = `# Question\n${msg.query}\n\n## Answer\n${msg.content}\n\n## Sources\n${msg.sources.map(s => `- **${s.file_path}** (Confidence: ${s.confidence_label || 'Medium'})${s.chunk_count > 1 ? ` - ${s.chunk_count} chunks` : ''}`).join('\n')}\n\n---\nGenerated by RepoWise\n${new Date().toLocaleString()}`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `repowise-${Date.now()}.md`
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

    // Remove all messages from the editing point onward
    setMessages(prev => prev.slice(0, messageIdx))

    // Reset conversation state when editing (restart from that point)
    // The conversation will rebuild naturally from the new exchange
    setConversationState(null)

    // Add the new edited user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: editedQuery,
      timestamp: new Date()
    }])

    // Submit the new query with no conversation state (fresh start from edit point)
    queryMutation.mutate({
      projectId: selectedProject,
      query: editedQuery,
      conversationState: null
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
        'How can I start contributing?',
        'What is the license of this project?',
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
        'How can I start contributing?',
        'What are the required steps before submitting a pull request?',
        'What license does this project use?',
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
    const isProjectDoc = queryLower.includes('maintain') || queryLower.includes('contribut') ||
                         queryLower.includes('pull request') || queryLower.includes('security') ||
                         queryLower.includes('vote') || queryLower.includes('decision') ||
                         queryLower.includes('governance') || queryLower.includes('license') ||
                         queryLower.includes('readme') || queryLower.includes('documentation')

    const isCommits = queryLower.includes('commit') || queryLower.includes('contributor') ||
                      queryLower.includes('author') || queryLower.includes('code') ||
                      queryLower.includes('file') || queryLower.includes('change')

    const isIssues = queryLower.includes('issue') || queryLower.includes('bug') ||
                     queryLower.includes('ticket') || queryLower.includes('open') ||
                     queryLower.includes('closed') || queryLower.includes('report')

    // Context-specific loading stages
    if (isProjectDoc) {
      return [
        { icon: Search, text: "Searching project documentation...", color: "text-blue-400" },
        { icon: FileText, text: "Reading project documents...", color: "text-purple-400" },
        { icon: Shield, text: "Analyzing project content...", color: "text-emerald-400" },
        { icon: Sparkles, text: "Synthesizing insights...", color: "text-amber-400" }
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
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold dark:text-white text-gray-900">
                    RepoWise
                  </h1>
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

            <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-end">
              {/* Desktop: Inline form */}
              <form onSubmit={handleAddRepository} className="hidden md:flex gap-2 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  {/* Animated wave border wrapper */}
                  {availableProjects.length === 0 && !isRepoLocked && (
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
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
                      disabled={isRepoLocked}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${
                        isRepoLocked
                          ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-400'
                          : availableProjects.length === 0
                          ? 'bg-white/50 border-emerald-500/40 text-gray-900 placeholder-gray-500 dark:bg-gray-900/50 dark:border-emerald-400/30 dark:text-white'
                          : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 dark:bg-gray-900/50 dark:border-gray-800 dark:text-white'
                      }`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={(!githubUrl.trim() && !isRepoLocked) || addRepoMutation.isPending}
                  className={`px-3 sm:px-5 py-2.5 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 text-sm font-semibold shadow-lg hover:-translate-y-0.5 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 hover:shadow-emerald-500/30 ${
                    isRepoLocked ? 'animate-shimmer' : ''
                  }`}
                  style={isRepoLocked ? {
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1s ease-in-out'
                  } : {}}
                >
                  {isRepoLocked ? (
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
              </form>

              {/* Project Selector Dropdown */}
              {availableProjects.length > 0 && (
                <div className="relative min-w-[140px] sm:min-w-[220px]">
                  <select
                    value={selectedProject || ''}
                    onChange={handleProjectSelect}
                    className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-gray-900/50 border border-gray-800 dark:bg-gray-900/50 dark:border-gray-800 bg-white/50 border-gray-200 rounded-xl text-xs sm:text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer font-medium"
                  >
                    <option value="" disabled>Select a project</option>
                    {availableProjects.map((project) => (
                      <option key={project.id} value={project.id} className="dark:bg-gray-800 bg-white">
                        {project.name} ({project.owner})
                      </option>
                    ))}
                  </select>
                  <Github className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 pointer-events-none" />
                </div>
              )}

              {/* Theme Toggle */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* Authentication Status */}
              {isAuthenticated && user ? (
                <div ref={profileMenuRef} className="relative pl-2 sm:pl-3 border-l dark:border-gray-700 border-gray-200">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full
                             dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600
                             bg-gray-200 hover:bg-gray-300 border-2 border-gray-300
                             flex items-center justify-center
                             transition-all duration-200
                             hover:scale-105"
                    title={`${user.first_name} ${user.last_name}`}
                  >
                    <span className="text-xs sm:text-sm font-semibold dark:text-gray-200 text-gray-700">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48
                                  dark:bg-gray-800 dark:border-gray-700
                                  bg-white border border-gray-200
                                  rounded-xl shadow-xl z-50">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5
                                   dark:text-gray-300 dark:hover:bg-gray-700
                                   text-gray-700 hover:bg-gray-50
                                   transition-all duration-150 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pl-2 sm:pl-3 border-l dark:border-gray-700 border-gray-200">
                  <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5
                             border border-gray-300 dark:border-gray-600
                             text-gray-700 dark:text-gray-300
                             hover:border-emerald-500 hover:text-emerald-600
                             dark:hover:border-emerald-400 dark:hover:text-emerald-400
                             hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10
                             rounded-xl transition-all duration-200
                             text-xs sm:text-sm font-medium hover:-translate-y-0.5"
                  >
                    <UserCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Login</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Full-width form below navbar */}
          <form onSubmit={handleAddRepository} className="md:hidden mt-3 flex gap-2">
            <div className="relative flex-1">
              {/* Animated wave border wrapper for mobile */}
              {availableProjects.length === 0 && !isRepoLocked && (
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
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="github.com/owner/repo"
                  disabled={isRepoLocked}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${
                    isRepoLocked
                      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-400'
                      : availableProjects.length === 0
                      ? 'bg-white/50 border-emerald-500/40 text-gray-900 placeholder-gray-500 dark:bg-gray-900/50 dark:border-emerald-400/30 dark:text-white dark:placeholder-gray-400'
                      : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 dark:bg-gray-900/50 dark:border-gray-800 dark:text-white dark:placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={(!githubUrl.trim() && !isRepoLocked) || addRepoMutation.isPending}
              className={`px-4 py-2.5 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 text-sm font-semibold shadow-lg flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 ${
                isRepoLocked ? 'animate-shimmer' : ''
              }`}
              style={isRepoLocked ? {
                backgroundSize: '200% 100%',
                animation: 'shimmer 1s ease-in-out'
              } : {}}
            >
              {isRepoLocked ? (
                <RefreshCw className="w-4 h-4" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </form>

          {/* Indexing Status */}
          {indexingStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-3 p-4 rounded-xl border ${
                indexingStatus.status === 'success'
                  ? 'dark:bg-emerald-500/10 dark:border-emerald-500/20 bg-emerald-50 border-emerald-200'
                  : indexingStatus.status === 'error'
                  ? 'dark:bg-red-500/10 dark:border-red-500/20 bg-red-50 border-red-200'
                  : 'dark:bg-blue-500/10 dark:border-blue-500/20 bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {indexingStatus.status === 'loading' && (
                    <Loader2 className="w-5 h-5 animate-spin dark:text-blue-400 text-blue-600" />
                  )}
                  {indexingStatus.status === 'success' && (
                    <CheckCircle className="w-5 h-5 dark:text-emerald-400 text-emerald-600" />
                  )}
                  {indexingStatus.status === 'error' && (
                    <AlertCircle className="w-5 h-5 dark:text-red-400 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    indexingStatus.status === 'success'
                      ? 'dark:text-emerald-300 text-emerald-800'
                      : indexingStatus.status === 'error'
                      ? 'dark:text-red-300 text-red-800'
                      : 'dark:text-blue-300 text-blue-800'
                  }`}>
                    {indexingStatus.status === 'success' && 'Success!'}
                    {indexingStatus.status === 'error' && 'Error'}
                    {indexingStatus.status === 'loading' && 'Processing...'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    indexingStatus.status === 'success'
                      ? 'dark:text-emerald-400 text-emerald-700'
                      : indexingStatus.status === 'error'
                      ? 'dark:text-red-400 text-red-700'
                      : 'dark:text-blue-400 text-blue-700'
                  }`}>
                    {indexingStatus.message}
                  </p>
                  {indexingStatus.status === 'error' && (
                    <p className="text-xs dark:text-gray-500 text-gray-600 mt-2">
                      💡 Tip: Use format https://github.com/owner/repository
                    </p>
                  )}
                </div>
                {indexingStatus.status !== 'loading' && (
                  <button
                    onClick={() => setIndexingStatus(null)}
                    className="flex-shrink-0 p-1 dark:hover:bg-gray-800/50 hover:bg-gray-200/50 rounded transition-colors"
                  >
                    <X className="w-4 h-4 dark:text-gray-500 dark:hover:text-gray-300 text-gray-400 hover:text-gray-600" />
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
                className="text-center py-8"
              >
                <div className="inline-flex p-5 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-2xl border border-emerald-500/20 mb-4">
                  <Sparkles className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-xl font-medium dark:text-gray-400 text-gray-500 mb-8">
                  Where OSS exploration begins!
                </h2>
                <p className="text-base dark:text-gray-400 text-gray-600 max-w-2xl mx-auto mb-8">
                  {isAuthenticated && user ? (
                    selectedProject
                      ? `Hi ${user.first_name}, ask anything about this project's governance, contribution guidelines, commit, or issue tracking.`
                      : `Hi ${user.first_name}, enter a GitHub repository URL above to start exploring projects documents with AI.`
                  ) : (
                    selectedProject
                      ? "Ask anything about this project's governance, contribution guidelines, commit, or issue tracking."
                      : "Enter a GitHub repository URL above to start exploring projects documents with AI."
                  )}
                </p>

                {!selectedProject && (
                  <div className="max-w-6xl mx-auto">
                    <h3 className="text-sm font-medium dark:text-gray-400 text-gray-500 text-center mb-4">
                      Featured Repositories
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {EXAMPLE_REPOSITORIES.map((repo, idx) => (
                        <motion.button
                          key={repo.url}
                          type="button"
                          onClick={() => handleExampleSelect(repo.url)}
                          disabled={addRepoMutation.isPending}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="relative text-left w-full p-4 rounded-xl border h-44 flex flex-col
                                     dark:bg-gray-900/60 dark:border-gray-800 dark:hover:border-emerald-500 dark:hover:bg-gray-900
                                     bg-white border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30
                                     hover:scale-[1.02] hover:shadow-lg transition-all group disabled:opacity-60 cursor-pointer"
                        >
                          <h3 className="text-sm font-semibold dark:text-white text-gray-900 mb-2">{repo.name}</h3>
                          <p className="text-xs dark:text-gray-400 text-gray-600 mb-2 line-clamp-3 flex-1">{repo.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-1">
                            {repo.highlights.slice(0, 2).map(highlight => (
                              <span
                                key={highlight}
                                className="px-2 py-0.5 rounded-md text-xs font-medium
                                           dark:bg-gray-800/80 dark:text-gray-300
                                           bg-gray-100 text-gray-600"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                          {/* Hover action indicator */}
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                              <span>+ Add</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Questions - only show when project is indexed */}
                {selectedProject && (
                  <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
                    {[
                      { q: 'How can I start contributing?', icon: <Users className="w-4 h-4" /> },
                      { q: 'What are the required steps before submitting a pull request?', icon: <Code className="w-4 h-4" /> },
                      { q: 'What skills or tools do I need to contribute?', icon: <GitBranch className="w-4 h-4" /> },
                      { q: 'How do I report a bug?', icon: <Shield className="w-4 h-4" /> },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleSuggestion(item.q)}
                        className="flex items-center space-x-3 px-5 py-4
                                   dark:bg-gray-900/50 dark:hover:bg-gray-800/50 dark:border-gray-800 dark:hover:border-gray-700
                                   bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300
                                   rounded-xl transition-all text-left group shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 dark:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20
                                      bg-emerald-50 group-hover:bg-emerald-100
                                      rounded-lg transition-colors">
                          <div className="dark:text-emerald-400 text-emerald-600">
                            {item.icon}
                          </div>
                        </div>
                        <span className="text-sm dark:text-gray-300 dark:group-hover:text-white
                                       text-gray-700 group-hover:text-gray-900
                                       transition-colors">
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
                            className="w-full bg-gray-100 border border-emerald-500/50 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none dark:bg-gray-900/50 dark:text-white dark:border-emerald-500/50"
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
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              Cancel
                            </button>
                            <span className="text-xs text-gray-600 ml-2 dark:text-gray-500">
                              Press Enter to submit · Esc to cancel
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-base font-normal dark:text-white/90 text-gray-900" style={{ lineHeight: '1.7' }}>
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {msg.type === 'assistant' && (
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex items-center space-x-1 border-b dark:border-gray-800 border-gray-200">
                      {['answer', 'sources'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTabs({...activeTabs, [idx]: tab})}
                          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            (activeTabs[idx] || 'answer') === tab
                              ? 'text-emerald-500'
                              : 'dark:text-gray-500 dark:hover:text-gray-300 text-gray-600 hover:text-gray-900'
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
                        <div className="prose dark:prose-invert prose-lg max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={{
                              p: ({ children }) => (
                                <p className="text-base dark:text-gray-300 text-gray-800 mb-5 leading-relaxed" style={{ lineHeight: '1.75' }}>{children}</p>
                              ),
                              a: ({ children, href }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-blue-600/40 hover:decoration-blue-600/80 dark:decoration-blue-400/40 dark:hover:decoration-blue-400/80 decoration-1 underline-offset-2 transition-all duration-200 font-medium"
                                >
                                  {children}
                                </a>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-6 mt-2">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-5 mt-8">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-4 mt-6">{children}</h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="space-y-2.5 mb-5 pl-6 list-disc marker:text-emerald-500 dark:marker:text-emerald-400">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="space-y-2.5 mb-5 pl-6 list-decimal marker:text-emerald-500 dark:marker:text-emerald-400">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="dark:text-gray-300 text-gray-800 leading-relaxed pl-2">{children}</li>
                              ),
                              code: ({ node, inline, children, ...props }) => {
                                if (inline) {
                                  return (
                                    <code className="px-2 py-0.5 dark:bg-gray-800/80 dark:text-emerald-400 bg-emerald-50 text-emerald-700 rounded-md text-[0.9em] font-mono border dark:border-gray-700/50 border-emerald-200/50" {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                                return (
                                  <code className="block dark:bg-gray-900/50 dark:text-gray-300 bg-gray-50 text-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono border dark:border-gray-800 border-gray-200 my-4" {...props}>
                                    {children}
                                  </code>
                                )
                              },
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-emerald-500 dark:border-emerald-400 pl-4 py-2 italic dark:text-gray-400 text-gray-600 my-5 dark:bg-gray-900/30 bg-gray-50/50 rounded-r-lg">
                                  {children}
                                </blockquote>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold dark:text-white text-gray-900">{children}</strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic dark:text-gray-300 text-gray-700">{children}</em>
                              ),
                            }}
                          >
                            {enhanceMarkdownContent(msg.formattedContent || msg.content)}
                          </ReactMarkdown>
                        </div>

                        {/* Source Cards */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm dark:text-gray-500 text-gray-600 flex-wrap">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">Sources</span>
                              <span className="dark:text-gray-600 text-gray-400">·</span>
                              <span>{msg.sources.length} {msg.sources.length === 1 ? 'document' : 'documents'}</span>

                              {/* Inline Confidence Indicator */}
                              {msg.metadata?.answer_confidence !== undefined && (() => {
                                const conf = msg.metadata.answer_confidence
                                const level = conf >= 0.8 ? 'high' : conf >= 0.5 ? 'moderate' : 'limited'
                                const config = {
                                  high: {
                                    bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
                                    text: 'text-emerald-600 dark:text-emerald-400',
                                    border: 'border border-emerald-500/20',
                                    icon: CheckCircle,
                                    tooltip: 'Well-supported by authoritative sources'
                                  },
                                  moderate: {
                                    bg: 'bg-amber-500/10 dark:bg-amber-500/10',
                                    text: 'text-amber-600 dark:text-amber-400',
                                    border: 'border border-amber-500/20',
                                    icon: AlertCircle,
                                    tooltip: 'Based on available sources, may benefit from verification'
                                  },
                                  limited: {
                                    bg: 'bg-gray-500/10 dark:bg-gray-500/10',
                                    text: 'text-gray-600 dark:text-gray-400',
                                    border: 'border border-gray-500/20',
                                    icon: HelpCircle,
                                    tooltip: 'Limited sources found, consider rephrasing query'
                                  }
                                }
                                const { bg, text, border, icon: Icon, tooltip } = config[level]
                                const labels = { high: 'High', moderate: 'Moderate', limited: 'Limited' }

                                return (
                                  <>
                                    <span className="dark:text-gray-600 text-gray-400">·</span>
                                    <div
                                      className={`group relative flex items-center gap-1 px-2 py-0.5 rounded ${bg} ${border}`}
                                      title={tooltip}
                                    >
                                      <Icon className={`w-3 h-3 ${text}`} />
                                      <span className={`text-xs font-medium ${text}`}>
                                        {labels[level]} Confidence
                                      </span>
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {msg.sources.map((source, i) => {
                                // Get confidence styles based on confidence label from backend
                                const getConfidenceBorderColor = (label) => {
                                  switch (label) {
                                    case 'Very High': return 'border-emerald-500/20'
                                    case 'High': return 'border-blue-500/20'
                                    case 'Medium': return 'border-amber-500/20'
                                    case 'Low': return 'border-red-500/20'
                                    default: return 'border-gray-500/20'
                                  }
                                }

                                const getConfidenceBg = (label) => {
                                  switch (label) {
                                    case 'Very High': return 'bg-emerald-500/10'
                                    case 'High': return 'bg-blue-500/10'
                                    case 'Medium': return 'bg-amber-500/10'
                                    case 'Low': return 'bg-red-500/10'
                                    default: return 'bg-gray-500/10'
                                  }
                                }

                                const borderColor = getConfidenceBorderColor(source.confidence_label)
                                const bgColor = getConfidenceBg(source.confidence_label)

                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer
                                             dark:bg-gray-900/30 dark:hover:bg-gray-800/50 dark:border-gray-800/50 dark:hover:border-gray-700
                                             bg-gray-50/50 hover:bg-gray-100/80 border border-gray-200/50 hover:border-gray-300
                                             ${i === 0 ? 'border-l-2 !border-l-emerald-500 dark:bg-emerald-950/5' : ''}`}
                                  >
                                    <div className={`flex-shrink-0 p-1.5 ${bgColor} rounded border ${borderColor}`}>
                                      {getSourceIcon(source.file_type)}
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium dark:text-white text-gray-900 truncate">
                                          {source.file_path.split('/').pop()}
                                        </h4>
                                        <p className="text-xs dark:text-gray-500 text-gray-600 truncate mt-0.5">
                                          {source.file_path}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {/* Primary source badge for first source */}
                                        {i === 0 && (
                                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-medium whitespace-nowrap">
                                            Primary
                                          </span>
                                        )}
                                        {/* File type badge */}
                                        {source.file_type && (
                                          <span className="px-1.5 py-0.5 dark:bg-gray-800/50 dark:text-gray-400 bg-gray-200/50 text-gray-700 rounded text-[10px] capitalize font-medium whitespace-nowrap">
                                            {source.file_type.replace('_', ' ')}
                                          </span>
                                        )}
                                        {/* Chunk count (only if > 1) */}
                                        {source.chunk_count && source.chunk_count > 1 && (
                                          <span className="text-[10px] dark:text-gray-500 text-gray-600 whitespace-nowrap">
                                            {source.chunk_count} {source.chunk_count === 1 ? 'section' : 'sections'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 pt-3 border-t dark:border-gray-800/50 border-gray-200/50">
                          <button
                            onClick={() => handleShare(idx)}
                            data-tooltip={copiedMessageId === idx ? "Copied!" : "Copy"}
                            className="group relative p-2 rounded-lg transition-all
                                     dark:hover:bg-gray-800/50 hover:bg-gray-100
                                     dark:text-gray-500 dark:hover:text-gray-300
                                     text-gray-500 hover:text-gray-700"
                          >
                            {copiedMessageId === idx ? (
                              <Check className="w-4 h-4 dark:text-emerald-400 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium
                                           dark:bg-gray-900 bg-gray-800 text-white rounded
                                           opacity-0 group-hover:opacity-100 pointer-events-none
                                           transition-opacity duration-200 whitespace-nowrap">
                              {copiedMessageId === idx ? "Copied!" : "Copy"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleExport(idx)}
                            data-tooltip="Download"
                            className="group relative p-2 rounded-lg transition-all
                                     dark:hover:bg-gray-800/50 hover:bg-gray-100
                                     dark:text-gray-500 dark:hover:text-gray-300
                                     text-gray-500 hover:text-gray-700"
                          >
                            <Download className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium
                                           dark:bg-gray-900 bg-gray-800 text-white rounded
                                           opacity-0 group-hover:opacity-100 pointer-events-none
                                           transition-opacity duration-200 whitespace-nowrap">
                              Download
                            </span>
                          </button>
                          <button
                            onClick={() => handleEdit(idx)}
                            disabled={editingMessageId !== null && editingMessageId !== idx - 1}
                            data-tooltip="Edit"
                            className="group relative p-2 rounded-lg transition-all
                                     dark:hover:bg-gray-800/50 hover:bg-gray-100
                                     dark:text-gray-500 dark:hover:text-gray-300
                                     text-gray-500 hover:text-gray-700
                                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium
                                           dark:bg-gray-900 bg-gray-800 text-white rounded
                                           opacity-0 group-hover:opacity-100 pointer-events-none
                                           transition-opacity duration-200 whitespace-nowrap">
                              Edit
                            </span>
                          </button>
                        </div>

                        {/* Related Questions - Use API suggestions if available, fallback to hardcoded */}
                        <div className="space-y-3 pt-4">
                          <div className="flex items-center space-x-2 text-sm dark:text-gray-500 text-gray-600">
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
                                  className="w-full flex items-center justify-between px-4 py-3
                                           dark:bg-gray-900/30 dark:hover:bg-gray-800/50 dark:border-gray-800/50 dark:hover:border-gray-700
                                           bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300
                                           rounded-lg transition-all text-left group"
                                >
                                  <span className="text-sm dark:text-gray-400 dark:group-hover:text-gray-300
                                                 text-gray-700 group-hover:text-gray-900">
                                    {question}
                                  </span>
                                  <ExternalLink className="w-3 h-3 dark:text-gray-600 dark:group-hover:text-gray-500
                                                         text-gray-400 group-hover:text-gray-600" />
                                </button>
                              ))
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sources Tab */}
                    {(activeTabs[idx] || 'answer') === 'sources' && msg.sources && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm dark:text-gray-500 text-gray-600 flex-wrap">
                          <span>
                            {msg.sources.length} source {msg.sources.length === 1 ? 'document' : 'documents'} referenced
                          </span>

                          {/* Inline Confidence Indicator */}
                          {msg.metadata?.answer_confidence !== undefined && (() => {
                            const conf = msg.metadata.answer_confidence
                            const level = conf >= 0.8 ? 'high' : conf >= 0.5 ? 'moderate' : 'limited'
                            const config = {
                              high: {
                                bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
                                text: 'text-emerald-600 dark:text-emerald-400',
                                border: 'border border-emerald-500/20',
                                icon: CheckCircle,
                                tooltip: 'Well-supported by authoritative sources'
                              },
                              moderate: {
                                bg: 'bg-amber-500/10 dark:bg-amber-500/10',
                                text: 'text-amber-600 dark:text-amber-400',
                                border: 'border border-amber-500/20',
                                icon: AlertCircle,
                                tooltip: 'Based on available sources, may benefit from verification'
                              },
                              limited: {
                                bg: 'bg-gray-500/10 dark:bg-gray-500/10',
                                text: 'text-gray-600 dark:text-gray-400',
                                border: 'border border-gray-500/20',
                                icon: HelpCircle,
                                tooltip: 'Limited sources found, consider rephrasing query'
                              }
                            }
                            const { bg, text, border, icon: Icon, tooltip } = config[level]
                            const labels = { high: 'High', moderate: 'Moderate', limited: 'Limited' }

                            return (
                              <>
                                <span className="dark:text-gray-600 text-gray-400">·</span>
                                <div
                                  className={`group relative flex items-center gap-1 px-2 py-0.5 rounded ${bg} ${border}`}
                                  title={tooltip}
                                >
                                  <Icon className={`w-3 h-3 ${text}`} />
                                  <span className={`text-xs font-medium ${text}`}>
                                    {labels[level]} Confidence
                                  </span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                        {msg.sources.map((source, i) => {
                          // Get confidence styles based on confidence label from backend
                          const getConfidenceBorderColor = (label) => {
                            switch (label) {
                              case 'Very High': return 'border-emerald-500/20'
                              case 'High': return 'border-blue-500/20'
                              case 'Medium': return 'border-amber-500/20'
                              case 'Low': return 'border-red-500/20'
                              default: return 'border-gray-500/20'
                            }
                          }

                          const getConfidenceBg = (label) => {
                            switch (label) {
                              case 'Very High': return 'bg-emerald-500/10'
                              case 'High': return 'bg-blue-500/10'
                              case 'Medium': return 'bg-amber-500/10'
                              case 'Low': return 'bg-red-500/10'
                              default: return 'bg-gray-500/10'
                            }
                          }

                          const borderColor = getConfidenceBorderColor(source.confidence_label)
                          const bgColor = getConfidenceBg(source.confidence_label)

                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer
                                       dark:bg-gray-900/30 dark:hover:bg-gray-800/50 dark:border-gray-800/50 dark:hover:border-gray-700
                                       bg-gray-50/50 hover:bg-gray-100/80 border border-gray-200/50 hover:border-gray-300
                                       ${i === 0 ? 'border-l-2 !border-l-emerald-500 dark:bg-emerald-950/5' : ''}`}
                            >
                              <div className={`flex-shrink-0 p-1.5 ${bgColor} rounded border ${borderColor}`}>
                                {getSourceIcon(source.file_type)}
                              </div>
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium dark:text-white text-gray-900 truncate">
                                    {source.file_path.split('/').pop()}
                                  </h4>
                                  <p className="text-xs dark:text-gray-500 text-gray-600 truncate mt-0.5">
                                    {source.file_path}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {/* Primary source badge for first source */}
                                  {i === 0 && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-medium whitespace-nowrap">
                                      Primary
                                    </span>
                                  )}
                                  {/* File type badge */}
                                  {source.file_type && (
                                    <span className="px-1.5 py-0.5 dark:bg-gray-800/50 dark:text-gray-400 bg-gray-200/50 text-gray-700 rounded text-[10px] capitalize font-medium whitespace-nowrap">
                                      {source.file_type.replace('_', ' ')}
                                    </span>
                                  )}
                                  {/* Chunk count (only if > 1) */}
                                  {source.chunk_count && source.chunk_count > 1 && (
                                    <span className="text-[10px] dark:text-gray-500 text-gray-600 whitespace-nowrap">
                                      {source.chunk_count} {source.chunk_count === 1 ? 'section' : 'sections'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
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
                  <div className="relative overflow-hidden p-6
                                dark:bg-gradient-to-br dark:from-gray-900/50 dark:to-gray-900/30 dark:border-gray-800
                                bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200
                                rounded-2xl shadow-xl">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />

                    <div className="relative space-y-4">
                      {/* Current Stage Display */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse" />
                            <div className="relative p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl
                                          dark:border-emerald-500/30 border-2 border-emerald-400/40">
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
                              <p className="text-base font-medium dark:text-white text-gray-900">
                                {currentStage.text}
                              </p>
                            </motion.div>
                          </AnimatePresence>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex space-x-1">
                              {loadingStages.map((_, idx) => (
                                <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${
                                  idx === loadingStage ? 'w-8 bg-gradient-to-r from-emerald-500 to-blue-500'
                                  : idx < loadingStage ? 'w-4 bg-emerald-500/50' : 'w-4 dark:bg-gray-700 bg-gray-300'
                                }`} />
                              ))}
                            </div>
                            <span className="text-xs dark:text-gray-500 text-gray-600">
                              Step {loadingStage + 1} of {loadingStages.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Timeline */}
                      <div className="grid grid-cols-4 gap-3 pt-4 dark:border-gray-800/50 border-gray-200 border-t">
                        {loadingStages.map((stage, idx) => {
                          const StageIcon = stage.icon
                          const isCompleted = idx < loadingStage
                          const isCurrent = idx === loadingStage

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                ...(isCurrent && {
                                  boxShadow: [
                                    '0 0 0px rgba(16, 185, 129, 0)',
                                    '0 0 20px rgba(16, 185, 129, 0.4)',
                                    '0 0 0px rgba(16, 185, 129, 0)',
                                  ]
                                })
                              }}
                              transition={{
                                delay: idx * 0.1,
                                boxShadow: {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }
                              }}
                              className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-300 ${
                                isCurrent
                                  ? 'dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-blue-500/20 dark:border-2 dark:border-emerald-500/60 dark:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]'
                                  : isCompleted
                                  ? 'dark:bg-gray-900/60 dark:border dark:border-emerald-500/40 bg-white border-2 border-emerald-200 shadow-sm'
                                  : 'dark:bg-gray-900/50 dark:border dark:border-gray-700/50 bg-white border-2 border-gray-200 shadow-sm'
                              }`}
                            >
                              <motion.div
                                animate={isCurrent ? {
                                  scale: [1, 1.1, 1],
                                } : {}}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className={`p-2 rounded-lg ${
                                  isCurrent
                                    ? 'bg-gradient-to-br from-emerald-500/30 to-blue-500/30 dark:shadow-[0_0_15px_rgba(16,185,129,0.4)] shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                    : isCompleted
                                    ? 'dark:bg-emerald-500/20 bg-emerald-100'
                                    : 'dark:bg-gray-800/50 bg-gray-100'
                                }`}>
                                <StageIcon className={`w-4 h-4 transition-all ${
                                  isCurrent
                                    ? `${stage.color} drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]`
                                    : isCompleted
                                    ? 'dark:text-emerald-400 text-emerald-600'
                                    : 'dark:text-gray-600 text-gray-400'
                                }`} />
                              </motion.div>
                              <span className={`text-xs text-center font-medium transition-all ${
                                isCurrent
                                  ? 'dark:text-emerald-300 text-emerald-700 dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                  : isCompleted
                                  ? 'dark:text-emerald-400 text-emerald-600'
                                  : 'dark:text-gray-500 text-gray-600'
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
      <div className="sticky bottom-0 dark:bg-gradient-to-t dark:from-[#0f0f0f] dark:via-[#0f0f0f] dark:to-transparent
                      bg-gradient-to-t from-white via-white to-transparent pt-8 pb-6">
        <div className="max-w-5xl mx-auto px-6">
          <form onSubmit={handleSendQuery} className="relative">
            <div className="flex items-end space-x-3 p-4
                          dark:bg-gray-900/80 dark:border-2 dark:border-gray-700
                          bg-white border-2 border-gray-200
                          backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-300
                          focus-within:dark:border-emerald-500 focus-within:dark:shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)]
                          focus-within:border-emerald-500 focus-within:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]
                          hover:dark:border-gray-600 hover:border-gray-300">
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
                  className="w-full bg-transparent border-0 focus:outline-none resize-none
                           dark:text-gray-100 dark:placeholder-gray-500
                           text-gray-900 placeholder-gray-400
                           text-base disabled:opacity-50 max-h-32 disabled:cursor-not-allowed overflow-y-auto"
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
              <div className="flex items-center space-x-4 text-xs dark:text-gray-500 text-gray-600">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>Powered by Mistral 7b</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <GitBranch className="w-3 h-3" />
                  <span>RAG-Enhanced Responses</span>
                </div>
              </div>
              <span className="text-xs dark:text-gray-500 text-gray-600">
                Press Enter to send · Shift+Enter for new line
              </span>
            </div>
          </form>
        </div>
      </div>
      )}

        {showFooter && (
        <footer className="bg-white/80 dark:bg-[#090909]/80 border-t border-gray-200 dark:border-gray-800 transition-opacity duration-300">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <p>
            Developed at the DECAL Lab, in the CS Department,{" "}
            <a
              href="https://www.ucdavis.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 dark:text-sky-300 hover:font-semibold transition-colors"
            >
              UC Davis
            </a>, by{" "}
            <a
              href="https://www.linkedin.com/in/sankalp-kashyap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 dark:text-sky-300 hover:font-semibold transition-colors"
            >
              Sankalp Kashyap
            </a>,{" "}
            <a
              href="https://www.linkedin.com/in/arjashok"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 dark:text-sky-300 hover:font-semibold transition-colors"
            >
              Arjun Ashok
            </a>,{" "}
            <a
              href="https://nafiz43.github.io/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 dark:text-sky-300 hover:font-semibold transition-colors"
            >
              Nafiz Imtiaz Khan
            </a>, and{" "}
            <a
              href="https://www.cs.ucdavis.edu/~filkov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 dark:text-sky-300 hover:font-semibold transition-colors"
            >
              Vladimir Filkov
            </a>

          </p>
          <p className="text-gray-500 dark:text-gray-500">
            RepoWise keeps open-source intelligence playful and purposeful; discover more at{' '}
            <a
              href="https://repowise.github.io/RepoWise-website/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-sky-400 dark:text-sky-300 hover:font-semibold transition-colors"
            >
              repowise.github.io
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 dark:text-gray-500">
            <span>RepoWise Views: {viewCount ?? '—'}</span>
            <span className="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true"></span>
            <span>RepoWise Users: {userCount ?? '—'}</span>
            <span className="h-4 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true"></span>
            <span>Processed Repo Count: {processedRepoCount ?? '—'}</span>
          </div>
        </div>
      </footer>
        )}

    </div>
  )
}

export default ChatInterface
