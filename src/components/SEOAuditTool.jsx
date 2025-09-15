import React, { useState, useEffect } from 'react'
import AuditResults from './AuditResults'
import LoadingSpinner from './LoadingSpinner'
import OnPageAnalyzer from './OnPageAnalyzer'
import TechnicalAnalyzer from './TechnicalAnalyzer'
import EmbedCodeModal from './EmbedCodeModal'

function SEOAuditTool({ onAuditComplete, initialUrl = '' }) {
  const [url, setUrl] = useState(initialUrl)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [auditResults, setAuditResults] = useState(null)
  const [error, setError] = useState(null)
  const [showEmbedModal, setShowEmbedModal] = useState(false)

  // Set initial URL if provided
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl)
    }
  }, [initialUrl])

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleAudit = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setError(null)
    setIsAnalyzing(true)
    setAuditResults(null)

    try {
      // Initialize analyzers
      const onPageAnalyzer = new OnPageAnalyzer()
      const technicalAnalyzer = new TechnicalAnalyzer()
      
      // Run both analyses in parallel
      const [onPageResults, technicalResults] = await Promise.all([
        onPageAnalyzer.analyzeWebsite(url),
        technicalAnalyzer.analyzeTechnicalSEO(url)
      ])
      
      console.log('On-page analysis results:', onPageResults)
      console.log('Technical analysis results:', technicalResults)
      
      // Calculate overall score
      const overallScore = Math.round((onPageResults.overallScore + technicalResults.overallScore) / 2)
      
      // Generate comprehensive results
      const results = {
        url: url,
        timestamp: new Date().toISOString(),
        overallScore: overallScore,
        categories: {
          onPage: {
            score: onPageResults.overallScore,
            issues: onPageResults.issues || [],
            strengths: generateStrengths(onPageResults.analysis),
            details: onPageResults.analysis
          },
          technical: {
            score: technicalResults.overallScore,
            issues: technicalResults.issues || [],
            strengths: generateTechnicalStrengths(technicalResults.analysis),
            details: technicalResults.analysis
          },
          performance: {
            score: technicalResults.analysis?.performance?.score || 75,
            issues: technicalResults.analysis?.performance?.issues || [],
            strengths: generatePerformanceStrengths(technicalResults.analysis?.performance),
            details: technicalResults.analysis?.performance || {}
          },
          content: {
            score: onPageResults.scores?.content || 0,
            issues: onPageResults.analysis?.content?.issues || [],
            strengths: generateContentStrengths(onPageResults.analysis?.content || {}),
            details: onPageResults.analysis?.content || {}
          }
        },
        recommendations: [
          ...(onPageResults.issues || []),
          ...(technicalResults.issues || [])
        ],
        summary: {
          grade: getGradeFromScore(overallScore),
          score: overallScore,
          description: getDescriptionFromScore(overallScore),
          priorityIssues: [
            ...(onPageResults.issues || []),
            ...(technicalResults.issues || [])
          ].filter(issue => issue.severity === 'high').length,
          totalIssues: [
            ...(onPageResults.issues || []),
            ...(technicalResults.issues || [])
          ].length
        }
      }
      
      console.log('Final results:', results)
      setAuditResults(results)
      onAuditComplete(results)
    } catch (err) {
      console.error('Audit error:', err)
      setError(err.message || 'Failed to analyze website. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Helper functions to generate strengths
  const generateStrengths = (analysis) => {
    if (!analysis) return ['Analysis data not available']
    
    const strengths = []
    
    if (analysis.title?.present && analysis.title?.optimal) {
      strengths.push('Title tag is well optimized')
    }
    if (analysis.metaDescription?.present && analysis.metaDescription?.optimal) {
      strengths.push('Meta description is well optimized')
    }
    if (analysis.headings?.counts?.h1 === 1) {
      strengths.push('Proper H1 tag structure')
    }
    if (analysis.images?.withAlt > 0) {
      strengths.push('Images have alt attributes')
    }
    if (analysis.links?.internal > 0) {
      strengths.push('Good internal linking structure')
    }
    if (analysis.schema?.present) {
      strengths.push('Schema markup is present')
    }
    
    return strengths.length > 0 ? strengths : ['Basic SEO elements are present']
  }

  const generateTechnicalStrengths = (technical) => {
    if (!technical) return ['Technical analysis not available']
    
    const strengths = []
    
    if (technical.https?.enabled) strengths.push('HTTPS is properly configured')
    if (technical.robots?.present) strengths.push('robots.txt is present and accessible')
    if (technical.sitemap?.present) strengths.push('XML sitemap is found')
    if (technical.indexability?.indexable) strengths.push('Page is indexable by search engines')
    if (technical.security?.https) strengths.push('Site uses secure HTTPS protocol')
    
    return strengths.length > 0 ? strengths : ['Some technical elements are configured']
  }

  const generatePerformanceStrengths = (performance) => {
    if (!performance) return ['Performance analysis not available']
    
    const strengths = []
    
    if (performance.score >= 80) strengths.push('Good performance score')
    if (performance.coreWebVitals?.lcp <= 2.5) strengths.push('Good Largest Contentful Paint')
    if (performance.coreWebVitals?.fid <= 100) strengths.push('Good First Input Delay')
    if (performance.coreWebVitals?.cls <= 0.1) strengths.push('Good Cumulative Layout Shift')
    
    return strengths.length > 0 ? strengths : ['Performance metrics available']
  }

  const getGradeFromScore = (score) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  const getDescriptionFromScore = (score) => {
    if (score >= 90) return 'Excellent SEO performance'
    if (score >= 80) return 'Good SEO performance with minor issues'
    if (score >= 70) return 'Average SEO performance, several areas need attention'
    if (score >= 60) return 'Below average SEO performance, many issues to address'
    return 'Needs significant improvement'
  }

  const generateContentStrengths = (content) => {
    if (!content) return ['Content analysis not available']
    
    const strengths = []
    
    if (content.wordCount >= 500) {
      strengths.push('Good content length')
    }
    if (content.paragraphCount >= 5) {
      strengths.push('Well-structured content with multiple paragraphs')
    }
    if (content.averageParagraphLength >= 50 && content.averageParagraphLength <= 150) {
      strengths.push('Optimal paragraph length')
    }
    
    return strengths.length > 0 ? strengths : ['Content structure is present']
  }

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    setError(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAudit()
    }
  }

  return (
    <div className="seo-audit-tool">
      <div className="audit-hero">
        <h1>🚀 SEO Audit Tool</h1>
        <p className="hero-subtitle">
          Get instant, comprehensive SEO analysis with actionable recommendations
        </p>
        <p className="hero-description">
          Analyze any website for on-page SEO, technical issues, and Core Web Vitals. 
          Get a detailed PDF report delivered to your inbox.
        </p>
      </div>

      <div className="audit-form">
        <div className="url-input-container">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="url-input"
            disabled={isAnalyzing}
          />
          <button
            onClick={handleAudit}
            disabled={isAnalyzing || !url.trim()}
            className="audit-button"
          >
            {isAnalyzing ? 'Analyzing...' : '🔍 Analyze SEO'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </div>

      {isAnalyzing && (
        <LoadingSpinner />
      )}

      {auditResults && (
        <AuditResults 
          results={auditResults}
          onNewAudit={() => {
            setAuditResults(null)
            setUrl('')
          }}
        />
      )}

      <div className="features-preview">
        <h3>What We Analyze</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h4>On-Page SEO</h4>
            <ul>
              <li>Title tags & meta descriptions</li>
              <li>Heading structure (H1-H6)</li>
              <li>Image alt attributes</li>
              <li>Internal linking</li>
              <li>Schema markup</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h4>Technical SEO</h4>
            <ul>
              <li>Page speed & Core Web Vitals</li>
              <li>Mobile responsiveness</li>
              <li>HTTPS & security</li>
              <li>Robots.txt & sitemap</li>
              <li>Indexability issues</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Content Analysis</h4>
            <ul>
              <li>Keyword density & distribution</li>
              <li>Content length & quality</li>
              <li>Readability scores</li>
              <li>Duplicate content detection</li>
              <li>Content gaps</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h3>Ready to improve your SEO?</h3>
        <p>Get your free comprehensive SEO audit report delivered to your inbox</p>
        <div className="cta-features">
          <span>✅ No registration required</span>
          <span>✅ Instant analysis</span>
          <span>✅ PDF report included</span>
          <span>✅ Actionable recommendations</span>
        </div>
        <div className="cta-actions">
          <button 
            className="embed-btn"
            onClick={() => setShowEmbedModal(true)}
          >
            🔗 Get Embed Code
          </button>
        </div>
      </div>

      <EmbedCodeModal 
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
      />
    </div>
  )
}

export default SEOAuditTool
