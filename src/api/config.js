// API Configuration
const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  
  // API Version
  VERSION: 'v1',
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 1000,
    backoff: 2
  },
  
  // Rate limiting
  RATE_LIMIT: {
    requests: 100,
    window: 60000 // 1 minute
  },
  
  // Endpoints
  ENDPOINTS: {
    // SEO Audit endpoints
    AUDIT: {
      CREATE: '/audit',
      GET: '/audit/:id',
      LIST: '/audit',
      UPDATE: '/audit/:id',
      DELETE: '/audit/:id',
      BULK_CREATE: '/audit/bulk',
      EXPORT: '/audit/export'
    },
    
    // Lead Management endpoints
    LEADS: {
      CREATE: '/leads',
      GET: '/leads/:id',
      LIST: '/leads',
      UPDATE: '/leads/:id',
      DELETE: '/leads/:id',
      BULK_UPDATE: '/leads/bulk',
      EXPORT: '/leads/export',
      ANALYTICS: '/leads/analytics'
    },
    
    // User Management endpoints
    USERS: {
      CREATE: '/users',
      GET: '/users/:id',
      LIST: '/users',
      UPDATE: '/users/:id',
      DELETE: '/users/:id',
      AUTH: '/users/auth',
      PROFILE: '/users/profile'
    },
    
    // Reports endpoints
    REPORTS: {
      CREATE: '/reports',
      GET: '/reports/:id',
      LIST: '/reports',
      UPDATE: '/reports/:id',
      DELETE: '/reports/:id',
      GENERATE_PDF: '/reports/:id/pdf',
      EMAIL: '/reports/:id/email'
    },
    
    // Analytics endpoints
    ANALYTICS: {
      DASHBOARD: '/analytics/dashboard',
      METRICS: '/analytics/metrics',
      TRENDS: '/analytics/trends',
      EXPORT: '/analytics/export'
    },
    
    // Settings endpoints
    SETTINGS: {
      GET: '/settings',
      UPDATE: '/settings',
      THEMES: '/settings/themes',
      INTEGRATIONS: '/settings/integrations'
    },
    
    // Webhooks endpoints
    WEBHOOKS: {
      CREATE: '/webhooks',
      GET: '/webhooks/:id',
      LIST: '/webhooks',
      UPDATE: '/webhooks/:id',
      DELETE: '/webhooks/:id',
      TEST: '/webhooks/:id/test'
    }
  }
}

export default API_CONFIG
