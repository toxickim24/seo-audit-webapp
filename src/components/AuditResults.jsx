import React, { useState } from 'react'

function AuditResults({ results, onNewAudit }) {
  const [activeTab, setActiveTab] = useState('overview')

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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#e74c3c'
      case 'medium': return '#f39c12'
      case 'low': return '#27ae60'
      default: return '#95a5a6'
    }
  }

  return (
    <div className="audit-results">
      <div className="results-header">
        <div className="overall-score">
          <div className="score-circle">
            <div 
              className="score-fill"
              style={{ 
                background: `conic-gradient(${getScoreColor(results.overallScore)} 0deg ${results.overallScore * 3.6}deg, #ecf0f1 0deg)`
              }}
            >
              <div className="score-inner">
                <span className="score-number">{results.overallScore}</span>
                <span className="score-grade">{results.summary.grade}</span>
              </div>
            </div>
          </div>
          <div className="score-details">
            <h2>SEO Score: {results.overallScore}/100</h2>
            <p className="score-description">{results.summary.description}</p>
            <div className="score-stats">
              <span className="stat">
                <strong>{results.summary.priorityIssues}</strong> High Priority Issues
              </span>
              <span className="stat">
                <strong>{results.summary.totalIssues}</strong> Total Issues
              </span>
            </div>
          </div>
        </div>
        
        <div className="results-actions">
          <button onClick={onNewAudit} className="new-audit-btn">
            🔄 New Audit
          </button>
        </div>
      </div>

      <div className="results-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'onpage' ? 'active' : ''}
          onClick={() => setActiveTab('onpage')}
        >
          📄 On-Page SEO
        </button>
        <button 
          className={activeTab === 'technical' ? 'active' : ''}
          onClick={() => setActiveTab('technical')}
        >
          ⚙️ Technical SEO
        </button>
        <button 
          className={activeTab === 'performance' ? 'active' : ''}
          onClick={() => setActiveTab('performance')}
        >
          🚀 Performance
        </button>
        <button 
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          📝 Content
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="category-scores">
              <h3>Category Breakdown</h3>
              <div className="scores-grid">
                {Object.entries(results.categories).map(([category, data]) => (
                  <div key={category} className="category-score">
                    <div className="category-header">
                      <h4>{category.charAt(0).toUpperCase() + category.slice(1)} SEO</h4>
                      <span 
                        className="category-score-number"
                        style={{ color: getScoreColor(data.score) }}
                      >
                        {data.score}/100
                      </span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-fill"
                        style={{ 
                          width: `${data.score}%`,
                          backgroundColor: getScoreColor(data.score)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="top-recommendations">
              <h3>Top Recommendations</h3>
              <div className="recommendations-list">
                {results.recommendations.slice(0, 5).map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <span className="recommendation-icon">
                      {getSeverityIcon(rec.severity)}
                    </span>
                    <div className="recommendation-content">
                      <h4>{rec.message}</h4>
                      <p>{rec.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'onpage' && (
          <div className="category-tab">
            <div className="category-header">
              <h3>On-Page SEO Analysis</h3>
              <div className="category-score-badge">
                Score: <span style={{ color: getScoreColor(results.categories.onPage.score) }}>
                  {results.categories.onPage.score}/100
                </span>
              </div>
            </div>
            
            {/* Detailed On-Page Analysis */}
            {results.categories.onPage.details && (
              <div className="detailed-onpage">
                <div className="onpage-grid">
                  <div className="onpage-item">
                    <h4>📝 Title Tag</h4>
                    <div className="element-details">
                      <p><strong>Present:</strong> {results.categories.onPage.details.title.present ? 'Yes' : 'No'}</p>
                      <p><strong>Text:</strong> {results.categories.onPage.details.title.text || 'Not found'}</p>
                      <p><strong>Length:</strong> {results.categories.onPage.details.title.length} characters</p>
                      <p><strong>Optimal:</strong> {results.categories.onPage.details.title.optimal ? '✅ Yes' : '❌ No'}</p>
                    </div>
                  </div>

                  <div className="onpage-item">
                    <h4>📄 Meta Description</h4>
                    <div className="element-details">
                      <p><strong>Present:</strong> {results.categories.onPage.details.metaDescription.present ? 'Yes' : 'No'}</p>
                      <p><strong>Text:</strong> {results.categories.onPage.details.metaDescription.text || 'Not found'}</p>
                      <p><strong>Length:</strong> {results.categories.onPage.details.metaDescription.length} characters</p>
                      <p><strong>Optimal:</strong> {results.categories.onPage.details.metaDescription.optimal ? '✅ Yes' : '❌ No'}</p>
                    </div>
                  </div>

                  <div className="onpage-item">
                    <h4>📋 Headings Structure</h4>
                    <div className="element-details">
                      <p><strong>H1:</strong> {results.categories.onPage.details.headings.counts.h1}</p>
                      <p><strong>H2:</strong> {results.categories.onPage.details.headings.counts.h2}</p>
                      <p><strong>H3:</strong> {results.categories.onPage.details.headings.counts.h3}</p>
                      <p><strong>H4:</strong> {results.categories.onPage.details.headings.counts.h4}</p>
                    </div>
                  </div>

                  <div className="onpage-item">
                    <h4>🖼️ Images</h4>
                    <div className="element-details">
                      <p><strong>Total:</strong> {results.categories.onPage.details.images.total}</p>
                      <p><strong>With Alt:</strong> {results.categories.onPage.details.images.withAlt}</p>
                      <p><strong>Without Alt:</strong> {results.categories.onPage.details.images.withoutAlt}</p>
                      <p><strong>Alt Coverage:</strong> {results.categories.onPage.details.images.total > 0 ? 
                        Math.round((results.categories.onPage.details.images.withAlt / results.categories.onPage.details.images.total) * 100) : 0}%</p>
                    </div>
                  </div>

                  <div className="onpage-item">
                    <h4>🔗 Links</h4>
                    <div className="element-details">
                      <p><strong>Total:</strong> {results.categories.onPage.details.links.total}</p>
                      <p><strong>Internal:</strong> {results.categories.onPage.details.links.internal}</p>
                      <p><strong>External:</strong> {results.categories.onPage.details.links.external}</p>
                      <p><strong>With Title:</strong> {results.categories.onPage.details.links.withTitle}</p>
                    </div>
                  </div>

                  <div className="onpage-item">
                    <h4>🏷️ Schema Markup</h4>
                    <div className="element-details">
                      <p><strong>Present:</strong> {results.categories.onPage.details.schema.present ? 'Yes' : 'No'}</p>
                      <p><strong>Count:</strong> {results.categories.onPage.details.schema.count}</p>
                      <p><strong>Types:</strong> {results.categories.onPage.details.schema.types.join(', ') || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="issues-section">
              <h4>Issues Found</h4>
              {results.categories.onPage.issues.map((issue, index) => (
                <div key={index} className="issue-item">
                  <span 
                    className="issue-severity"
                    style={{ color: getSeverityColor(issue.severity) }}
                  >
                    {getSeverityIcon(issue.severity)} {issue.severity.toUpperCase()}
                  </span>
                  <div className="issue-content">
                    <h5>{issue.message}</h5>
                    <p>{issue.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="strengths-section">
              <h4>Strengths</h4>
              <ul className="strengths-list">
                {results.categories.onPage.strengths.map((strength, index) => (
                  <li key={index}>✅ {strength}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="category-tab">
            <div className="category-header">
              <h3>Technical SEO Analysis</h3>
              <div className="category-score-badge">
                Score: <span style={{ color: getScoreColor(results.categories.technical.score) }}>
                  {results.categories.technical.score}/100
                </span>
              </div>
            </div>
            
            {/* Detailed Technical Analysis */}
            {results.categories.technical.details && (
              <div className="detailed-technical">
                <div className="technical-grid">
                  <div className="technical-item">
                    <h4>🔒 HTTPS & Security</h4>
                    <div className="element-details">
                      <p><strong>HTTPS:</strong> {results.categories.technical.details.https?.enabled ? '✅ Enabled' : '❌ Not Enabled'}</p>
                      <p><strong>Protocol:</strong> {results.categories.technical.details.https?.details?.protocol || 'Unknown'}</p>
                      <p><strong>Redirect:</strong> {results.categories.technical.details.https?.redirect ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>HSTS:</strong> {results.categories.technical.details.security?.hsts ? '✅ Enabled' : '❌ Not Enabled'}</p>
                    </div>
                  </div>

                  <div className="technical-item">
                    <h4>🤖 Robots.txt</h4>
                    <div className="element-details">
                      <p><strong>Present:</strong> {results.categories.technical.details.robots?.present ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>Accessible:</strong> {results.categories.technical.details.robots?.accessible ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>User Agents:</strong> {results.categories.technical.details.robots?.details?.rules?.userAgents?.length || 0}</p>
                      <p><strong>Sitemap Reference:</strong> {results.categories.technical.details.robots?.details?.rules?.sitemaps?.length > 0 ? '✅ Yes' : '❌ No'}</p>
                    </div>
                  </div>

                  <div className="technical-item">
                    <h4>🗺️ XML Sitemap</h4>
                    <div className="element-details">
                      <p><strong>Present:</strong> {results.categories.technical.details.sitemap?.present ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>Accessible:</strong> {results.categories.technical.details.sitemap?.accessible ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>URLs:</strong> {results.categories.technical.details.sitemap?.details?.urls || 0}</p>
                      <p><strong>Valid XML:</strong> {results.categories.technical.details.sitemap?.details?.valid ? '✅ Yes' : '❌ No'}</p>
                    </div>
                  </div>

                  <div className="technical-item">
                    <h4>🚀 Performance</h4>
                    <div className="element-details">
                      <p><strong>Score:</strong> {results.categories.technical.details.performance?.score || 0}/100</p>
                      <p><strong>LCP:</strong> {results.categories.technical.details.performance?.coreWebVitals?.lcp?.toFixed(2) || 0}s</p>
                      <p><strong>FID:</strong> {results.categories.technical.details.performance?.coreWebVitals?.fid || 0}ms</p>
                      <p><strong>CLS:</strong> {results.categories.technical.details.performance?.coreWebVitals?.cls?.toFixed(3) || 0}</p>
                    </div>
                  </div>

                  <div className="technical-item">
                    <h4>🔍 Indexability</h4>
                    <div className="element-details">
                      <p><strong>Indexable:</strong> {results.categories.technical.details.indexability?.indexable ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>Crawlable:</strong> {results.categories.technical.details.indexability?.crawlable ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>Blocked:</strong> {results.categories.technical.details.indexability?.details?.blocked ? '❌ Yes' : '✅ No'}</p>
                      <p><strong>NoIndex:</strong> {results.categories.technical.details.indexability?.details?.noindex ? '❌ Yes' : '✅ No'}</p>
                    </div>
                  </div>

                  <div className="technical-item">
                    <h4>🛡️ Security Headers</h4>
                    <div className="element-details">
                      <p><strong>HTTPS:</strong> {results.categories.technical.details.security?.https ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>HSTS:</strong> {results.categories.technical.details.security?.hsts ? '✅ Yes' : '❌ No'}</p>
                      <p><strong>Secure:</strong> {results.categories.technical.details.security?.details?.secure ? '✅ Yes' : '❌ No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="issues-section">
              <h4>Technical Issues Found</h4>
              {results.categories.technical.issues.map((issue, index) => (
                <div key={index} className="issue-item">
                  <span 
                    className="issue-severity"
                    style={{ color: getSeverityColor(issue.severity) }}
                  >
                    {getSeverityIcon(issue.severity)} {issue.severity.toUpperCase()}
                  </span>
                  <div className="issue-content">
                    <h5>{issue.message}</h5>
                    <p>{issue.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="strengths-section">
              <h4>Technical Strengths</h4>
              <ul className="strengths-list">
                {results.categories.technical.strengths.map((strength, index) => (
                  <li key={index}>✅ {strength}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="category-tab">
            <div className="category-header">
              <h3>Performance Analysis</h3>
              <div className="category-score-badge">
                Score: <span style={{ color: getScoreColor(results.categories.performance.score) }}>
                  {results.categories.performance.score}/100
                </span>
              </div>
            </div>
            
            <div className="performance-metrics">
              <h4>Core Web Vitals</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">LCP (Largest Contentful Paint)</span>
                  <span className="metric-value">{results.categories.performance.details.coreWebVitals.lcp}s</span>
                  <span className="metric-status good">Good</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">FID (First Input Delay)</span>
                  <span className="metric-value">{results.categories.performance.details.coreWebVitals.fid}ms</span>
                  <span className="metric-status good">Good</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">CLS (Cumulative Layout Shift)</span>
                  <span className="metric-value">{results.categories.performance.details.coreWebVitals.cls}</span>
                  <span className="metric-status good">Good</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="category-tab">
            <div className="category-header">
              <h3>Content Analysis</h3>
              <div className="category-score-badge">
                Score: <span style={{ color: getScoreColor(results.categories.content.score) }}>
                  {results.categories.content.score}/100
                </span>
              </div>
            </div>
            
            <div className="content-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Word Count:</span>
                  <span className="detail-value">{results.categories.content.details.wordCount.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Readability Score:</span>
                  <span className="detail-value">{results.categories.content.details.readabilityScore}/100</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Keyword Density:</span>
                  <span className="detail-value">{results.categories.content.details.keywordDensity}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duplicate Content:</span>
                  <span className={`detail-value ${results.categories.content.details.duplicateContent ? 'bad' : 'good'}`}>
                    {results.categories.content.details.duplicateContent ? '❌ Found' : '✅ None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditResults
