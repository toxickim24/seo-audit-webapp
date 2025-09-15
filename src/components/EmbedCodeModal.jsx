import React, { useState } from 'react'

function EmbedCodeModal({ isOpen, onClose }) {
  const [selectedPlatform, setSelectedPlatform] = useState('wordpress')
  const [copied, setCopied] = useState(false)

  const embedCode = `<script>
  (function() {
    var seoMojo = document.createElement('script');
    seoMojo.src = '${window.location.origin}/embeddable-widget/widget.js';
    seoMojo.async = true;
    document.head.appendChild(seoMojo);
    
    seoMojo.onload = function() {
      if (window.SEOMojoWidget) {
        window.SEOMojoWidget.init({
          containerId: 'seo-mojo-widget',
          theme: 'light',
          position: 'bottom-right'
        });
      }
    };
  })();
</script>

<!-- Add this div where you want the widget to appear -->
<div id="seo-mojo-widget"></div>`

  const wordpressInstructions = `1. Go to your WordPress admin dashboard
2. Navigate to Appearance > Theme Editor
3. Select your active theme
4. Open the footer.php file
5. Add the embed code before the closing </body> tag
6. Save the file

Alternative: Use a plugin like "Insert Headers and Footers" to add the code.`

  const htmlInstructions = `1. Open your HTML file in a text editor
2. Find the <head> section
3. Add the first part of the embed code (the <script> tag) in the <head>
4. Add the <div id="seo-mojo-widget"></div> where you want the widget to appear
5. Save and upload your file`

  const reactInstructions = `1. Install the SEO Mojo widget package:
   npm install @seomojo/widget

2. Import and use the widget in your component:
   import { SEOMojoWidget } from '@seomojo/widget'
   
   function MyComponent() {
     return (
       <div>
         <SEOMojoWidget 
           theme="light"
           position="bottom-right"
         />
       </div>
     )
   }`

  const getInstructions = () => {
    switch (selectedPlatform) {
      case 'wordpress':
        return wordpressInstructions
      case 'html':
        return htmlInstructions
      case 'react':
        return reactInstructions
      default:
        return wordpressInstructions
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = embedCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content embed-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔗 Embed SEO Mojo Widget</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="platform-selector">
            <h3>Select Platform:</h3>
            <div className="platform-buttons">
              <button 
                className={selectedPlatform === 'wordpress' ? 'active' : ''}
                onClick={() => setSelectedPlatform('wordpress')}
              >
                📝 WordPress
              </button>
              <button 
                className={selectedPlatform === 'html' ? 'active' : ''}
                onClick={() => setSelectedPlatform('html')}
              >
                🌐 HTML
              </button>
              <button 
                className={selectedPlatform === 'react' ? 'active' : ''}
                onClick={() => setSelectedPlatform('react')}
              >
                ⚛️ React
              </button>
            </div>
          </div>

          <div className="embed-code-section">
            <div className="code-header">
              <h3>Embed Code:</h3>
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyToClipboard}
              >
                {copied ? '✅ Copied!' : '📋 Copy Code'}
              </button>
            </div>
            <pre className="code-block">
              <code>{embedCode}</code>
            </pre>
          </div>

          <div className="instructions-section">
            <h3>Installation Instructions:</h3>
            <div className="instructions-content">
              {getInstructions().split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <div className="features-section">
            <h3>Widget Features:</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Fast Loading</strong>
                  <p>Lightweight and optimized for speed</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <div>
                  <strong>Customizable</strong>
                  <p>Match your website's design</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <div>
                  <strong>Mobile Friendly</strong>
                  <p>Responsive design for all devices</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <div>
                  <strong>Secure</strong>
                  <p>HTTPS enabled and privacy focused</p>
                </div>
              </div>
            </div>
          </div>

          <div className="preview-section">
            <h3>Live Preview:</h3>
            <div className="widget-preview">
              <div className="preview-widget">
                <div className="preview-header">
                  <span className="preview-icon">🔍</span>
                  <span className="preview-title">SEO Audit</span>
                </div>
                <div className="preview-content">
                  <p>Get your free SEO analysis</p>
                  <button className="preview-btn">Start Audit</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={copyToClipboard}>
            {copied ? '✅ Code Copied!' : '📋 Copy Embed Code'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmbedCodeModal
