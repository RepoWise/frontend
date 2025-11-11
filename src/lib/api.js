/**
 * API Client for RepoWise Backend
 */
import axios from 'axios';

// Use environment variable for production, fallback to /api for dev proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for LLM queries
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Functions
export const api = {
  // Health & Status
  healthCheck: () => apiClient.get('/health'),
  getSystemStatus: () => apiClient.get('/system-status'),
  getStats: () => apiClient.get('/stats'),

  // Projects
  listProjects: () => apiClient.get('/projects'),
  getProject: (projectId) => apiClient.get(`/projects/${projectId}`),

  // Governance Crawling
  crawlGovernance: (projectId, useCache = true) =>
    apiClient.post(`/crawl/${projectId}`, null, { params: { use_cache: useCache } }),
  getGovernanceData: (projectId) => apiClient.get(`/governance/${projectId}`),
  deleteProjectIndex: (projectId) => apiClient.delete(`/projects/${projectId}/index`),

  // Add custom repository
  addRepository: (githubUrl) =>
    apiClient.post('/projects/add', { github_url: githubUrl }),

  // RAG & Query
  query: (projectId, query, options = {}) =>
    apiClient.post('/query', {
      project_id: projectId,
      query,
      max_results: options.maxResults || 5,
      temperature: options.temperature || 0.3,
      stream: false,
      conversation_history: options.conversationHistory || null,
    }),

  search: (query, options = {}) =>
    apiClient.post('/search', {
      query,
      project_id: options.projectId || null,
      n_results: options.nResults || 5,
      file_types: options.fileTypes || null,
    }),
};

export default api;
