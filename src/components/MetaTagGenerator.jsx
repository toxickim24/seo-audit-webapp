import React, { useState } from 'react'

function MetaTagGenerator() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    author: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image'
  })

  const [generatedCode, setGeneratedCode] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateMetaTags = () => {
    const { title, description, keywords, author, ogTitle, ogDescription, ogImage, twitterCard } = formData
    
    const metaTags = `<!-- Basic Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${ogTitle || title}">
<meta property="og:description" content="${ogDescription || description}">
<meta property="og:image" content="${ogImage}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourwebsite.com">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="${twitterCard}">
<meta name="twitter:title" content="${ogTitle || title}">
<meta name="twitter:description" content="${ogDescription || description}">
<meta name="twitter:image" content="${ogImage}">

<!-- Additional SEO Meta Tags -->
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow">
<link rel="canonical" href="https://yourwebsite.com/this-page">`

    setGeneratedCode(metaTags)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    alert('Meta tags copied to clipboard!')
  }

  const getTitleLength = () => formData.title.length
  const getDescriptionLength = () => formData.description.length

  const isTitleOptimal = () => {
    const length = getTitleLength()
    return length >= 30 && length <= 60
  }

  const isDescriptionOptimal = () => {
    const length = getDescriptionLength()
    return length >= 120 && length <= 160
  }

  return (
    <div className="meta-generator">
      <h2>🏷️ Meta Tag Generator</h2>
      <p>Generate optimized meta tags for your WordPress pages and posts</p>

      <div className="generator-form">
        <div className="form-section">
          <h3>Basic Meta Tags</h3>
          
          <div className="form-group">
            <label htmlFor="title">Page Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your page title"
              className={isTitleOptimal() ? 'optimal' : 'suboptimal'}
            />
            <div className="character-count">
              {getTitleLength()}/60 characters
              {isTitleOptimal() ? ' ✅' : ' ⚠️'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Meta Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter your meta description"
              rows="3"
              className={isDescriptionOptimal() ? 'optimal' : 'suboptimal'}
            />
            <div className="character-count">
              {getDescriptionLength()}/160 characters
              {isDescriptionOptimal() ? ' ✅' : ' ⚠️'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="keywords">Keywords</label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Your name or company"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Social Media Meta Tags</h3>
          
          <div className="form-group">
            <label htmlFor="ogTitle">Open Graph Title</label>
            <input
              type="text"
              id="ogTitle"
              name="ogTitle"
              value={formData.ogTitle}
              onChange={handleInputChange}
              placeholder="Title for social media sharing"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ogDescription">Open Graph Description</label>
            <textarea
              id="ogDescription"
              name="ogDescription"
              value={formData.ogDescription}
              onChange={handleInputChange}
              placeholder="Description for social media sharing"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ogImage">Social Media Image URL</label>
            <input
              type="url"
              id="ogImage"
              name="ogImage"
              value={formData.ogImage}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="twitterCard">Twitter Card Type</label>
            <select
              id="twitterCard"
              name="twitterCard"
              value={formData.twitterCard}
              onChange={handleInputChange}
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="app">App</option>
              <option value="player">Player</option>
            </select>
          </div>
        </div>

        <button onClick={generateMetaTags} className="generate-btn">
          Generate Meta Tags
        </button>
      </div>

      {generatedCode && (
        <div className="generated-code">
          <div className="code-header">
            <h3>Generated Meta Tags</h3>
            <button onClick={copyToClipboard} className="copy-btn">
              📋 Copy to Clipboard
            </button>
          </div>
          <pre className="code-block">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}

      <div className="meta-tips">
        <h3>💡 Meta Tag Best Practices</h3>
        <ul>
          <li>Keep titles between 30-60 characters</li>
          <li>Write descriptions between 120-160 characters</li>
          <li>Use unique titles and descriptions for each page</li>
          <li>Include your target keywords naturally</li>
          <li>Make descriptions compelling to increase click-through rates</li>
          <li>Use high-quality images for social media sharing</li>
        </ul>
      </div>
    </div>
  )
}

export default MetaTagGenerator
