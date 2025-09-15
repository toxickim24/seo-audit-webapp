import React from 'react'

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner-container">
        <div className="spinner"></div>
        <h3>Analyzing Your Website...</h3>
        <p>This may take a few moments while we analyze your SEO</p>
        
        <div className="loading-steps">
          <div className="step active">
            <div className="step-icon">🔍</div>
            <span>Scanning website structure</span>
          </div>
          <div className="step">
            <div className="step-icon">📊</div>
            <span>Analyzing on-page SEO</span>
          </div>
          <div className="step">
            <div className="step-icon">⚙️</div>
            <span>Checking technical issues</span>
          </div>
          <div className="step">
            <div className="step-icon">🚀</div>
            <span>Measuring performance</span>
          </div>
          <div className="step">
            <div className="step-icon">📝</div>
            <span>Evaluating content quality</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
