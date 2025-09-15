import React, { useState } from 'react'

function KeywordTool() {
  const [keyword, setKeyword] = useState('')
  const [keywords, setKeywords] = useState([])
  const [suggestions, setSuggestions] = useState([])

  const addKeyword = () => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      setKeywords([...keywords, keyword.trim()])
      setKeyword('')
    }
  }

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const generateSuggestions = () => {
    // Mock keyword suggestions (in real app, this would call an API)
    const mockSuggestions = [
      { keyword: `${keyword} guide`, volume: 1200, difficulty: 'Medium' },
      { keyword: `best ${keyword}`, volume: 800, difficulty: 'Hard' },
      { keyword: `${keyword} tips`, volume: 600, difficulty: 'Easy' },
      { keyword: `${keyword} tutorial`, volume: 900, difficulty: 'Medium' },
      { keyword: `${keyword} 2024`, volume: 1500, difficulty: 'Easy' }
    ]
    setSuggestions(mockSuggestions)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#27ae60'
      case 'Medium': return '#f39c12'
      case 'Hard': return '#e74c3c'
      default: return '#95a5a6'
    }
  }

  return (
    <div className="keyword-tool">
      <h2>🎯 Keyword Research Tool</h2>
      <p>Discover high-value keywords for your WordPress content</p>

      <div className="keyword-input-section">
        <div className="input-group">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter a keyword to research"
            className="keyword-input"
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <button onClick={addKeyword} className="add-btn">
            Add Keyword
          </button>
        </div>
        <button 
          onClick={generateSuggestions}
          className="suggest-btn"
          disabled={!keyword}
        >
          Get Suggestions
        </button>
      </div>

      {keywords.length > 0 && (
        <div className="keywords-list">
          <h3>Your Keywords ({keywords.length})</h3>
          <div className="keyword-tags">
            {keywords.map((kw, index) => (
              <span key={index} className="keyword-tag">
                {kw}
                <button 
                  onClick={() => removeKeyword(index)}
                  className="remove-keyword"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h3>Keyword Suggestions</h3>
          <div className="suggestions-table">
            <div className="table-header">
              <span>Keyword</span>
              <span>Search Volume</span>
              <span>Difficulty</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="table-row">
                <span className="keyword-name">{suggestion.keyword}</span>
                <span className="volume">{suggestion.volume.toLocaleString()}</span>
                <span 
                  className="difficulty"
                  style={{ color: getDifficultyColor(suggestion.difficulty) }}
                >
                  {suggestion.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="keyword-tips">
        <h3>💡 Keyword Research Tips</h3>
        <ul>
          <li>Use long-tail keywords for better targeting</li>
          <li>Check competitor keywords for inspiration</li>
          <li>Focus on keywords with medium difficulty</li>
          <li>Consider search intent when choosing keywords</li>
          <li>Use keyword variations and synonyms</li>
        </ul>
      </div>
    </div>
  )
}

export default KeywordTool
