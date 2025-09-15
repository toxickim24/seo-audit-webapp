// Lead Management API Service
import apiClient from '../client'
import API_CONFIG from '../config'

class LeadService {
  constructor() {
    this.endpoints = API_CONFIG.ENDPOINTS.LEADS
  }

  // Create a new lead
  async createLead(leadData) {
    try {
      const response = await apiClient.post(this.endpoints.CREATE, leadData)
      return {
        success: true,
        data: response.data,
        message: 'Lead created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get lead by ID
  async getLead(leadId) {
    try {
      const response = await apiClient.get(this.endpoints.GET.replace(':id', leadId))
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

  // List leads with filtering and pagination
  async listLeads(filters = {}, pagination = {}) {
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

  // Update lead
  async updateLead(leadId, updateData) {
    try {
      const response = await apiClient.put(
        this.endpoints.UPDATE.replace(':id', leadId),
        updateData
      )
      return {
        success: true,
        data: response.data,
        message: 'Lead updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Delete lead
  async deleteLead(leadId) {
    try {
      await apiClient.delete(this.endpoints.DELETE.replace(':id', leadId))
      return {
        success: true,
        message: 'Lead deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Bulk update leads
  async bulkUpdateLeads(updates) {
    try {
      const response = await apiClient.put(this.endpoints.BULK_UPDATE, { updates })
      return {
        success: true,
        data: response.data,
        message: `${response.data.updated} leads updated successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Export leads
  async exportLeads(format = 'csv', filters = {}) {
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
      link.download = `leads-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return {
        success: true,
        message: 'Leads exported successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get lead analytics
  async getLeadAnalytics(filters = {}) {
    try {
      const response = await apiClient.get(this.endpoints.ANALYTICS, filters)
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

  // Get lead statistics
  async getLeadStats(filters = {}) {
    try {
      const response = await apiClient.get('/leads/stats', filters)
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

  // Get lead trends
  async getLeadTrends(period = '30d') {
    try {
      const response = await apiClient.get('/leads/trends', { period })
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

  // Search leads
  async searchLeads(query, filters = {}) {
    try {
      const params = { q: query, ...filters }
      const response = await apiClient.get('/leads/search', params)
      return {
        success: true,
        data: response.data,
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

  // Get lead sources
  async getLeadSources() {
    try {
      const response = await apiClient.get('/leads/sources')
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

  // Get lead statuses
  async getLeadStatuses() {
    try {
      const response = await apiClient.get('/leads/statuses')
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

  // Update lead status
  async updateLeadStatus(leadId, status) {
    try {
      const response = await apiClient.patch(
        `/leads/${leadId}/status`,
        { status }
      )
      return {
        success: true,
        data: response.data,
        message: 'Lead status updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Add lead note
  async addLeadNote(leadId, note) {
    try {
      const response = await apiClient.post(`/leads/${leadId}/notes`, { note })
      return {
        success: true,
        data: response.data,
        message: 'Note added successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get lead notes
  async getLeadNotes(leadId) {
    try {
      const response = await apiClient.get(`/leads/${leadId}/notes`)
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

  // Merge duplicate leads
  async mergeLeads(leadIds, primaryLeadId) {
    try {
      const response = await apiClient.post('/leads/merge', {
        leadIds,
        primaryLeadId
      })
      return {
        success: true,
        data: response.data,
        message: 'Leads merged successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get lead timeline
  async getLeadTimeline(leadId) {
    try {
      const response = await apiClient.get(`/leads/${leadId}/timeline`)
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

export default new LeadService()
