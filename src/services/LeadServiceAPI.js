// LeadServiceAPI.js - API-first Lead Management Service
import { leadService as apiLeadService } from '../api'

class LeadServiceAPI {
  constructor() {
    this.storageKey = 'seo_mojo_leads'
    this.analyticsKey = 'seo_mojo_analytics'
    this.apiService = apiLeadService
  }

  // Save lead data (API-first with localStorage fallback)
  async saveLead(leadData, auditData) {
    try {
      // Prepare lead data for API
      const leadPayload = {
        name: leadData.name,
        email: leadData.email,
        company: leadData.company || '',
        phone: leadData.phone || '',
        auditId: auditData.id || this.generateLeadId(),
        source: 'seo_audit_tool',
        status: 'new',
        priority: 'medium',
        customFields: {
          auditUrl: auditData.url,
          auditScore: auditData.overallScore,
          auditGrade: auditData.summary?.grade || 'N/A'
        },
        notes: `SEO Audit completed for ${auditData.url}`
      }

      // Try API first
      try {
        const apiResult = await this.apiService.createLead(leadPayload)
        if (apiResult.success) {
          // Track conversion
          this.trackConversion(apiResult.data)
          return {
            success: true,
            lead: apiResult.data,
            message: 'Lead saved successfully via API'
          }
        }
      } catch (apiError) {
        console.warn('API unavailable, falling back to localStorage:', apiError)
      }

      // Fallback to localStorage
      const lead = {
        id: this.generateLeadId(),
        timestamp: new Date().toISOString(),
        leadData: {
          name: leadData.name,
          email: leadData.email,
          company: leadData.company || '',
          phone: leadData.phone || ''
        },
        auditData: {
          url: auditData.url,
          overallScore: auditData.overallScore,
          grade: auditData.summary?.grade || 'N/A',
          categories: auditData.categories
        },
        status: 'active',
        source: 'seo_audit_tool'
      }

      // Get existing leads
      const existingLeads = this.getAllLeads()
      existingLeads.push(lead)

      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(existingLeads))

      // Track conversion
      this.trackConversion(lead)

      return {
        success: true,
        lead: lead,
        message: 'Lead saved successfully (offline mode)'
      }
    } catch (error) {
      console.error('Error saving lead:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get all leads (API-first with localStorage fallback)
  async getAllLeads() {
    try {
      // Try API first
      const apiResult = await this.apiService.listLeads()
      if (apiResult.success) {
        return apiResult.data
      }
    } catch (error) {
      console.warn('API unavailable, using localStorage:', error)
    }

    // Fallback to localStorage
    try {
      const leads = localStorage.getItem(this.storageKey)
      return leads ? JSON.parse(leads) : []
    } catch (error) {
      console.error('Error loading leads from localStorage:', error)
      return []
    }
  }

  // Update lead status (API-first)
  async updateLeadStatus(leadId, newStatus) {
    try {
      // Try API first
      const apiResult = await this.apiService.updateLeadStatus(leadId, newStatus)
      if (apiResult.success) {
        return { success: true, lead: apiResult.data }
      }
    } catch (error) {
      console.warn('API unavailable, using localStorage:', error)
    }

    // Fallback to localStorage
    try {
      const leads = this.getAllLeads()
      const leadIndex = leads.findIndex(lead => lead.id === leadId)
      
      if (leadIndex === -1) {
        return { success: false, error: 'Lead not found' }
      }
      
      leads[leadIndex].status = newStatus
      leads[leadIndex].updatedAt = new Date().toISOString()
      
      localStorage.setItem(this.storageKey, JSON.stringify(leads))
      return { success: true, lead: leads[leadIndex] }
    } catch (error) {
      console.error('Error updating lead status:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete lead (API-first)
  async deleteLead(leadId) {
    try {
      // Try API first
      const apiResult = await this.apiService.deleteLead(leadId)
      if (apiResult.success) {
        return { success: true }
      }
    } catch (error) {
      console.warn('API unavailable, using localStorage:', error)
    }

    // Fallback to localStorage
    try {
      const leads = this.getAllLeads()
      const filteredLeads = leads.filter(lead => lead.id !== leadId)
      
      if (filteredLeads.length === leads.length) {
        return { success: false, error: 'Lead not found' }
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredLeads))
      return { success: true }
    } catch (error) {
      console.error('Error deleting lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Get analytics data (API-first)
  async getAnalytics() {
    try {
      // Try API first
      const apiResult = await this.apiService.getLeadAnalytics()
      if (apiResult.success) {
        return { success: true, analytics: apiResult.data }
      }
    } catch (error) {
      console.warn('API unavailable, using localStorage:', error)
    }

    // Fallback to localStorage
    try {
      const leads = await this.getAllLeads()
      
      if (leads.length === 0) {
        return {
          success: true,
          analytics: {
            totalLeads: 0,
            activeLeads: 0,
            averageScore: 0,
            conversionRate: 0,
            topScores: []
          }
        }
      }

      const activeLeads = leads.filter(lead => lead.status === 'active')
      const scores = leads.map(lead => lead.auditData?.overallScore || 0).filter(score => score > 0)
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
      
      // Calculate conversion rate
      const convertedLeads = leads.filter(lead => lead.status === 'converted').length
      const conversionRate = Math.round((convertedLeads / leads.length) * 100)
      
      // Get top scores
      const topScores = leads
        .filter(lead => lead.auditData?.overallScore)
        .sort((a, b) => (b.auditData.overallScore || 0) - (a.auditData.overallScore || 0))
        .slice(0, 5)
        .map(lead => ({
          name: lead.leadData.name,
          email: lead.leadData.email,
          score: lead.auditData.overallScore,
          url: lead.auditData.url
        }))

      return {
        success: true,
        analytics: {
          totalLeads: leads.length,
          activeLeads: activeLeads.length,
          averageScore,
          conversionRate,
          topScores
        }
      }
    } catch (error) {
      console.error('Error getting analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Export leads (API-first)
  async exportLeadsToCSV() {
    try {
      // Try API first
      const apiResult = await this.apiService.exportLeads()
      if (apiResult.success) {
        return { success: true }
      }
    } catch (error) {
      console.warn('API unavailable, using localStorage:', error)
    }

    // Fallback to localStorage
    try {
      const leads = await this.getAllLeads()
      
      if (leads.length === 0) {
        return { success: false, error: 'No leads to export' }
      }

      const headers = ['Name', 'Email', 'Company', 'Website', 'Score', 'Grade', 'Status', 'Date']
      const csvData = leads.map(lead => [
        lead.leadData.name,
        lead.leadData.email,
        lead.leadData.company || '',
        lead.auditData.url,
        lead.auditData.overallScore || 0,
        lead.auditData.grade || 'N/A',
        lead.status,
        new Date(lead.timestamp).toLocaleDateString()
      ])

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `seo-mojo-leads-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      console.error('Error exporting leads:', error)
      return { success: false, error: error.message }
    }
  }

  // Track conversion for analytics
  trackConversion(lead) {
    try {
      const analytics = this.getAnalyticsData()
      analytics.totalConversions++
      analytics.lastConversion = new Date().toISOString()
      
      // Track by source
      if (!analytics.bySource[lead.source]) {
        analytics.bySource[lead.source] = 0
      }
      analytics.bySource[lead.source]++
      
      // Track by score range
      const score = lead.auditData?.overallScore || 0
      let scoreRange = 'unknown'
      if (score >= 90) scoreRange = '90-100'
      else if (score >= 80) scoreRange = '80-89'
      else if (score >= 70) scoreRange = '70-79'
      else if (score >= 60) scoreRange = '60-69'
      else if (score > 0) scoreRange = '0-59'
      
      if (!analytics.byScoreRange[scoreRange]) {
        analytics.byScoreRange[scoreRange] = 0
      }
      analytics.byScoreRange[scoreRange]++
      
      localStorage.setItem(this.analyticsKey, JSON.stringify(analytics))
    } catch (error) {
      console.error('Error tracking conversion:', error)
    }
  }

  // Get analytics data from localStorage
  getAnalyticsData() {
    try {
      const data = localStorage.getItem(this.analyticsKey)
      if (data) {
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
    
    return {
      totalConversions: 0,
      lastConversion: null,
      bySource: {},
      byScoreRange: {}
    }
  }

  // Generate unique lead ID
  generateLeadId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Search leads
  async searchLeads(query, filters = {}) {
    try {
      // Try API first
      const apiResult = await this.apiService.searchLeads(query, filters)
      if (apiResult.success) {
        return { success: true, data: apiResult.data, total: apiResult.total }
      }
    } catch (error) {
      console.warn('API unavailable, using localStorage:', error)
    }

    // Fallback to localStorage search
    try {
      const leads = await this.getAllLeads()
      const filteredLeads = leads.filter(lead => {
        const searchText = query.toLowerCase()
        return (
          lead.leadData.name.toLowerCase().includes(searchText) ||
          lead.leadData.email.toLowerCase().includes(searchText) ||
          (lead.leadData.company && lead.leadData.company.toLowerCase().includes(searchText)) ||
          lead.auditData.url.toLowerCase().includes(searchText)
        )
      })

      return { success: true, data: filteredLeads, total: filteredLeads.length }
    } catch (error) {
      console.error('Error searching leads:', error)
      return { success: false, error: error.message }
    }
  }

  // Get lead by ID
  async getLead(leadId) {
    try {
      // Try API first
      const apiResult = await this.apiService.getLead(leadId)
      if (apiResult.success) {
        return { success: true, data: apiResult.data }
      }
    } catch (error) {
      console.warn('API unavailable, using localStorage:', error)
    }

    // Fallback to localStorage
    try {
      const leads = await this.getAllLeads()
      const lead = leads.find(l => l.id === leadId)
      
      if (!lead) {
        return { success: false, error: 'Lead not found' }
      }
      
      return { success: true, data: lead }
    } catch (error) {
      console.error('Error getting lead:', error)
      return { success: false, error: error.message }
    }
  }
}

export default LeadServiceAPI
