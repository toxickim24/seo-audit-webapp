const SeoOnPage = ({ onpage, passFailStyle }) => {
  return (
    <div className="overview-container">
      <div className="overview-wrapper">

        {/* Title */}
        <div className="onpage-box" style={passFailStyle(onpage.titlePass)}>
          <b>Title</b>
          <p>{onpage.title}</p>
        </div>

        {/* Meta Description */}
        <div className="onpage-box" style={passFailStyle(onpage.metaPass)}>
          <b>Meta Description</b> 
          <span>{onpage.metaDescription}</span>
        </div>

        {/* Header Counter */}
        <div className="onpage-counter-box">
          {["h1","h2","h3","h4","h5","h6"].map((tag) => (
            <div key={tag} className="onpage-counter-header" style={passFailStyle(onpage[`${tag}Pass`])}>
              <h3>{tag.toUpperCase()}</h3>
              <p>{onpage.headingCount[tag]}</p>
            </div>
          ))}
        </div>

        {/* Listing each heading text */}
        {["h1","h2","h3","h4","h5","h6"].map(
          (tag) =>
            onpage[tag].length > 0 && (
              <div className="header-list-container" key={tag}>
                <b>{tag.toUpperCase()}:</b>
                <ul className="header-list-text">
                  {onpage[tag].map((text, i) => (
                    <li key={i}>{text || "<empty>"}  |  </li>
                  ))}
                </ul>
              </div>
            )
        )}

        {/* Images */}
        <div className="image-summary-container">
          <div className="image-summary-box image-summary-total">
            <b>Total Images</b>
            <span>{onpage.imageCount}</span>
          </div>
          <div className="image-summary-box" style={passFailStyle(onpage.imagesWithAlt > 0)}>
            <b>With Alt</b> 
            <span>{onpage.imagesWithAlt}</span>
          </div>
          <div className="image-summary-box" style={passFailStyle(onpage.imagesWithoutAlt === 0)}>
            <b>No Alt</b> 
            <span>{onpage.imagesWithoutAlt}</span>
          </div>
        </div>

        {/* Links */}
        <div className="link-summary-container">
          <div className="link-summary-box" style={passFailStyle(onpage.internalLinksPass)}>
            <b>Internal Links</b>
            <span>{onpage.internalLinks}</span>
          </div>
          <div className="link-summary-box" style={passFailStyle(onpage.externalLinksPass)}>
            <b>External Links</b>
            <span>{onpage.externalLinks}</span>
          </div>
          <div className="link-summary-box" style={passFailStyle(onpage.brokenLinksPass)}>
            <b>Broken Links</b>
            <span>{onpage.brokenLinks}</span>
          </div>
        </div>

        {/* OG & Structured Data */}
        <div className="og-box" style={passFailStyle(!!onpage.ogTitle)}>
          <b>Open Graph Title</b>
          <span>{onpage.ogTitle}</span>
        </div>

        <div className="og-box" style={passFailStyle(!!onpage.ogDescription)}>
          <b>Open Graph Description</b>
          <span>{onpage.ogDescription}</span>
        </div>

        <div className="og-box" style={passFailStyle(!!onpage.twitterCard)}>
          <b>Twitter Card</b>
          <span>{onpage.twitterCard}</span>
        </div>

        <div className="og-box" style={passFailStyle(onpage.structuredPass)}>
          <b>Structured Data JSON-LD</b>
          <span>{onpage.structuredData ? "Yes" : "No"}</span>
        </div>
      </div>
    </div>
  );
};

export default SeoOnPage;
