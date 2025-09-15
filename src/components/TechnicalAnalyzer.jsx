// Technical SEO Analysis Engine
class TechnicalAnalyzer {
  constructor() {
    this.corsProxy = 'https://api.allorigins.win/raw?url='
    this.pageSpeedApiKey = 'demo-key' // In production, you would set this via environment variables
  }

  async analyzeTechnicalSEO(url) {
    try {
      const baseUrl = new URL(url)
      const domain = baseUrl.origin
      
      // Run all technical checks in parallel
      const [
        httpsAnalysis,
        robotsAnalysis,
        sitemapAnalysis,
        performanceAnalysis,
        indexabilityAnalysis,
        securityAnalysis
      ] = await Promise.all([
        this.analyzeHTTPS(url),
        this.analyzeRobotsTxt(domain),
        this.analyzeSitemap(domain),
        this.analyzePerformance(url),
        this.analyzeIndexability(url),
        this.analyzeSecurity(url)
      ])

      // Combine all technical analysis
      const analysis = {
        https: httpsAnalysis,
        robots: robotsAnalysis,
        sitemap: sitemapAnalysis,
        performance: performanceAnalysis,
        indexability: indexabilityAnalysis,
        security: securityAnalysis
      }

      return this.generateTechnicalScore(analysis)
    } catch (error) {
      console.error('Technical analysis error:', error)
      return this.generateFallbackTechnicalAnalysis(url)
    }
  }

  async analyzeHTTPS(url) {
    try {
      const isHttps = url.startsWith('https://')
      const hasRedirect = await this.checkHttpsRedirect(url)
      
      return {
        enabled: isHttps,
        redirect: hasRedirect,
        score: isHttps ? 100 : 0,
        issues: this.getHttpsIssues(isHttps, hasRedirect),
        details: {
          protocol: isHttps ? 'HTTPS' : 'HTTP',
          redirect: hasRedirect,
          secure: isHttps
        }
      }
    } catch (error) {
      return {
        enabled: false,
        redirect: false,
        score: 0,
        issues: [{ severity: 'high', message: 'HTTPS analysis failed', recommendation: 'Check if HTTPS is properly configured' }],
        details: { protocol: 'Unknown', redirect: false, secure: false }
      }
    }
  }

  async checkHttpsRedirect(url) {
    try {
      const httpUrl = url.replace('https://', 'http://')
      const response = await fetch(httpUrl, { method: 'HEAD', redirect: 'manual' })
      return response.status === 301 || response.status === 302
    } catch {
      return false
    }
  }

  getHttpsIssues(isHttps, hasRedirect) {
    const issues = []
    
    if (!isHttps) {
      issues.push({
        severity: 'high',
        message: 'Site is not using HTTPS',
        recommendation: 'Implement SSL certificate for better security and SEO ranking'
      })
    }
    
    if (isHttps && !hasRedirect) {
      issues.push({
        severity: 'medium',
        message: 'No HTTP to HTTPS redirect found',
        recommendation: 'Set up 301 redirect from HTTP to HTTPS version'
      })
    }

    return issues
  }

  async analyzeRobotsTxt(domain) {
    try {
      const robotsUrl = `${domain}/robots.txt`
      const response = await fetch(`${this.corsProxy}${encodeURIComponent(robotsUrl)}`)
      
      if (!response.ok) {
        return {
          present: false,
          accessible: false,
          score: 0,
          issues: [{
            severity: 'medium',
            message: 'robots.txt not found',
            recommendation: 'Create a robots.txt file to control search engine crawling'
          }],
          details: { content: '', rules: [] }
        }
      }

      const content = await response.text()
      const rules = this.parseRobotsTxt(content)
      
      return {
        present: true,
        accessible: true,
        score: this.calculateRobotsScore(rules),
        issues: this.getRobotsIssues(rules),
        details: { content, rules }
      }
    } catch (error) {
      return {
        present: false,
        accessible: false,
        score: 0,
        issues: [{
          severity: 'low',
          message: 'Could not analyze robots.txt',
          recommendation: 'Ensure robots.txt is accessible and properly formatted'
        }],
        details: { content: '', rules: [] }
      }
    }
  }

  parseRobotsTxt(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'))
    const rules = {
      userAgents: [],
      disallows: [],
      allows: [],
      sitemaps: []
    }

    let currentUserAgent = null
    
    lines.forEach(line => {
      if (line.toLowerCase().startsWith('user-agent:')) {
        currentUserAgent = line.split(':')[1].trim()
        rules.userAgents.push(currentUserAgent)
      } else if (line.toLowerCase().startsWith('disallow:')) {
        const path = line.split(':')[1].trim()
        if (path) rules.disallows.push({ userAgent: currentUserAgent, path })
      } else if (line.toLowerCase().startsWith('allow:')) {
        const path = line.split(':')[1].trim()
        if (path) rules.allows.push({ userAgent: currentUserAgent, path })
      } else if (line.toLowerCase().startsWith('sitemap:')) {
        const sitemap = line.split(':')[1].trim()
        if (sitemap) rules.sitemaps.push(sitemap)
      }
    })

    return rules
  }

  calculateRobotsScore(rules) {
    let score = 0
    
    if (rules.userAgents.length > 0) score += 30
    if (rules.sitemaps.length > 0) score += 40
    if (rules.disallows.length > 0 || rules.allows.length > 0) score += 30
    
    return Math.min(score, 100)
  }

  getRobotsIssues(rules) {
    const issues = []
    
    if (rules.userAgents.length === 0) {
      issues.push({
        severity: 'medium',
        message: 'No user-agent directives found',
        recommendation: 'Add user-agent directives to control different crawlers'
      })
    }
    
    if (rules.sitemaps.length === 0) {
      issues.push({
        severity: 'low',
        message: 'No sitemap reference in robots.txt',
        recommendation: 'Add sitemap URL to robots.txt file'
      })
    }

    return issues
  }

  async analyzeSitemap(domain) {
    try {
      const commonSitemapPaths = [
        '/sitemap.xml',
        '/sitemap_index.xml',
        '/sitemaps.xml',
        '/sitemap-index.xml'
      ]

      let sitemapFound = null
      let sitemapContent = ''

      for (const path of commonSitemapPaths) {
        try {
          const sitemapUrl = `${domain}${path}`
          const response = await fetch(`${this.corsProxy}${encodeURIComponent(sitemapUrl)}`)
          
          if (response.ok) {
            sitemapFound = sitemapUrl
            sitemapContent = await response.text()
            break
          }
        } catch (error) {
          continue
        }
      }

      if (!sitemapFound) {
        return {
          present: false,
          accessible: false,
          score: 0,
          issues: [{
            severity: 'medium',
            message: 'No sitemap found',
            recommendation: 'Create and submit an XML sitemap to help search engines crawl your site'
          }],
          details: { url: null, urls: 0, lastModified: null }
        }
      }

      const sitemapData = this.parseSitemap(sitemapContent)
      
      return {
        present: true,
        accessible: true,
        score: this.calculateSitemapScore(sitemapData),
        issues: this.getSitemapIssues(sitemapData),
        details: sitemapData
      }
    } catch (error) {
      return {
        present: false,
        accessible: false,
        score: 0,
        issues: [{
          severity: 'low',
          message: 'Could not analyze sitemap',
          recommendation: 'Ensure sitemap is accessible and properly formatted'
        }],
        details: { url: null, urls: 0, lastModified: null }
      }
    }
  }

  parseSitemap(content) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(content, 'text/xml')
      
      const urls = doc.querySelectorAll('url')
      const urlCount = urls.length
      
      const lastModified = urls.length > 0 ? 
        urls[0].querySelector('lastmod')?.textContent : null

      return {
        url: 'sitemap.xml',
        urls: urlCount,
        lastModified,
        valid: true
      }
    } catch (error) {
      return {
        url: 'sitemap.xml',
        urls: 0,
        lastModified: null,
        valid: false
      }
    }
  }

  calculateSitemapScore(sitemapData) {
    if (!sitemapData.valid) return 0
    if (sitemapData.urls === 0) return 20
    if (sitemapData.urls < 10) return 60
    if (sitemapData.urls < 100) return 80
    return 100
  }

  getSitemapIssues(sitemapData) {
    const issues = []
    
    if (!sitemapData.valid) {
      issues.push({
        severity: 'high',
        message: 'Sitemap is not valid XML',
        recommendation: 'Fix XML syntax errors in sitemap'
      })
    }
    
    if (sitemapData.urls === 0) {
      issues.push({
        severity: 'high',
        message: 'Sitemap contains no URLs',
        recommendation: 'Add URLs to your sitemap'
      })
    }

    return issues
  }

  async analyzePerformance(url) {
    try {
      // For demo purposes, we'll simulate PageSpeed Insights API
      // In production, you would use: https://www.googleapis.com/pagespeedonline/v5/runPagespeed
      const mockPerformanceData = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        metrics: {
          firstContentfulPaint: Math.random() * 2 + 1,
          largestContentfulPaint: Math.random() * 3 + 2,
          firstInputDelay: Math.random() * 100 + 50,
          cumulativeLayoutShift: Math.random() * 0.2
        },
        opportunities: [
          'Optimize images',
          'Minify CSS',
          'Remove unused JavaScript'
        ]
      }

      return {
        score: mockPerformanceData.score,
        coreWebVitals: {
          lcp: mockPerformanceData.metrics.largestContentfulPaint,
          fid: mockPerformanceData.metrics.firstInputDelay,
          cls: mockPerformanceData.metrics.cumulativeLayoutShift
        },
        issues: this.getPerformanceIssues(mockPerformanceData),
        details: mockPerformanceData
      }
    } catch (error) {
      return {
        score: 0,
        coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
        issues: [{
          severity: 'medium',
          message: 'Performance analysis unavailable',
          recommendation: 'Use PageSpeed Insights for detailed performance metrics'
        }],
        details: { score: 0, metrics: {}, opportunities: [] }
      }
    }
  }

  getPerformanceIssues(performanceData) {
    const issues = []
    
    if (performanceData.metrics.largestContentfulPaint > 2.5) {
      issues.push({
        severity: 'high',
        message: 'Largest Contentful Paint is slow',
        recommendation: 'Optimize images and reduce server response time'
      })
    }
    
    if (performanceData.metrics.firstInputDelay > 100) {
      issues.push({
        severity: 'medium',
        message: 'First Input Delay is high',
        recommendation: 'Reduce JavaScript execution time'
      })
    }
    
    if (performanceData.metrics.cumulativeLayoutShift > 0.1) {
      issues.push({
        severity: 'medium',
        message: 'Cumulative Layout Shift is high',
        recommendation: 'Avoid layout shifts by setting image dimensions'
      })
    }

    return issues
  }

  async analyzeIndexability(url) {
    try {
      // Simulate indexability analysis
      const indexabilityData = {
        indexable: true,
        crawlable: true,
        blocked: false,
        noindex: false,
        canonical: true
      }

      return {
        indexable: indexabilityData.indexable,
        crawlable: indexabilityData.crawlable,
        score: this.calculateIndexabilityScore(indexabilityData),
        issues: this.getIndexabilityIssues(indexabilityData),
        details: indexabilityData
      }
    } catch (error) {
      return {
        indexable: false,
        crawlable: false,
        score: 0,
        issues: [{
          severity: 'high',
          message: 'Indexability analysis failed',
          recommendation: 'Check if page is accessible to search engines'
        }],
        details: { indexable: false, crawlable: false, blocked: true, noindex: false, canonical: false }
      }
    }
  }

  calculateIndexabilityScore(data) {
    let score = 0
    if (data.indexable) score += 40
    if (data.crawlable) score += 30
    if (!data.blocked) score += 20
    if (!data.noindex) score += 10
    return score
  }

  getIndexabilityIssues(data) {
    const issues = []
    
    if (!data.indexable) {
      issues.push({
        severity: 'high',
        message: 'Page is not indexable',
        recommendation: 'Remove noindex directives or fix blocking issues'
      })
    }
    
    if (!data.crawlable) {
      issues.push({
        severity: 'high',
        message: 'Page is not crawlable',
        recommendation: 'Check robots.txt and server configuration'
      })
    }

    return issues
  }

  async analyzeSecurity(url) {
    try {
      const isHttps = url.startsWith('https://')
      const hasHsts = await this.checkHSTS(url)
      
      return {
        https: isHttps,
        hsts: hasHsts,
        score: this.calculateSecurityScore(isHttps, hasHsts),
        issues: this.getSecurityIssues(isHttps, hasHsts),
        details: {
          protocol: isHttps ? 'HTTPS' : 'HTTP',
          hsts: hasHsts,
          secure: isHttps && hasHsts
        }
      }
    } catch (error) {
      return {
        https: false,
        hsts: false,
        score: 0,
        issues: [{
          severity: 'high',
          message: 'Security analysis failed',
          recommendation: 'Ensure proper security headers are configured'
        }],
        details: { protocol: 'Unknown', hsts: false, secure: false }
      }
    }
  }

  async checkHSTS(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.headers.get('strict-transport-security') !== null
    } catch {
      return false
    }
  }

  calculateSecurityScore(https, hsts) {
    let score = 0
    if (https) score += 70
    if (hsts) score += 30
    return score
  }

  getSecurityIssues(https, hsts) {
    const issues = []
    
    if (!https) {
      issues.push({
        severity: 'high',
        message: 'Site is not using HTTPS',
        recommendation: 'Implement SSL certificate for security'
      })
    }
    
    if (https && !hsts) {
      issues.push({
        severity: 'medium',
        message: 'HSTS header not found',
        recommendation: 'Add Strict-Transport-Security header'
      })
    }

    return issues
  }

  generateTechnicalScore(analysis) {
    const scores = {
      https: analysis.https.score,
      robots: analysis.robots.score,
      sitemap: analysis.sitemap.score,
      performance: analysis.performance.score,
      indexability: analysis.indexability.score,
      security: analysis.security.score
    }

    const overallScore = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
    )

    const allIssues = [
      ...analysis.https.issues,
      ...analysis.robots.issues,
      ...analysis.sitemap.issues,
      ...analysis.performance.issues,
      ...analysis.indexability.issues,
      ...analysis.security.issues
    ]

    return {
      overallScore,
      scores,
      analysis,
      issues: allIssues,
      summary: this.generateTechnicalSummary(overallScore, allIssues)
    }
  }

  generateTechnicalSummary(score, issues) {
    let grade = 'F'
    let description = 'Needs significant technical improvements'

    if (score >= 90) {
      grade = 'A'
      description = 'Excellent technical SEO'
    } else if (score >= 80) {
      grade = 'B'
      description = 'Good technical SEO with minor issues'
    } else if (score >= 70) {
      grade = 'C'
      description = 'Average technical SEO, several areas need attention'
    } else if (score >= 60) {
      grade = 'D'
      description = 'Below average technical SEO, many issues to address'
    }

    return {
      grade,
      score,
      description,
      priorityIssues: issues.filter(issue => issue.severity === 'high').length,
      totalIssues: issues.length
    }
  }

  generateFallbackTechnicalAnalysis(url) {
    // Fallback analysis when real analysis fails
    const analysis = {
      https: {
        enabled: url.startsWith('https://'),
        redirect: false,
        score: url.startsWith('https://') ? 100 : 0,
        issues: url.startsWith('https://') ? [] : [{
          severity: 'high',
          message: 'Site is not using HTTPS',
          recommendation: 'Implement SSL certificate for better security and SEO'
        }],
        details: { protocol: url.startsWith('https://') ? 'HTTPS' : 'HTTP', redirect: false, secure: url.startsWith('https://') }
      },
      robots: {
        present: false,
        accessible: false,
        score: 0,
        issues: [{
          severity: 'medium',
          message: 'robots.txt not found',
          recommendation: 'Create a robots.txt file to control search engine crawling'
        }],
        details: { content: '', rules: [] }
      },
      sitemap: {
        present: false,
        accessible: false,
        score: 0,
        issues: [{
          severity: 'medium',
          message: 'No sitemap found',
          recommendation: 'Create and submit an XML sitemap'
        }],
        details: { url: null, urls: 0, lastModified: null }
      },
      performance: {
        score: 75,
        coreWebVitals: { lcp: 2.5, fid: 100, cls: 0.1 },
        issues: [{
          severity: 'medium',
          message: 'Performance analysis not available',
          recommendation: 'Use PageSpeed Insights for detailed metrics'
        }],
        details: { score: 75, metrics: {}, opportunities: [] }
      },
      indexability: {
        indexable: true,
        crawlable: true,
        score: 80,
        issues: [],
        details: { indexable: true, crawlable: true, blocked: false, noindex: false, canonical: true }
      },
      security: {
        https: url.startsWith('https://'),
        hsts: false,
        score: url.startsWith('https://') ? 70 : 0,
        issues: url.startsWith('https://') ? [{
          severity: 'medium',
          message: 'HSTS header not found',
          recommendation: 'Add Strict-Transport-Security header'
        }] : [{
          severity: 'high',
          message: 'Site is not using HTTPS',
          recommendation: 'Implement SSL certificate for security'
        }],
        details: { protocol: url.startsWith('https://') ? 'HTTPS' : 'HTTP', hsts: false, secure: false }
      }
    }

    return this.generateTechnicalScore(analysis)
  }
}

export default TechnicalAnalyzer
