import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import {
  Activity, Users, GitBranch, TrendingUp, Zap, Shield, BookOpen,
  Clock, CheckCircle, AlertCircle, FileText, Code, Network,
  Sparkles, BarChart3, PieChart as PieChartIcon, LineChartIcon,
  Server, Database, Cpu, Brain
} from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
const AGENT_COLORS = {
  'Agent 0: General LLM': '#10b981',
  'Agent 1: Governance RAG': '#3b82f6',
  'Agent 2: Code Collaboration GraphRAG': '#8b5cf6',
  'Agent 3: Forecaster': '#f59e0b',
  'Agent 4: Recommendations': '#ef4444'
}

export function Dashboard({ selectedProject }) {
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [timeRange, setTimeRange] = useState('24h')

  // Fetch system status
  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: api.getSystemStatus,
    refetchInterval: 5000 // Refresh every 5s
  })

  // Fetch agentic stats
  const { data: agenticStats } = useQuery({
    queryKey: ['agenticStats'],
    queryFn: api.getAgenticStats,
    refetchInterval: 5000
  })

  // Mock data for visualization (replace with real API calls)
  const performanceData = [
    { time: '00:00', queries: 45, latency: 234, success: 98 },
    { time: '04:00', queries: 32, latency: 189, success: 100 },
    { time: '08:00', queries: 78, latency: 312, success: 96 },
    { time: '12:00', queries: 125, latency: 245, success: 99 },
    { time: '16:00', queries: 95, latency: 198, success: 100 },
    { time: '20:00', queries: 67, latency: 221, success: 98 },
  ]

  const agentDistribution = agenticStats?.agents ? Object.entries(agenticStats.agents).map(([key, value]) => ({
    name: value.split(':')[1]?.trim() || value,
    value: Math.floor(Math.random() * 100) + 20, // Mock data
    fullName: value
  })) : []

  const intentData = [
    { name: 'General', value: 450, color: COLORS[0] },
    { name: 'Governance', value: 320, color: COLORS[1] },
    { name: 'Code Collab', value: 180, color: COLORS[2] },
    { name: 'Forecasting', value: 95, color: COLORS[3] },
    { name: 'Recommendations', value: 140, color: COLORS[4] },
  ]

  const networkStats = {
    developers: 1528,
    collaborations: 1097579,
    files: 4652,
    commits: 7987,
    density: 0.94
  }

  const metrics = [
    {
      title: 'Total Queries',
      value: '12.5K',
      change: '+23.5%',
      trend: 'up',
      icon: <Activity className="w-5 h-5" />,
      color: 'emerald'
    },
    {
      title: 'Avg Response Time',
      value: '245ms',
      change: '-12.3%',
      trend: 'up',
      icon: <Zap className="w-5 h-5" />,
      color: 'blue'
    },
    {
      title: 'Success Rate',
      value: '98.7%',
      change: '+2.1%',
      trend: 'up',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'purple'
    },
    {
      title: 'Active Agents',
      value: '5/5',
      change: '100%',
      trend: 'up',
      icon: <Brain className="w-5 h-5" />,
      color: 'orange'
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time insights into your OSS intelligence platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => refetchStatus()}
              className="px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-${metric.color}-500/10 rounded-lg`}>
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className={`w-3 h-3 ${metric.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
                  <span className={metric.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-sm text-gray-400">{metric.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart - Spans 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-emerald-500" />
                  Query Performance
                </h2>
                <p className="text-sm text-gray-400 mt-1">Response time and query volume over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="queries" stroke="#10b981" fillOpacity={1} fill="url(#colorQueries)" />
                <Area type="monotone" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Agent Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              Agent Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={agentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {agentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Intent Classification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Intent Classification
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={intentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {intentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Developer Network Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-500" />
              Developer Network Metrics
            </h2>
            <div className="space-y-6">
              {[
                { label: 'Total Developers', value: networkStats.developers.toLocaleString(), icon: Users, color: 'emerald' },
                { label: 'Collaborations', value: networkStats.collaborations.toLocaleString(), icon: GitBranch, color: 'blue' },
                { label: 'Files Analyzed', value: networkStats.files.toLocaleString(), icon: FileText, color: 'purple' },
                { label: 'Total Commits', value: networkStats.commits.toLocaleString(), icon: Code, color: 'orange' },
                { label: 'Network Density', value: (networkStats.density * 100).toFixed(1) + '%', icon: Activity, color: 'pink' },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-${stat.color}-500/10 rounded-lg`}>
                      <stat.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-gray-400">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-500" />
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusData?.data?.rag?.stats && [
              { label: 'Indexed Documents', value: statusData.data.rag.stats.document_count?.toLocaleString() || '0', icon: Database },
              { label: 'Embedding Model', value: statusData.data.config.embedding_model?.split('/').pop() || 'N/A', icon: Cpu },
              { label: 'LLM Model', value: statusData.data.config.llm_model || 'N/A', icon: Brain },
              { label: 'System Status', value: statusData.data.status || 'Unknown', icon: Shield },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <item.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="text-lg font-semibold text-white truncate max-w-[150px]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Agents Status */}
        {agenticStats?.agents && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Active Intelligent Agents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(agenticStats.agents).map(([key, name], idx) => (
                <div key={idx} className="p-5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-500 font-medium">ACTIVE</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{name}</h3>
                  <p className="text-xs text-gray-400">Ready to serve queries</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
