// API Services Index - Centralized API access
import auditService from './services/auditService'
import leadService from './services/leadService'
import reportService from './services/reportService'
import analyticsService from './services/analyticsService'
import userService from './services/userService'
import apiClient from './client'
import API_CONFIG from './config'

// Export all services
export {
  auditService,
  leadService,
  reportService,
  analyticsService,
  userService,
  apiClient,
  API_CONFIG
}

// Export default API object
const API = {
  // Services
  audit: auditService,
  leads: leadService,
  reports: reportService,
  analytics: analyticsService,
  users: userService,
  
  // Client
  client: apiClient,
  config: API_CONFIG,
  
  // Utility methods
  healthCheck: () => apiClient.healthCheck(),
  
  // Batch operations
  batch: (requests) => apiClient.batch(requests),
  
  // File upload
  upload: (endpoint, file, params, onProgress) => 
    apiClient.upload(endpoint, file, params, onProgress)
}

export default API
