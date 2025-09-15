import React, { useState, useEffect } from 'react'
import LeadService from '../services/LeadService'

function LeadCapture({ auditData, onLeadSubmit, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [leadStats, setLeadStats] = useState(null)
  const leadService = new LeadService()

  useEffect(() => {
    // Load lead statistics for social proof
    const stats = leadService.getLeadStats()
    setLeadStats(stats)
  }, [])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!leadService.validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (leadService.emailExists(formData.email)) {
      newErrors.email = 'This email is already registered. Please use a different email.'
    }
    
    if (formData.phone && !leadService.validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Save lead using LeadService
      const result = leadService.saveLead(formData, auditData)
      
      if (result.success) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Update lead statistics
        const updatedStats = leadService.getLeadStats()
        setLeadStats(updatedStats)
        
        onLeadSubmit(formData)
      } else {
        setErrors({ submit: result.error || 'Failed to save lead. Please try again.' })
      }
    } catch (error) {
      console.error('Error submitting lead:', error)
      setErrors({ submit: 'Failed to submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="lead-capture">
      <div className="lead-header">
        <button onClick={onBack} className="back-button">
          ← Back to Results
        </button>
        <h2>🎉 Great SEO Analysis Complete!</h2>
        <p>Get your detailed PDF report delivered to your inbox</p>
      </div>

      <div className="lead-content">
        <div className="audit-summary">
          <div className="summary-card">
            <h3>Your SEO Score</h3>
            <div className="score-display">
              <span className="score-number">{auditData.overallScore}</span>
              <span className="score-grade">{auditData.summary.grade}</span>
            </div>
            <p className="score-description">{auditData.summary.description}</p>
          </div>
          
          <div className="report-preview">
            <h4>📊 What's in your report:</h4>
            <ul>
              <li>✅ Comprehensive SEO analysis</li>
              <li>✅ Detailed recommendations</li>
              <li>✅ Technical audit results</li>
              <li>✅ Performance metrics</li>
              <li>✅ Actionable next steps</li>
              <li>✅ Competitor insights</li>
            </ul>
          </div>
        </div>

        <div className="lead-form-container">
          <div className="form-header">
            <h3>Get Your Free SEO Report</h3>
            <p>Enter your details to receive the comprehensive PDF report</p>
          </div>

          <form onSubmit={handleSubmit} className="lead-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="company">Company (Optional)</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Enter your company name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            {errors.submit && (
              <div className="submit-error">
                {errors.submit}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Generating Report...' : '📧 Get My SEO Report'}
            </button>
          </form>

          <div className="privacy-note">
            <p>
              🔒 We respect your privacy. Your information will only be used to send you 
              the SEO report and relevant updates. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      <div className="trust-indicators">
        <h4>
          {leadStats ? `Trusted by ${leadStats.total}+ websites` : 'Trusted by 10,000+ websites'}
        </h4>
        <div className="trust-badges">
          <span>✅ No spam, ever</span>
          <span>✅ Instant delivery</span>
          <span>✅ Free forever</span>
          <span>✅ GDPR compliant</span>
        </div>
        
        {leadStats && leadStats.total > 0 && (
          <div className="social-proof">
            <div className="proof-stats">
              <div className="stat-item">
                <span className="stat-number">{leadStats.total}</span>
                <span className="stat-label">Total Reports</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{leadStats.averageScore}</span>
                <span className="stat-label">Avg Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{leadStats.today}</span>
                <span className="stat-label">Today</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeadCapture
