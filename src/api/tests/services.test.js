// API Services Tests
import { auditService, leadService, reportService, analyticsService, userService } from '../index'

// Mock the API client
jest.mock('../client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}))

import apiClient from '../client'

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Audit Service', () => {
    describe('createAudit', () => {
      it('should create audit successfully', async () => {
        const auditData = {
          url: 'https://example.com',
          auditType: 'full'
        }
        const mockResponse = {
          data: { id: 'audit-123', status: 'pending' }
        }

        apiClient.post.mockResolvedValueOnce(mockResponse)

        const result = await auditService.createAudit(auditData)

        expect(apiClient.post).toHaveBeenCalledWith('/audit', auditData)
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })

      it('should handle API errors', async () => {
        const auditData = { url: 'invalid-url' }
        const error = new Error('Invalid URL')

        apiClient.post.mockRejectedValueOnce(error)

        const result = await auditService.createAudit(auditData)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Invalid URL')
      })
    })

    describe('getAudit', () => {
      it('should get audit by ID', async () => {
        const auditId = 'audit-123'
        const mockResponse = {
          data: { id: auditId, status: 'completed' }
        }

        apiClient.get.mockResolvedValueOnce(mockResponse)

        const result = await auditService.getAudit(auditId)

        expect(apiClient.get).toHaveBeenCalledWith('/audit/audit-123', { includeDetails: true })
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })
    })

    describe('listAudits', () => {
      it('should list audits with pagination', async () => {
        const filters = { status: 'completed' }
        const pagination = { page: 1, limit: 10 }
        const mockResponse = {
          data: [{ id: 'audit-1' }, { id: 'audit-2' }],
          pagination: { page: 1, limit: 10, total: 2 },
          total: 2
        }

        apiClient.get.mockResolvedValueOnce(mockResponse)

        const result = await auditService.listAudits(filters, pagination)

        expect(apiClient.get).toHaveBeenCalledWith('/audit', {
          ...filters,
          page: 1,
          limit: 10,
          sort: 'created_at',
          order: 'desc'
        })
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })
    })
  })

  describe('Lead Service', () => {
    describe('createLead', () => {
      it('should create lead successfully', async () => {
        const leadData = {
          name: 'John Doe',
          email: 'john@example.com',
          auditId: 'audit-123'
        }
        const mockResponse = {
          data: { id: 'lead-123', name: 'John Doe' }
        }

        apiClient.post.mockResolvedValueOnce(mockResponse)

        const result = await leadService.createLead(leadData)

        expect(apiClient.post).toHaveBeenCalledWith('/leads', leadData)
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })
    })

    describe('getLeadAnalytics', () => {
      it('should get lead analytics', async () => {
        const mockResponse = {
          data: {
            totalLeads: 100,
            activeLeads: 50,
            conversionRate: 25
          }
        }

        apiClient.get.mockResolvedValueOnce(mockResponse)

        const result = await leadService.getLeadAnalytics()

        expect(apiClient.get).toHaveBeenCalledWith('/leads/analytics', {})
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })
    })

    describe('exportLeads', () => {
      it('should export leads as CSV', async () => {
        const mockBlob = new Blob(['csv,data'], { type: 'text/csv' })
        apiClient.get.mockResolvedValueOnce(mockBlob)

        // Mock DOM methods
        global.URL.createObjectURL = jest.fn(() => 'blob:url')
        global.URL.revokeObjectURL = jest.fn()
        document.createElement = jest.fn(() => ({
          href: '',
          download: '',
          click: jest.fn()
        }))
        document.body.appendChild = jest.fn()
        document.body.removeChild = jest.fn()

        const result = await leadService.exportLeads('csv')

        expect(apiClient.get).toHaveBeenCalledWith('/leads/export', { format: 'csv' }, { responseType: 'blob' })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Report Service', () => {
    describe('generatePDF', () => {
      it('should generate PDF report', async () => {
        const reportId = 'report-123'
        const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' })
        
        apiClient.post.mockResolvedValueOnce(mockBlob)

        // Mock DOM methods
        global.URL.createObjectURL = jest.fn(() => 'blob:url')
        global.URL.revokeObjectURL = jest.fn()
        document.createElement = jest.fn(() => ({
          href: '',
          download: '',
          click: jest.fn()
        }))
        document.body.appendChild = jest.fn()
        document.body.removeChild = jest.fn()

        const result = await reportService.generatePDF(reportId)

        expect(apiClient.post).toHaveBeenCalledWith('/reports/report-123/pdf', {})
        expect(result.success).toBe(true)
      })
    })

    describe('emailReport', () => {
      it('should email report', async () => {
        const reportId = 'report-123'
        const emailData = {
          to: 'client@example.com',
          subject: 'SEO Report'
        }
        const mockResponse = {
          data: { messageId: 'msg-123' }
        }

        apiClient.post.mockResolvedValueOnce(mockResponse)

        const result = await reportService.emailReport(reportId, emailData)

        expect(apiClient.post).toHaveBeenCalledWith('/reports/report-123/email', emailData)
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })
    })
  })

  describe('Analytics Service', () => {
    describe('getDashboardAnalytics', () => {
      it('should get dashboard analytics', async () => {
        const mockResponse = {
          data: {
            totalAudits: 100,
            totalLeads: 50,
            averageScore: 75
          }
        }

        apiClient.get.mockResolvedValueOnce(mockResponse)

        const result = await analyticsService.getDashboardAnalytics()

        expect(apiClient.get).toHaveBeenCalledWith('/analytics/dashboard', {})
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })
    })

    describe('getTrends', () => {
      it('should get trends data', async () => {
        const period = '30d'
        const mockResponse = {
          data: {
            daily: [{ date: '2024-01-01', value: 10 }],
            weekly: [{ week: '2024-W01', value: 70 }]
          }
        }

        apiClient.get.mockResolvedValueOnce(mockResponse)

        const result = await analyticsService.getTrends(period)

        expect(apiClient.get).toHaveBeenCalledWith('/analytics/trends', { period })
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockResponse.data)
      })
    })
  })

  describe('User Service', () => {
    describe('authenticate', () => {
      it('should authenticate user successfully', async () => {
        const credentials = {
          email: 'user@example.com',
          password: 'password123'
        }
        const mockResponse = {
          data: {
            token: 'jwt-token',
            user: { id: 'user-123', email: 'user@example.com' }
          }
        }

        apiClient.post.mockResolvedValueOnce(mockResponse)

        const result = await userService.authenticate(credentials)

        expect(apiClient.post).toHaveBeenCalledWith('/users/auth', credentials)
        expect(result.success).toBe(true)
        expect(localStorage.getItem('auth_token')).toBe('jwt-token')
        expect(localStorage.getItem('user_data')).toBe(JSON.stringify(mockResponse.data.user))
      })
    })

    describe('logout', () => {
      it('should logout user and clear storage', async () => {
        localStorage.setItem('auth_token', 'jwt-token')
        localStorage.setItem('user_data', '{"id":"user-123"}')

        apiClient.post.mockResolvedValueOnce({})

        const result = await userService.logout()

        expect(apiClient.post).toHaveBeenCalledWith('/users/logout')
        expect(result.success).toBe(true)
        expect(localStorage.getItem('auth_token')).toBeNull()
        expect(localStorage.getItem('user_data')).toBeNull()
      })
    })

    describe('getCurrentUser', () => {
      it('should return current user from storage', () => {
        const userData = { id: 'user-123', email: 'user@example.com' }
        localStorage.setItem('user_data', JSON.stringify(userData))

        const result = userService.getCurrentUser()

        expect(result).toEqual(userData)
      })

      it('should return null if no user data', () => {
        localStorage.removeItem('user_data')

        const result = userService.getCurrentUser()

        expect(result).toBeNull()
      })
    })

    describe('isAuthenticated', () => {
      it('should return true if token exists', () => {
        localStorage.setItem('auth_token', 'jwt-token')

        const result = userService.isAuthenticated()

        expect(result).toBe(true)
      })

      it('should return false if no token', () => {
        localStorage.removeItem('auth_token')

        const result = userService.isAuthenticated()

        expect(result).toBe(false)
      })
    })
  })
})
