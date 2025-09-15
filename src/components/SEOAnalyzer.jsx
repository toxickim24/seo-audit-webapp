import React, { useState } from 'react'

function SEOAnalyzer() {
  const [url, setUrl] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeSEO = async () => {
    if (!url) return
    
    setLoading(true)
    
    // Simulate SEO analysis (in real app, this would call an API)
    setTimeout(() => {
      const mockAnalysis = {
        title: 'Page Title Analysis',
        metaDescription: 'Meta description analysis',
        headings: {
          h1: 1,
          h2: 3,
          h3: 5
        },
        images: {
          total: 8,
          withoutAlt: 2
        },
        links: {
          internal: 12,
          external: 5
        },
        score: 85,
        recommendations: [
          'Add alt text to 2 images',
          'Optimize meta description length',
          'Add more internal links'
        ]
      }
      setAnalysis(mockAnalysis)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="seo-analyzer">
      <h2>🔍 SEO Site Analyzer</h2>
      <p>Analyze any website for SEO issues and get actionable recommendations</p>
      
      <div className="analyzer-form">
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="url-input"
          />
          <button 
            onClick={analyzeSEO}
            disabled={loading || !url}
            className="analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze SEO'}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="analysis-results">
          <div className="score-card">
            <h3>SEO Score: {analysis.score}/100</h3>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${analysis.score}%` }}
              ></div>
            </div>
          </div>

          <div className="analysis-grid">
            <div className="analysis-item">
              <h4>📝 Content Structure</h4>
              <ul>
                <li>H1 Tags: {analysis.headings.h1}</li>
                <li>H2 Tags: {analysis.headings.h2}</li>
                <li>H3 Tags: {analysis.headings.h3}</li>
              </ul>
            </div>

            <div className="analysis-item">
              <h4>🖼️ Images</h4>
              <ul>
                <li>Total Images: {analysis.images.total}</li>
                <li>Missing Alt Text: {analysis.images.withoutAlt}</li>
              </ul>
            </div>

            <div className="analysis-item">
              <h4>🔗 Links</h4>
              <ul>
                <li>Internal Links: {analysis.links.internal}</li>
                <li>External Links: {analysis.links.external}</li>
              </ul>
            </div>
          </div>

          <div className="recommendations">
            <h4>💡 Recommendations</h4>
            <ul>
              {analysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default SEOAnalyzer
