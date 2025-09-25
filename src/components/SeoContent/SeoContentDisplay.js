function SeoContentDisplay({ contentSeo, passFailStyle }) {
  return (
    <div className="seo-content-container">
      <div className="seo-content-wrapper">

        {/* Title */}
        <div
          className="seo-content-box"
          style={passFailStyle(
            contentSeo.titleLength >= 50 && contentSeo.titleLength <= 60
          )}
        >
          <b>Title</b>
          <p>{contentSeo.title}</p>
        </div>

        {/* Meta Description */}
        <div
          className="seo-content-box"
          style={passFailStyle(
            contentSeo.metaDescLength >= 120 &&
              contentSeo.metaDescLength <= 160
          )}
        >
          <b>Meta Description</b>
          <p>{contentSeo.metaDescription}</p>
        </div>

        <div className="seo-content-meta">
          {/* Keyword Density */}
          <div
            className="seo-content-box"
            style={passFailStyle(
              parseFloat(contentSeo.keywordDensity) > 0 &&
                parseFloat(contentSeo.keywordDensity) < 5
            )}
          >
            <b>Keyword Density</b>
            <p>{contentSeo.keywordDensity}</p>
          </div>

          {/* Keyword in Title */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.hasKeywordInTitle)}
          >
            <b>Keyword in Title</b>
            <p>{contentSeo.hasKeywordInTitle ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="seo-content-meta">
          {/* Keyword in Headings */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.keywordInHeadings)}
          >
            <b>Keyword in Headings</b>
            <p>{contentSeo.keywordInHeadings ? "Yes" : "No"}</p>
          </div>

          {/* Keyword in First Paragraph */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.keywordInFirstParagraph)}
          >
            <b>Keyword in First Paragraph</b>
            <p>{contentSeo.keywordInFirstParagraph ? "Yes" : "No"}</p>
          </div>

          {/* Keyword in Meta */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.hasKeywordInMeta)}
          >
            <b>Keyword in Meta</b>
            <p>{contentSeo.hasKeywordInMeta ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="seo-content-meta">
          {/* Word Count */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.wordCount >= 300)}
          >
            <b>Word Count</b>
            <p>{contentSeo.wordCount}</p>
          </div>

          {/* Body Length */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.bodyLength > 500)}
          >
            <b>Body Length</b>
            <p>{contentSeo.bodyLength}</p>
          </div>

          {/* Readability */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.avgSentenceLength <= 20)}
          >
            <b>Average Sentence Length</b>
            <p>{contentSeo.avgSentenceLength} words</p>
          </div>
        </div>

        <div className="seo-content-meta">
          {/* Images */}
          <div
            className="seo-content-box"
            style={passFailStyle(
              contentSeo.totalImages > 0 &&
                contentSeo.imagesWithAlt === contentSeo.totalImages
            )}
          >
            <b>Images with ALT</b>
            <p>
              {contentSeo.imagesWithAlt} / {contentSeo.totalImages}
            </p>
          </div>

          {/* Media Count */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.mediaCount > 0)}
          >
            <b>Media Count</b>
            <p>{contentSeo.mediaCount}</p>
          </div>

          {/* Internal Links */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.internalLinks > 0)}
          >
            <b>Internal Links</b>
            <p>{contentSeo.internalLinks}</p>
          </div>

          {/* External Links */}
          <div
            className="seo-content-box"
            style={passFailStyle(contentSeo.externalLinks > 0)}
          >
            <b>External Links</b>
            <p>{contentSeo.externalLinks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeoContentDisplay;