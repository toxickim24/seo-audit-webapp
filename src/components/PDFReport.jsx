import React, { useState } from 'react'
import PDFService from '../services/PDFService'

function PDFReport({ auditData, userInfo, onNewAudit }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)
  const pdfService = new PDFService()

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      const result = await pdfService.generatePDF(auditData, userInfo)
      if (result.success) {
        if (result.isHTMLFallback) {
          // Handle HTML fallback
          const link = document.createElement('a')
          link.href = result.url
          link.download = result.filename
          link.click()
          alert('PDF library not available. HTML report downloaded instead. You can print it using Ctrl+P.')
        } else {
          // Handle normal PDF
          pdfService.downloadPDF(result.blob, result.filename)
        }
        setReportGenerated(true)
      } else {
        alert('Failed to generate PDF: ' + result.error)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF: ' + error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEmailPDF = async () => {
    setIsGenerating(true)
    setEmailStatus('Sending email...')
    
    try {
      // First generate the PDF/HTML report
      const pdfResult = await pdfService.generatePDF(auditData, userInfo)
      if (!pdfResult.success) {
        setEmailStatus('Failed to generate report: ' + pdfResult.error)
        return
      }
      
      if (pdfResult.isHTMLFallback) {
        setEmailStatus('PDF library not available. Please try downloading the HTML report instead.')
        return
      }
      
      // Then email it
      const result = await pdfService.emailPDF(auditData, userInfo, pdfService)
      setEmailStatus(result.message)
      
      if (result.success) {
        setReportGenerated(true)
        setTimeout(() => setEmailStatus(null), 5000)
      }
    } catch (error) {
      setEmailStatus('Failed to send email: ' + error.message)
      setTimeout(() => setEmailStatus(null), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60'
    if (score >= 60) return '#f39c12'
    return '#e74c3c'
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="pdf-report">
      <div className="report-header">
        <h2>📊 Your SEO Audit Report</h2>
        <p>Comprehensive analysis for {auditData.url}</p>
      </div>

      <div className="report-content">
        <div className="report-summary">
          <div className="overall-score-card">
            <h3>Overall SEO Score</h3>
            <div className="score-display-large">
              <span 
                className="score-number-large"
                style={{ color: getScoreColor(auditData.overallScore) }}
              >
                {auditData.overallScore}
              </span>
              <span className="score-grade-large">{auditData.summary.grade}</span>
            </div>
            <p className="score-description">{auditData.summary.description}</p>
          </div>

          <div className="score-breakdown">
            <h4>Category Breakdown</h4>
            <div className="breakdown-grid">
              {Object.entries(auditData.categories).map(([category, data]) => (
                <div key={category} className="breakdown-item">
                  <span className="category-name">
                    {category.charAt(0).toUpperCase() + category.slice(1)} SEO
                  </span>
                  <div className="category-score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${data.score}%`,
                        backgroundColor: getScoreColor(data.score)
                      }}
                    ></div>
                  </div>
                  <span 
                    className="category-score"
                    style={{ color: getScoreColor(data.score) }}
                  >
                    {data.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detailed-analysis">
          <h3>Detailed Analysis</h3>
          
          {Object.entries(auditData.categories).map(([category, data]) => (
            <div key={category} className="category-section">
              <div className="category-header">
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)} SEO</h4>
                <span 
                  className="category-score-badge"
                  style={{ color: getScoreColor(data.score) }}
                >
                  {data.score}/100
                </span>
              </div>

              {data.issues && data.issues.length > 0 && (
                <div className="issues-section">
                  <h5>Issues Found</h5>
                  {data.issues.map((issue, index) => (
                    <div key={index} className="issue-item">
                      <span className="issue-severity">
                        {getSeverityIcon(issue.severity)} {issue.severity.toUpperCase()}
                      </span>
                      <div className="issue-content">
                        <h6>{issue.message}</h6>
                        <p>{issue.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.strengths && data.strengths.length > 0 && (
                <div className="strengths-section">
                  <h5>Strengths</h5>
                  <ul className="strengths-list">
                    {data.strengths.map((strength, index) => (
                      <li key={index}>✅ {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="recommendations-section">
          <h3>Top Recommendations</h3>
          <div className="recommendations-list">
            {auditData.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-number">{index + 1}</div>
                <div className="recommendation-content">
                  <h4>{rec.message}</h4>
                  <p>{rec.recommendation}</p>
                  <span className="recommendation-priority">
                    Priority: {rec.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="next-steps">
          <h3>Next Steps</h3>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Address High Priority Issues</h4>
                <p>Focus on the most critical SEO problems first</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Optimize Content</h4>
                <p>Improve your content based on our recommendations</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Monitor Progress</h4>
                <p>Track your improvements with regular audits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="report-actions">
        {!reportGenerated ? (
          <div className="pdf-actions">
            <button 
              onClick={generatePDF}
              disabled={isGenerating}
              className="generate-pdf-btn"
            >
              {isGenerating ? 'Generating PDF...' : '📄 Download PDF Report'}
            </button>
            
            <button 
              onClick={handleEmailPDF}
              disabled={isGenerating}
              className="email-pdf-btn"
            >
              {isGenerating ? 'Sending...' : '📧 Email PDF Report'}
            </button>

            {emailStatus && (
              <div className="email-status">
                <p>{emailStatus}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="report-success">
            <div className="success-message">
              <h3>✅ Report Generated Successfully!</h3>
              <p>Your SEO audit report has been processed!</p>
              <p>Check your downloads folder or email for the detailed PDF report.</p>
            </div>
            <div className="success-actions">
              <button onClick={onNewAudit} className="new-audit-btn">
                🔄 Run Another Audit
              </button>
              <button 
                onClick={() => window.print()}
                className="print-btn"
              >
                🖨️ Print This Page
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="report-footer">
        <p>
          This report was generated on {new Date().toLocaleDateString()} for {userInfo.name}
        </p>
        <p>
          Generated by SEO Mojo - Professional SEO Analysis Tool
        </p>
      </div>
    </div>
  )
}

export default PDFReport
