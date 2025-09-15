// Google PageSpeed Insights API Service
class PageSpeedService {
  constructor() {
    this.apiKey = process.env.REACT_APP_PAGESPEED_API_KEY || 'demo-key'
    this.baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
  }

  async analyzePerformance(url, strategy = 'mobile') {
    try {
      // Skip API call if using demo key
      if (this.apiKey === 'demo-key') {
        console.warn('Using demo mode - PageSpeed API not configured')
        return this.generateMockPerformanceData(url)
      }

      const params = new URLSearchParams({
        url: url,
        key: this.apiKey,
        strategy: strategy,
        category: 'performance',
        category: 'accessibility',
        category: 'best-practices',
        category: 'seo'
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parsePageSpeedData(data)
    } catch (error) {
      console.error('PageSpeed API error:', error)
      return this.generateMockPerformanceData(url)
    }
  }

  parsePageSpeedData(data) {
    const lighthouse = data.lighthouseResult
    const categories = lighthouse.categories
    const audits = lighthouse.audits

    return {
      performance: {
        score: Math.round(categories.performance.score * 100),
        metrics: {
          firstContentfulPaint: this.getAuditValue(audits['first-contentful-paint']),
          largestContentfulPaint: this.getAuditValue(audits['largest-contentful-paint']),
          cumulativeLayoutShift: this.getAuditValue(audits['cumulative-layout-shift']),
          speedIndex: this.getAuditValue(audits['speed-index']),
          totalBlockingTime: this.getAuditValue(audits['total-blocking-time'])
        },
        opportunities: this.getOpportunities(audits),
        diagnostics: this.getDiagnostics(audits)
      },
      accessibility: {
        score: Math.round(categories.accessibility.score * 100),
        issues: this.getAccessibilityIssues(audits)
      },
      bestPractices: {
        score: Math.round(categories['best-practices'].score * 100),
        issues: this.getBestPracticesIssues(audits)
      },
      seo: {
        score: Math.round(categories.seo.score * 100),
        issues: this.getSEOIssues(audits)
      },
      overallScore: Math.round(
        (categories.performance.score + 
         categories.accessibility.score + 
         categories['best-practices'].score + 
         categories.seo.score) / 4 * 100
      )
    }
  }

  getAuditValue(audit) {
    if (!audit || !audit.numericValue) return null
    return {
      value: audit.numericValue,
      displayValue: audit.displayValue,
      score: audit.score
    }
  }

  getOpportunities(audits) {
    const opportunities = []
    const opportunityAudits = [
      'unused-css-rules',
      'unused-javascript',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images'
    ]

    opportunityAudits.forEach(auditId => {
      const audit = audits[auditId]
      if (audit && audit.details && audit.details.overallSavingsMs > 0) {
        opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          savings: audit.details.overallSavingsMs,
          impact: audit.details.overallSavingsBytes
        })
      }
    })

    return opportunities.sort((a, b) => b.savings - a.savings)
  }

  getDiagnostics(audits) {
    const diagnostics = []
    const diagnosticAudits = [
      'mainthread-work-breakdown',
      'bootup-time',
      'dom-size',
      'duplicated-javascript',
      'legacy-javascript',
      'viewport',
      'resource-summary'
    ]

    diagnosticAudits.forEach(auditId => {
      const audit = audits[auditId]
      if (audit && audit.details) {
        diagnostics.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          details: audit.details
        })
      }
    })

    return diagnostics
  }

  getAccessibilityIssues(audits) {
    const issues = []
    const accessibilityAudits = Object.keys(audits).filter(key => 
      key.startsWith('accessibility-') && audits[key].score !== null && audits[key].score < 1
    )

    accessibilityAudits.forEach(auditId => {
      const audit = audits[auditId]
      issues.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        severity: audit.score === 0 ? 'high' : 'medium',
        details: audit.details
      })
    })

    return issues
  }

  getBestPracticesIssues(audits) {
    const issues = []
    const bestPracticesAudits = Object.keys(audits).filter(key => 
      key.startsWith('best-practices-') && audits[key].score !== null && audits[key].score < 1
    )

    bestPracticesAudits.forEach(auditId => {
      const audit = audits[auditId]
      issues.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        severity: audit.score === 0 ? 'high' : 'medium',
        details: audit.details
      })
    })

    return issues
  }

  getSEOIssues(audits) {
    const issues = []
    const seoAudits = Object.keys(audits).filter(key => 
      key.startsWith('seo-') && audits[key].score !== null && audits[key].score < 1
    )

    seoAudits.forEach(auditId => {
      const audit = audits[auditId]
      issues.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        severity: audit.score === 0 ? 'high' : 'medium',
        details: audit.details
      })
    })

    return issues
  }

  generateMockPerformanceData(url) {
    // Generate realistic mock data for demo purposes
    const baseScore = Math.floor(Math.random() * 40) + 40 // 40-80 range
    const variation = Math.floor(Math.random() * 20) - 10 // ±10 variation

    return {
      performance: {
        score: Math.max(0, Math.min(100, baseScore + variation)),
        metrics: {
          firstContentfulPaint: {
            value: Math.random() * 2000 + 1000,
            displayValue: '1.2s',
            score: Math.random()
          },
          largestContentfulPaint: {
            value: Math.random() * 3000 + 2000,
            displayValue: '2.5s',
            score: Math.random()
          },
          cumulativeLayoutShift: {
            value: Math.random() * 0.2,
            displayValue: '0.1',
            score: Math.random()
          },
          speedIndex: {
            value: Math.random() * 3000 + 2000,
            displayValue: '2.8s',
            score: Math.random()
          },
          totalBlockingTime: {
            value: Math.random() * 500 + 100,
            displayValue: '300ms',
            score: Math.random()
          }
        },
        opportunities: [
          {
            id: 'unused-css-rules',
            title: 'Remove unused CSS',
            description: 'Remove dead rules from stylesheets and defer the loading of CSS not used for above-the-fold content.',
            savings: Math.floor(Math.random() * 1000) + 500,
            impact: Math.floor(Math.random() * 100000) + 50000
          },
          {
            id: 'unused-javascript',
            title: 'Remove unused JavaScript',
            description: 'Remove unused JavaScript to reduce bytes consumed by network activity.',
            savings: Math.floor(Math.random() * 2000) + 1000,
            impact: Math.floor(Math.random() * 200000) + 100000
          }
        ],
        diagnostics: []
      },
      accessibility: {
        score: Math.max(0, Math.min(100, baseScore + variation + 10)),
        issues: []
      },
      bestPractices: {
        score: Math.max(0, Math.min(100, baseScore + variation + 5)),
        issues: []
      },
      seo: {
        score: Math.max(0, Math.min(100, baseScore + variation + 15)),
        issues: []
      },
      overallScore: Math.max(0, Math.min(100, baseScore + variation + 5))
    }
  }
}

export default PageSpeedService
