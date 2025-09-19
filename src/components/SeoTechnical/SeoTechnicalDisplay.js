function SeoTechnicalDisplay({ technicalSeo, passFailStyle }) {
  if (!technicalSeo) return null;

  return (
    <div className="seo-technical-container">
      <div className="seo-technical-wrapper">
        <h2 className="result-title">Technical SEO</h2>

        {/* Canonical */}
        <div className="seo-technical-box" style={passFailStyle(!!technicalSeo.canonical)}>
          <b>Canonical</b>
          <p>{technicalSeo.canonical || "Missing"}</p>
        </div>

        {/* Robots Meta */}
        <div
          className="seo-technical-box"
          style={passFailStyle(!!technicalSeo.hasRobotsMeta)}
        >
          <b>Robots Meta</b>
          <p>{technicalSeo.hasRobotsMeta ? "Pass" : "Failed"}</p>
        </div>

        <div className="seo-technical-meta">
          <div
            className="seo-technical-box"
            style={passFailStyle(technicalSeo.robotsIndex === "Pass")}
          >
            <b>Indexable</b>
            <p>{technicalSeo.robotsIndex}</p>
          </div>

          <div
            className="seo-technical-box"
            style={passFailStyle(technicalSeo.robotsFollow === "Pass")}
          >
            <b>Follow Links</b>
            <p>{technicalSeo.robotsFollow}</p>
          </div>

          {/* Viewport */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!!technicalSeo.hasViewport)}
          >
            <b>Viewport Meta</b>
            <p>{technicalSeo.hasViewport ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="seo-technical-meta">
          {/* HTTPS */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!!technicalSeo.https)}
          >
            <b>HTTPS</b>
            <p>{technicalSeo.https ? "Yes" : "No"}</p>
          </div>

          {/* Favicon */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!!technicalSeo.hasFavIcon)}
          >
            <b>Favicon</b>
            <p>{technicalSeo.hasFavIcon ? "Yes" : "No"}</p>
          </div>

          {/* Language Tag */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!!technicalSeo.hreflang)}
          >
            <b>Language Tag</b>
            <p>{technicalSeo.hreflang ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="seo-technical-meta">
          {/* Mixed Content */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!technicalSeo.mixedContent)}
          >
            <b>Mixed Content</b>
            <p>{technicalSeo.mixedContent ? "Yes" : "No"}</p>
          </div>

          {/* Canonical Conflict */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!technicalSeo.canonicalConflict)}
          >
            <b>Canonical Conflict</b>
            <p>{technicalSeo.canonicalConflict ? "Yes" : "No"}</p>
          </div>

          {/* Trailing Slash */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!!technicalSeo.trailingSlash)}
          >
            <b>Trailing Slash</b>
            <p>{technicalSeo.trailingSlash ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="seo-technical-meta">
          {/* Page Size */}
          <div
            className="seo-technical-box"
            style={passFailStyle(technicalSeo.pageSizeKB < 2048)}
          >
            <b>Page Size (KB)</b>
            <p>{technicalSeo.pageSizeKB || "Unknown"}</p>
          </div>

          {/* Requests */}
          <div
            className="seo-technical-box"
            style={passFailStyle(technicalSeo.numRequests < 100)}
          >
            <b>Number of Requests</b>
            <p>{technicalSeo.numRequests || "Unknown"}</p>
          </div>

          {/* AMP */}
          <div
            className="seo-technical-box"
            style={passFailStyle(!!technicalSeo.hasAMP)}
          >
            <b>Accelerated Mobile Pages</b>
            <p>{technicalSeo.hasAMP ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="seo-technical-box">
          <b>Sitemap Valid URLs:</b>
          <ul>
            {technicalSeo.sitemapValidUrls.map((u, i) => (
              <li key={i}>
                {u.url} - {u.status}
              </li>
            ))}
          </ul>
        </div>

        <div className="seo-technical-meta">
          {/* Robots.txt */}
          <div className="seo-technical-box">
            <b>Robots.txt</b>
            <a href={technicalSeo.robotsTxtUrl} target="_blank" rel="noreferrer">
              {technicalSeo.robotsTxtUrl}
            </a>
          </div>

          {/* Sitemap */}
          {technicalSeo.sitemapUrl && (
            <div className="seo-technical-box">
              <b>Sitemap</b>{" "}
              <a href={technicalSeo.sitemapUrl} target="_blank" rel="noreferrer">
                {technicalSeo.sitemapUrl}
              </a>
            </div>
          )}

          {/* WWW Version */}
          <div className="seo-technical-box">
            <b>WWW Version</b>
            <p>{technicalSeo.isWWW ? "WWW" : "Non-WWW"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeoTechnicalDisplay;
