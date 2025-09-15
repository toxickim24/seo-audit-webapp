import React, { useState, useEffect } from 'react'
import LeadService from '../services/LeadService'

function LeadDashboard({ onBack }) {
  const [leads, setLeads] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const leadService = new LeadService()

  useEffect(() => {
    loadLeads()
    loadAnalytics()
  }, [])

  const loadLeads = () => {
    const allLeads = leadService.getAllLeads()
    setLeads(allLeads)
  }

  const loadAnalytics = () => {
    const analyticsData = leadService.getAnalytics()
    if (analyticsData.success) {
      setAnalytics(analyticsData.analytics)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter
    const matchesSearch = searchTerm === '' || 
      lead.leadData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.leadData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.auditData.url.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  }).sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.timestamp)
        bValue = new Date(b.timestamp)
        break
      case 'score':
        aValue = a.auditData.overallScore
        bValue = b.auditData.overallScore
        break
      case 'name':
        aValue = a.leadData.name.toLowerCase()
        bValue = b.leadData.name.toLowerCase()
        break
      default:
        aValue = a.timestamp
        bValue = b.timestamp
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleExportLeads = () => {
    const result = leadService.exportLeadsToCSV()
    if (result.success) {
      alert('Leads exported successfully!')
    } else {
      alert('Export failed: ' + result.error)
    }
  }

  const handleDeleteLead = (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const result = leadService.deleteLead(leadId)
      if (result.success) {
        loadLeads()
        loadAnalytics()
      } else {
        alert('Delete failed: ' + result.error)
      }
    }
  }

  const handleUpdateStatus = (leadId, newStatus) => {
    const result = leadService.updateLeadStatus(leadId, newStatus)
    if (result.success) {
      loadLeads()
      loadAnalytics()
    } else {
      alert('Update failed: ' + result.error)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60'
    if (score >= 60) return '#f39c12'
    return '#e74c3c'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#27ae60'
      case 'inactive': return '#95a5a6'
      case 'converted': return '#3498db'
      default: return '#7f8c8d'
    }
  }

  return (
    <div className="lead-dashboard">
      <div className="dashboard-header">
        <button onClick={onBack} className="back-button">
          ← Back to App
        </button>
        <h2>📊 Lead Management Dashboard</h2>
        <p>Manage and analyze your SEO audit leads</p>
      </div>

      {/* Analytics Overview */}
      {analytics && analytics.totalLeads > 0 ? (
        <div className="analytics-overview">
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Total Leads</h3>
              <div className="analytics-number">{analytics.totalLeads}</div>
            </div>
            <div className="analytics-card">
              <h3>Active Leads</h3>
              <div className="analytics-number">{analytics.activeLeads}</div>
            </div>
            <div className="analytics-card">
              <h3>Average Score</h3>
              <div className="analytics-number">{analytics.averageScore}</div>
            </div>
            <div className="analytics-card">
              <h3>Conversion Rate</h3>
              <div className="analytics-number">{analytics.conversionRate}%</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-leads-message">
          <div className="no-leads-content">
            <h3>📊 No Leads Yet</h3>
            <p>Start generating leads by running SEO audits!</p>
            <div className="no-leads-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span className="step-text">Enter a website URL</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-text">Run the SEO audit</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-text">Capture lead information</span>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <span className="step-text">View leads here!</span>
              </div>
            </div>
            <button onClick={onBack} className="start-audit-btn">
              🚀 Start Your First Audit
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search - Only show when there are leads */}
      {analytics && analytics.totalLeads > 0 && (
        <div className="dashboard-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Leads</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="converted">Converted</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          
          <button onClick={handleExportLeads} className="export-btn">
            📥 Export CSV
          </button>
        </div>
      )}

      {/* Leads Table - Only show when there are leads */}
      {analytics && analytics.totalLeads > 0 && (
        <div className="leads-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Website</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.leadData.name}</td>
                  <td>{lead.leadData.email}</td>
                  <td>{lead.leadData.company || '-'}</td>
                  <td>
                    <a 
                      href={lead.auditData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {lead.auditData.url.length > 30 
                        ? lead.auditData.url.substring(0, 30) + '...' 
                        : lead.auditData.url
                      }
                    </a>
                  </td>
                  <td>
                    <span 
                      className="score-badge"
                      style={{ color: getScoreColor(lead.auditData.overallScore) }}
                    >
                      {lead.auditData.overallScore}
                    </span>
                  </td>
                  <td>
                    <span className="grade-badge">{lead.auditData.grade}</span>
                  </td>
                  <td>{new Date(lead.timestamp).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                      className="status-select"
                      style={{ color: getStatusColor(lead.status) }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="converted">Converted</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="delete-btn"
                      title="Delete Lead"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeads.length === 0 && (
            <div className="no-leads">
              <p>No leads found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Top Performers */}
      {analytics && analytics.topScores && analytics.topScores.length > 0 && (
        <div className="top-performers">
          <h3>🏆 Top Performing Audits</h3>
          <div className="top-scores-list">
            {analytics.topScores.map((lead, index) => (
              <div key={index} className="top-score-item">
                <div className="rank">#{index + 1}</div>
                <div className="lead-info">
                  <div className="lead-name">{lead.name}</div>
                  <div className="lead-email">{lead.email}</div>
                </div>
                <div className="score-info">
                  <div className="score">{lead.score}</div>
                  <div className="website">{lead.url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadDashboard