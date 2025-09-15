// SEO Audit API Service
import apiClient from '../client'
import API_CONFIG from '../config'

class AuditService {
  constructor() {
    this.endpoints = API_CONFIG.ENDPOINTS.AUDIT
  }

  // Create a new SEO audit
  async createAudit(auditData) {
    try {
      const response = await apiClient.post(this.endpoints.CREATE, auditData)
      return {
        success: true,
        data: response.data,
        message: 'Audit created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get audit by ID
  async getAudit(auditId, includeDetails = true) {
    try {
      const params = { includeDetails }
      const response = await apiClient.get(this.endpoints.GET.replace(':id', auditId), params)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // List audits with filtering and pagination
  async listAudits(filters = {}, pagination = {}) {
    try {
      const params = {
        ...filters,
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        sort: pagination.sort || 'created_at',
        order: pagination.order || 'desc'
      }
      
      const response = await apiClient.get(this.endpoints.LIST, params)
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
        total: response.total
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Update audit
  async updateAudit(auditId, updateData) {
    try {
      const response = await apiClient.put(
        this.endpoints.UPDATE.replace(':id', auditId),
        updateData
      )
      return {
        success: true,
        data: response.data,
        message: 'Audit updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Delete audit
  async deleteAudit(auditId) {
    try {
      await apiClient.delete(this.endpoints.DELETE.replace(':id', auditId))
      return {
        success: true,
        message: 'Audit deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Bulk create audits
  async bulkCreateAudits(auditsData) {
    try {
      const response = await apiClient.post(this.endpoints.BULK_CREATE, { audits: auditsData })
      return {
        success: true,
        data: response.data,
        message: `${response.data.created} audits created successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Export audits
  async exportAudits(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters }
      const response = await apiClient.get(this.endpoints.EXPORT, params, {
        responseType: 'blob'
      })
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `seo-audits-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return {
        success: true,
        message: 'Audits exported successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get audit statistics
  async getAuditStats(filters = {}) {
    try {
      const response = await apiClient.get('/audit/stats', filters)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get audit trends
  async getAuditTrends(period = '30d') {
    try {
      const response = await apiClient.get('/audit/trends', { period })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Schedule audit
  async scheduleAudit(auditData, schedule) {
    try {
      const response = await apiClient.post('/audit/schedule', {
        ...auditData,
        schedule
      })
      return {
        success: true,
        data: response.data,
        message: 'Audit scheduled successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Cancel scheduled audit
  async cancelScheduledAudit(scheduleId) {
    try {
      await apiClient.delete(`/audit/schedule/${scheduleId}`)
      return {
        success: true,
        message: 'Scheduled audit cancelled'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get audit recommendations
  async getAuditRecommendations(auditId) {
    try {
      const response = await apiClient.get(`/audit/${auditId}/recommendations`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Compare audits
  async compareAudits(auditIds) {
    try {
      const response = await apiClient.post('/audit/compare', { auditIds })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }
}

export default new AuditService()
