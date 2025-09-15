// API Client Tests
import apiClient from '../client'
import { APIError } from '../client'

describe('API Client', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn()
    localStorage.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Request Methods', () => {
    it('should make GET request', async () => {
      const mockResponse = { data: 'test' }
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiClient.get('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should make POST request with data', async () => {
      const mockResponse = { success: true }
      const requestData = { name: 'test' }
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiClient.post('/test', requestData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.any(Object)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should make PUT request', async () => {
      const mockResponse = { success: true }
      const requestData = { name: 'updated' }
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiClient.put('/test/1', requestData)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestData)
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should make DELETE request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      const result = await apiClient.delete('/test/1')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      const errorResponse = { message: 'Not found' }
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse)
      })

      await expect(apiClient.get('/test')).rejects.toThrow(APIError)
    })

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(apiClient.get('/test')).rejects.toThrow('Network error')
    })

    it('should handle timeout errors', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({})
          }), 100)
        })
      )

      // Set short timeout for test
      const result = await apiClient.get('/test', {}, { timeout: 50 })
      expect(result).toBeDefined()
    })
  })

  describe('Authentication', () => {
    it('should include auth token in headers', async () => {
      localStorage.setItem('auth_token', 'test-token')
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiClient.get('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('Rate Limiting', () => {
    it('should track request count', () => {
      // Reset rate limit
      apiClient.requestCount = 0
      apiClient.windowStart = Date.now()

      // Make multiple requests
      for (let i = 0; i < 5; i++) {
        apiClient.checkRateLimit()
      }

      expect(apiClient.requestCount).toBe(5)
    })

    it('should throw error when rate limit exceeded', () => {
      // Set rate limit to 0 for testing
      apiClient.rateLimit.requests = 0
      apiClient.requestCount = 1

      expect(() => apiClient.checkRateLimit()).toThrow('Rate limit exceeded')
    })
  })

  describe('Retry Logic', () => {
    it('should retry on retryable errors', async () => {
      let attemptCount = 0
      global.fetch.mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      })

      const result = await apiClient.get('/test')

      expect(attemptCount).toBe(3)
      expect(result.success).toBe(true)
    })

    it('should not retry on non-retryable errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Validation error'))

      await expect(apiClient.get('/test')).rejects.toThrow('Validation error')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('File Upload', () => {
    it('should upload file with progress', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const mockXHR = {
        upload: { addEventListener: jest.fn() },
        addEventListener: jest.fn(),
        open: jest.fn(),
        setRequestHeader: jest.fn(),
        send: jest.fn()
      }

      global.XMLHttpRequest = jest.fn(() => mockXHR)

      const uploadPromise = apiClient.upload('/upload', mockFile, {}, () => {})

      // Simulate successful upload
      setTimeout(() => {
        mockXHR.addEventListener.mock.calls[0][1]({
          status: 200,
          responseText: JSON.stringify({ success: true })
        })
      }, 100)

      const result = await uploadPromise
      expect(result.success).toBe(true)
    })
  })

  describe('Batch Requests', () => {
    it('should handle batch requests', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'response1' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'response2' })
        })

      const requests = [
        { method: 'GET', endpoint: '/test1' },
        { method: 'GET', endpoint: '/test2' }
      ]

      const results = await apiClient.batch(requests)

      expect(results).toHaveLength(2)
      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('fulfilled')
    })
  })

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      })

      const result = await apiClient.healthCheck()

      expect(result.status).toBe('healthy')
      expect(result.timestamp).toBeDefined()
    })

    it('should return unhealthy status on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Service unavailable'))

      const result = await apiClient.healthCheck()

      expect(result.status).toBe('unhealthy')
      expect(result.error).toBe('Service unavailable')
    })
  })
})
