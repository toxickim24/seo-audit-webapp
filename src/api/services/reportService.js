// Report Generation API Service
import apiClient from '../client'
import API_CONFIG from '../config'

class ReportService {
  constructor() {
    this.endpoints = API_CONFIG.ENDPOINTS.REPORTS
  }

  // Create a new report
  async createReport(reportData) {
    try {
      const response = await apiClient.post(this.endpoints.CREATE, reportData)
      return {
        success: true,
        data: response.data,
        message: 'Report created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get report by ID
  async getReport(reportId) {
    try {
      const response = await apiClient.get(this.endpoints.GET.replace(':id', reportId))
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

  // List reports with filtering and pagination
  async listReports(filters = {}, pagination = {}) {
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

  // Update report
  async updateReport(reportId, updateData) {
    try {
      const response = await apiClient.put(
        this.endpoints.UPDATE.replace(':id', reportId),
        updateData
      )
      return {
        success: true,
        data: response.data,
        message: 'Report updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Delete report
  async deleteReport(reportId) {
    try {
      await apiClient.delete(this.endpoints.DELETE.replace(':id', reportId))
      return {
        success: true,
        message: 'Report deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Generate PDF report
  async generatePDF(reportId, options = {}) {
    try {
      const response = await apiClient.post(
        this.endpoints.GENERATE_PDF.replace(':id', reportId),
        options,
        {},
        { responseType: 'blob' }
      )
      
      // Create download link
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `seo-report-${reportId}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return {
        success: true,
        message: 'PDF report generated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Email report
  async emailReport(reportId, emailData) {
    try {
      const response = await apiClient.post(
        this.endpoints.EMAIL.replace(':id', reportId),
        emailData
      )
      return {
        success: true,
        data: response.data,
        message: 'Report sent successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get report templates
  async getReportTemplates() {
    try {
      const response = await apiClient.get('/reports/templates')
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

  // Create custom report template
  async createReportTemplate(templateData) {
    try {
      const response = await apiClient.post('/reports/templates', templateData)
      return {
        success: true,
        data: response.data,
        message: 'Report template created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get report analytics
  async getReportAnalytics(filters = {}) {
    try {
      const response = await apiClient.get('/reports/analytics', filters)
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

  // Schedule report generation
  async scheduleReport(reportData, schedule) {
    try {
      const response = await apiClient.post('/reports/schedule', {
        ...reportData,
        schedule
      })
      return {
        success: true,
        data: response.data,
        message: 'Report scheduled successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get scheduled reports
  async getScheduledReports() {
    try {
      const response = await apiClient.get('/reports/schedule')
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

  // Cancel scheduled report
  async cancelScheduledReport(scheduleId) {
    try {
      await apiClient.delete(`/reports/schedule/${scheduleId}`)
      return {
        success: true,
        message: 'Scheduled report cancelled'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get report sharing options
  async getReportSharingOptions(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}/sharing`)
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

  // Share report
  async shareReport(reportId, sharingOptions) {
    try {
      const response = await apiClient.post(
        `/reports/${reportId}/share`,
        sharingOptions
      )
      return {
        success: true,
        data: response.data,
        message: 'Report shared successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get report comments
  async getReportComments(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}/comments`)
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

  // Add report comment
  async addReportComment(reportId, comment) {
    try {
      const response = await apiClient.post(`/reports/${reportId}/comments`, { comment })
      return {
        success: true,
        data: response.data,
        message: 'Comment added successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Export report data
  async exportReportData(reportId, format = 'json') {
    try {
      const response = await apiClient.get(
        `/reports/${reportId}/export`,
        { format },
        { responseType: 'blob' }
      )
      
      // Create download link
      const blob = new Blob([response], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${reportId}-data.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return {
        success: true,
        message: 'Report data exported successfully'
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

export default new ReportService()
