// Analytics API Service
import apiClient from '../client'
import API_CONFIG from '../config'

class AnalyticsService {
  constructor() {
    this.endpoints = API_CONFIG.ENDPOINTS.ANALYTICS
  }

  // Get dashboard analytics
  async getDashboardAnalytics(filters = {}) {
    try {
      const response = await apiClient.get(this.endpoints.DASHBOARD, filters)
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

  // Get metrics
  async getMetrics(metricType, filters = {}) {
    try {
      const params = { type: metricType, ...filters }
      const response = await apiClient.get(this.endpoints.METRICS, params)
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

  // Get trends
  async getTrends(period = '30d', filters = {}) {
    try {
      const params = { period, ...filters }
      const response = await apiClient.get(this.endpoints.TRENDS, params)
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

  // Export analytics data
  async exportAnalytics(format = 'csv', filters = {}) {
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
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return {
        success: true,
        message: 'Analytics data exported successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get SEO performance metrics
  async getSEOPerformance(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/seo-performance', filters)
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

  // Get lead conversion metrics
  async getLeadConversion(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/lead-conversion', filters)
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

  // Get audit quality metrics
  async getAuditQuality(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/audit-quality', filters)
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

  // Get user engagement metrics
  async getUserEngagement(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/user-engagement', filters)
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

  // Get real-time metrics
  async getRealTimeMetrics() {
    try {
      const response = await apiClient.get('/analytics/real-time')
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

  // Get comparative analytics
  async getComparativeAnalytics(comparisonData) {
    try {
      const response = await apiClient.post('/analytics/compare', comparisonData)
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

  // Get custom analytics query
  async getCustomAnalytics(query, filters = {}) {
    try {
      const response = await apiClient.post('/analytics/custom', {
        query,
        filters
      })
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

  // Get analytics alerts
  async getAnalyticsAlerts() {
    try {
      const response = await apiClient.get('/analytics/alerts')
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

  // Create analytics alert
  async createAnalyticsAlert(alertData) {
    try {
      const response = await apiClient.post('/analytics/alerts', alertData)
      return {
        success: true,
        data: response.data,
        message: 'Alert created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Update analytics alert
  async updateAnalyticsAlert(alertId, updateData) {
    try {
      const response = await apiClient.put(`/analytics/alerts/${alertId}`, updateData)
      return {
        success: true,
        data: response.data,
        message: 'Alert updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Delete analytics alert
  async deleteAnalyticsAlert(alertId) {
    try {
      await apiClient.delete(`/analytics/alerts/${alertId}`)
      return {
        success: true,
        message: 'Alert deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get analytics widgets
  async getAnalyticsWidgets() {
    try {
      const response = await apiClient.get('/analytics/widgets')
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

  // Create analytics widget
  async createAnalyticsWidget(widgetData) {
    try {
      const response = await apiClient.post('/analytics/widgets', widgetData)
      return {
        success: true,
        data: response.data,
        message: 'Widget created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Update analytics widget
  async updateAnalyticsWidget(widgetId, updateData) {
    try {
      const response = await apiClient.put(`/analytics/widgets/${widgetId}`, updateData)
      return {
        success: true,
        data: response.data,
        message: 'Widget updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Delete analytics widget
  async deleteAnalyticsWidget(widgetId) {
    try {
      await apiClient.delete(`/analytics/widgets/${widgetId}`)
      return {
        success: true,
        message: 'Widget deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get analytics dashboard layout
  async getDashboardLayout() {
    try {
      const response = await apiClient.get('/analytics/dashboard/layout')
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

  // Update analytics dashboard layout
  async updateDashboardLayout(layoutData) {
    try {
      const response = await apiClient.put('/analytics/dashboard/layout', layoutData)
      return {
        success: true,
        data: response.data,
        message: 'Dashboard layout updated successfully'
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

export default new AnalyticsService()
