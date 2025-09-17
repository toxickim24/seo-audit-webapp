import "../css/seoTechnical.css";

function SeoTechnical({ pageSpeedData, score }) {
  if (!pageSpeedData) {
    return <p>Loading PageSpeed results...</p>;
  }

  return (
    <div className="seo-technical">
      <h1>SEO Technical</h1>

      {/* Radial Gauge */}
      <div className="radial-score">
        <div
          className={`circle ${
            score >= 90 ? "good" : score >= 50 ? "average" : "poor"
          }`}
          style={{ "--percent": score }}
        >
          <div className="inner">
            <span>{score}</span>
            <small>/100</small>
          </div>
        </div>
        <p className="label">Performance Score</p>
      </div>

      {/* Core Web Vitals */}
      <h3>Core Web Vitals</h3>
      {["lcp", "fid", "cls"].map((key) => (
        <div key={key} className="metric">
          <label>
            {key === "lcp" && "LCP (Largest Contentful Paint)"}
            {key === "fid" && "FID (First Input Delay)"}
            {key === "cls" && "CLS (Cumulative Layout Shift)"}
          </label>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                pageSpeedData[key] <= 2500 || key === "cls"
                  ? "good"
                  : pageSpeedData[key] <= 4000
                  ? "average"
                  : "poor"
              }`}
              style={{
                width: `${Math.min(
                  (pageSpeedData[key] / (key === "cls" ? 1 : 10000)) * 100,
                  100
                )}%`,
              }}
            >
              {pageSpeedData[key]} {key === "cls" ? "" : "ms"}
            </div>
          </div>
        </div>
      ))}

      {/* Other Metrics */}
      <h3>Other Metrics</h3>
      {[
        { key: "fcp", label: "FCP (First Contentful Paint)" },
        { key: "tti", label: "TTI (Time To Interactive)" },
        { key: "speedIndex", label: "Speed Index" },
        { key: "tbt", label: "Total Blocking Time" },
      ].map((m) => (
        <div key={m.key} className="metric">
          <label>{m.label}</label>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                pageSpeedData[m.key] <= 2000
                  ? "good"
                  : pageSpeedData[m.key] <= 4000
                  ? "average"
                  : "poor"
              }`}
              style={{
                width: `${Math.min(
                  (pageSpeedData[m.key] / 10000) * 100,
                  100
                )}%`,
              }}
            >
              {pageSpeedData[m.key]} ms
            </div>
          </div>
        </div>
      ))}

      {/* Opportunities */}
      <h3>Opportunities</h3>
      <ul className="opportunities">
        {pageSpeedData.opportunities.map((op, i) => (
          <li key={i}>
            <span className="op-title">{op.title}</span>
            <span className="op-value">{op.savingsMs} ms savings</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeoTechnical;
