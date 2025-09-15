// API Client with advanced features
import API_CONFIG from './config'

class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.retryConfig = API_CONFIG.RETRY
    this.rateLimit = API_CONFIG.RATE_LIMIT
    this.requestQueue = []
    this.isProcessing = false
    this.requestCount = 0
    this.windowStart = Date.now()
  }

  // Build full URL
  buildURL(endpoint, params = {}) {
    let url = `${this.baseURL}${endpoint}`
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, params[key])
        delete params[key]
      }
    })
    
    // Add query parameters
    const queryString = new URLSearchParams(params).toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    return url
  }

  // Get headers for requests
  getHeaders(customHeaders = {}) {
    const token = localStorage.getItem('auth_token')
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-Version': API_CONFIG.VERSION,
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0'
    }

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    return { ...defaultHeaders, ...customHeaders }
  }

  // Rate limiting check
  checkRateLimit() {
    const now = Date.now()
    
    // Reset counter if window has passed
    if (now - this.windowStart > this.rateLimit.window) {
      this.requestCount = 0
      this.windowStart = now
    }
    
    if (this.requestCount >= this.rateLimit.requests) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    
    this.requestCount++
  }

  // Retry logic
  async retry(fn, attempt = 1) {
    try {
      return await fn()
    } catch (error) {
      if (attempt < this.retryConfig.attempts && this.shouldRetry(error)) {
        const delay = this.retryConfig.delay * Math.pow(this.retryConfig.backoff, attempt - 1)
        await this.sleep(delay)
        return this.retry(fn, attempt + 1)
      }
      throw error
    }
  }

  // Check if error should trigger retry
  shouldRetry(error) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    const retryableErrors = ['NetworkError', 'TimeoutError']
    
    return retryableStatuses.includes(error.status) || 
           retryableErrors.includes(error.name) ||
           error.message.includes('timeout')
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Process request queue
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return
    
    this.isProcessing = true
    
    while (this.requestQueue.length > 0) {
      const { resolve, reject, request } = this.requestQueue.shift()
      
      try {
        const result = await this.makeRequest(request)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    
    this.isProcessing = false
  }

  // Queue request for rate limiting
  queueRequest(request) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, request })
      this.processQueue()
    })
  }

  // Make HTTP request
  async makeRequest({ method, url, data, headers, timeout = this.timeout }) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }
      
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return await response.text()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408)
      }
      
      throw error
    }
  }

  // Generic request method
  async request(method, endpoint, data = null, params = {}, options = {}) {
    this.checkRateLimit()
    
    const url = this.buildURL(endpoint, params)
    const request = { method, url, data, ...options }
    
    if (this.requestQueue.length > 0) {
      return this.queueRequest(request)
    }
    
    return this.retry(() => this.makeRequest(request))
  }

  // HTTP Methods
  async get(endpoint, params = {}, options = {}) {
    return this.request('GET', endpoint, null, params, options)
  }

  async post(endpoint, data = null, params = {}, options = {}) {
    return this.request('POST', endpoint, data, params, options)
  }

  async put(endpoint, data = null, params = {}, options = {}) {
    return this.request('PUT', endpoint, data, params, options)
  }

  async patch(endpoint, data = null, params = {}, options = {}) {
    return this.request('PATCH', endpoint, data, params, options)
  }

  async delete(endpoint, params = {}, options = {}) {
    return this.request('DELETE', endpoint, null, params, options)
  }

  // File upload
  async upload(endpoint, file, params = {}, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)
    
    const url = this.buildURL(endpoint, params)
    const headers = this.getHeaders()
    delete headers['Content-Type'] // Let browser set it for FormData
    
    const xhr = new XMLHttpRequest()
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (onProgress && e.lengthComputable) {
          onProgress((e.loaded / e.total) * 100)
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch {
            resolve(xhr.responseText)
          }
        } else {
          reject(new APIError(`Upload failed: ${xhr.statusText}`, xhr.status))
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new APIError('Upload failed: Network error'))
      })
      
      xhr.open('POST', url)
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key])
      })
      xhr.send(formData)
    })
  }

  // Batch requests
  async batch(requests) {
    const promises = requests.map(({ method, endpoint, data, params }) => 
      this.request(method, endpoint, data, params)
    )
    
    return Promise.allSettled(promises)
  }

  // Health check
  async healthCheck() {
    try {
      await this.get('/health')
      return { status: 'healthy', timestamp: new Date().toISOString() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() }
    }
  }
}

// Custom API Error class
class APIError extends Error {
  constructor(message, status = 500, data = {}) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
    this.timestamp = new Date().toISOString()
  }
}

// Create singleton instance
const apiClient = new APIClient()

export default apiClient
export { APIError }
