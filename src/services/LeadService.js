// Lead Management Service
class LeadService {
  constructor() {
    this.storageKey = 'seo_mojo_leads'
    this.analyticsKey = 'seo_mojo_analytics'
  }

  // Save lead data to localStorage
  saveLead(leadData, auditData) {
    try {
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
          grade: auditData.summary.grade,
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
        message: 'Lead saved successfully'
      }
    } catch (error) {
      console.error('Error saving lead:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get all leads
  getAllLeads() {
    try {
      const leads = localStorage.getItem(this.storageKey)
      return leads ? JSON.parse(leads) : []
    } catch (error) {
      console.error('Error retrieving leads:', error)
      return []
    }
  }

  // Get lead by ID
  getLeadById(id) {
    const leads = this.getAllLeads()
    return leads.find(lead => lead.id === id)
  }

  // Update lead status
  updateLeadStatus(id, status) {
    try {
      const leads = this.getAllLeads()
      const leadIndex = leads.findIndex(lead => lead.id === id)
      
      if (leadIndex !== -1) {
        leads[leadIndex].status = status
        leads[leadIndex].updatedAt = new Date().toISOString()
        localStorage.setItem(this.storageKey, JSON.stringify(leads))
        return { success: true }
      }
      
      return { success: false, error: 'Lead not found' }
    } catch (error) {
      console.error('Error updating lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete lead
  deleteLead(id) {
    try {
      const leads = this.getAllLeads()
      const filteredLeads = leads.filter(lead => lead.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(filteredLeads))
      return { success: true }
    } catch (error) {
      console.error('Error deleting lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Export leads to CSV
  exportLeadsToCSV() {
    try {
      const leads = this.getAllLeads()
      
      if (leads.length === 0) {
        return { success: false, error: 'No leads to export' }
      }

      // CSV headers
      const headers = [
        'ID',
        'Name',
        'Email',
        'Company',
        'Phone',
        'Website URL',
        'SEO Score',
        'Grade',
        'Date',
        'Status'
      ]

      // CSV rows
      const rows = leads.map(lead => [
        lead.id,
        lead.leadData.name,
        lead.leadData.email,
        lead.leadData.company,
        lead.leadData.phone,
        lead.auditData.url,
        lead.auditData.overallScore,
        lead.auditData.grade,
        new Date(lead.timestamp).toLocaleDateString(),
        lead.status
      ])

      // Create CSV content
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `seo-mojo-leads-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return { success: true, message: 'Leads exported successfully' }
    } catch (error) {
      console.error('Error exporting leads:', error)
      return { success: false, error: error.message }
    }
  }

  // Get analytics data
  getAnalytics() {
    try {
      const leads = this.getAllLeads()
      const analytics = {
        totalLeads: leads.length,
        activeLeads: leads.filter(lead => lead.status === 'active').length,
        averageScore: this.calculateAverageScore(leads),
        topScores: this.getTopScores(leads),
        leadSources: this.getLeadSources(leads),
        dailyLeads: this.getDailyLeads(leads),
        conversionRate: this.calculateConversionRate()
      }

      return { success: true, analytics }
    } catch (error) {
      console.error('Error getting analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Track conversion for analytics
  trackConversion(lead) {
    try {
      const analytics = this.getStoredAnalytics()
      
      analytics.totalConversions = (analytics.totalConversions || 0) + 1
      analytics.lastConversion = new Date().toISOString()
      
      // Track by score ranges
      const score = lead.auditData.overallScore
      if (score >= 80) {
        analytics.highScoreConversions = (analytics.highScoreConversions || 0) + 1
      } else if (score >= 60) {
        analytics.mediumScoreConversions = (analytics.mediumScoreConversions || 0) + 1
      } else {
        analytics.lowScoreConversions = (analytics.lowScoreConversions || 0) + 1
      }

      this.saveAnalytics(analytics)
    } catch (error) {
      console.error('Error tracking conversion:', error)
    }
  }

  // Helper methods
  generateLeadId() {
    return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  calculateAverageScore(leads) {
    if (leads.length === 0) return 0
    const total = leads.reduce((sum, lead) => sum + lead.auditData.overallScore, 0)
    return Math.round(total / leads.length)
  }

  getTopScores(leads) {
    return leads
      .sort((a, b) => b.auditData.overallScore - a.auditData.overallScore)
      .slice(0, 5)
      .map(lead => ({
        name: lead.leadData.name,
        email: lead.leadData.email,
        score: lead.auditData.overallScore,
        url: lead.auditData.url
      }))
  }

  getLeadSources(leads) {
    const sources = {}
    leads.forEach(lead => {
      sources[lead.source] = (sources[lead.source] || 0) + 1
    })
    return sources
  }

  getDailyLeads(leads) {
    const daily = {}
    leads.forEach(lead => {
      const date = new Date(lead.timestamp).toISOString().split('T')[0]
      daily[date] = (daily[date] || 0) + 1
    })
    return daily
  }

  calculateConversionRate() {
    // This would typically compare leads to total visitors
    // For demo purposes, we'll use a mock rate
    const leads = this.getAllLeads()
    return leads.length > 0 ? Math.min(95, 60 + (leads.length * 2)) : 0
  }

  getStoredAnalytics() {
    try {
      const analytics = localStorage.getItem(this.analyticsKey)
      return analytics ? JSON.parse(analytics) : {}
    } catch (error) {
      return {}
    }
  }

  saveAnalytics(analytics) {
    try {
      localStorage.setItem(this.analyticsKey, JSON.stringify(analytics))
    } catch (error) {
      console.error('Error saving analytics:', error)
    }
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate phone format
  validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  // Check if email already exists
  emailExists(email) {
    const leads = this.getAllLeads()
    return leads.some(lead => lead.leadData.email.toLowerCase() === email.toLowerCase())
  }

  // Get lead statistics
  getLeadStats() {
    const leads = this.getAllLeads()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return {
      total: leads.length,
      today: leads.filter(lead => new Date(lead.timestamp) >= today).length,
      thisWeek: leads.filter(lead => new Date(lead.timestamp) >= thisWeek).length,
      thisMonth: leads.filter(lead => new Date(lead.timestamp) >= thisMonth).length,
      averageScore: this.calculateAverageScore(leads),
      topGrade: this.getMostCommonGrade(leads)
    }
  }

  getMostCommonGrade(leads) {
    if (leads.length === 0) return 'N/A'
    const grades = leads.map(lead => lead.auditData.grade)
    const gradeCount = {}
    grades.forEach(grade => {
      gradeCount[grade] = (gradeCount[grade] || 0) + 1
    })
    return Object.keys(gradeCount).reduce((a, b) => gradeCount[a] > gradeCount[b] ? a : b)
  }
}

export default LeadService
