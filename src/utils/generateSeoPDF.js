import jsPDF from "jspdf";
import { 
  getPerformanceRecommendations,
  getFullOnpageRecommendations,
  getTechnicalSeoRecommendations,
  getSeoContentRecommendations
} from "./seoFullRecommendation.js";

// Generate SEO PDF
export const generateSeoPDF = (seoData, url, overallScore, pageSpeed, performanceData, download = true) => {
  if (!seoData) return;

  const doc = new jsPDF();
  let yPos = 20;
  const margin = 14;
  const lineHeight = 8;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  const addText = (text, indent = 0) => {
    const maxWidth = pageWidth - margin * 2 - indent;
    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin + indent, yPos);
      yPos += lineHeight;
    });
  };

  const normalizeText = (text) => {
    return text
      .replace(/—/g, "-")       
      .replace(/⚡|👍|✅/g, "");
  };

  const addTextWithPassFail = (text, pass) => {
    const lines = doc.splitTextToSize(text + " ", pageWidth - margin * 2);

    lines.forEach((line, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(0, 0, 0);
      doc.text(line, margin, yPos);

      if (index === lines.length - 1) {
        const passFailText = `(${pass ? "Pass" : "Fail"})`;
        const separator = " || ";
        const inlineText = line + separator + passFailText;
        const inlineWidth = doc.getTextWidth(inlineText);

        if (inlineWidth <= pageWidth - margin * 2) {
          const lineWidth = doc.getTextWidth(line);

          doc.setTextColor(0, 0, 0);
          doc.text(separator, margin + lineWidth, yPos);

          if (pass) doc.setTextColor(0, 128, 0);
          else doc.setTextColor(255, 0, 0);
          doc.text(passFailText, margin + lineWidth + doc.getTextWidth(separator), yPos);
        } else {
          yPos += lineHeight;
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }

          doc.setTextColor(0, 0, 0);
          doc.text(separator, margin, yPos);

          if (pass) doc.setTextColor(0, 128, 0);
          else doc.setTextColor(255, 0, 0);
          doc.text(passFailText, margin + doc.getTextWidth(separator), yPos);
        }

        doc.setTextColor(0, 0, 0);
      }

      yPos += lineHeight;
    });
  };

  // Circular progress
  function drawCircularProgress(x, y, radius, percent, color = "#fb6a45") {
    const angle = (percent / 100) * 2 * Math.PI;

    doc.setDrawColor(200);
    doc.setLineWidth(2);
    doc.circle(x, y, radius, "S");

    doc.setDrawColor(color);
    doc.setLineWidth(2);

    let steps = 50;
    let prevX = x;
    let prevY = y - radius;
    for (let i = 0; i <= steps * percent / 100; i++) {
      let theta = (i / steps) * 2 * Math.PI;
      let newX = x + radius * Math.sin(theta);
      let newY = y - radius * Math.cos(theta);
      doc.line(prevX, prevY, newX, newY);
      prevX = newX;
      prevY = newY;
    }

    const currentFont = doc.getFont().fontName;
    const currentFontStyle = doc.getFont().fontStyle;
    const currentFontSize = doc.getFontSize();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);

    const text = `${percent}%`;
    const textWidth = doc.getTextWidth(text);
    const textHeight = 18 * 0.3528;
    doc.text(text, x - textWidth / 2, y + textHeight / 2);

    doc.setFont(currentFont, currentFontStyle);
    doc.setFontSize(currentFontSize);
  }

  // Overview
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  addText("SEO Analysis Report");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  addText(`Website URL: ${url}`);

  const onpageScore = seoData.onpage?.overview?.score || 0;
  const technicalScore = seoData.technicalSeo?.overview?.score || 0;
  const contentScore = seoData.contentSeo?.overview?.score || 0;

  const scores = [
    { name: "Overall SEO", value: overallScore || 0 },
    { name: "On-Page SEO", value: onpageScore },
    { name: "Technical SEO", value: technicalScore },
    { name: "Content SEO", value: contentScore },
    { name: "Performance SEO", value: pageSpeed || 0 },
  ];

  const barHeight = 6;
  scores.forEach((score) => {
    addText(`${score.name}: ${score.value}%`);
    const x = margin;
    const y = yPos - lineHeight + 2;
    const barWidth = pageWidth - margin * 2;

    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor("#ddd");
    doc.rect(x, y, barWidth, barHeight, "F");

    doc.setFillColor("#fb6a45");
    doc.rect(x, y, (score.value / 100) * barWidth, barHeight, "F");

    yPos += barHeight + 4;
  });

  // On-Page SEO
  doc.addPage();
  yPos = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  addText("On-Page SEO Details");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const onpage = seoData.onpage?.onpage || {};

  addTextWithPassFail(`Title: ${onpage.title || "<empty>"}`, onpage.titlePass);
  addTextWithPassFail(`Meta Description: ${onpage.metaDescription || "<empty>"}`, onpage.metaPass);

  ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
    if (onpage[tag] && onpage[tag].length > 0) {
      const headingText = `${tag.toUpperCase()} (${onpage.headingCount[tag]}): ${onpage[tag].join(" | ")}`;
      const pass = onpage.headingPass?.[tag] ?? true;
      addTextWithPassFail(headingText, pass);
    }
  });

  addTextWithPassFail(
    `Images: ${onpage.imagesWithAlt || 0} with ALT / ${onpage.imageCount || 0} total`,
    onpage.imagesWithAlt === onpage.imageCount
  );

  addTextWithPassFail(`Internal Links: ${onpage.internalLinks || 0}`, onpage.internalLinksPass);
  addTextWithPassFail(`External Links: ${onpage.externalLinks || 0}`, onpage.externalLinksPass);
  addTextWithPassFail(`Broken Links: ${onpage.brokenLinks || 0}`, onpage.brokenLinksPass);

  addTextWithPassFail(`Open Graph Title: ${onpage.ogTitle || "<empty>"}`, !!onpage.ogTitle);
  addTextWithPassFail(`Open Graph Description: ${onpage.ogDescription || "<empty>"}`, !!onpage.ogDescription);
  addTextWithPassFail(`Twitter Card: ${onpage.twitterCard || "<empty>"}`, !!onpage.twitterCard);
  addTextWithPassFail(
    `Structured Data JSON-LD: ${onpage.structuredData ? "Yes" : "No"}`,
    onpage.structuredPass
  );

  // Technical SEO
  doc.addPage();
  yPos = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  addText("Technical SEO Details");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const technicalSeo = seoData.technicalSeo?.technicalSeo || {};
  const techFields = [
    ["Canonical", technicalSeo.canonical || "Missing", !!technicalSeo.canonical],
    ["Robots Meta", technicalSeo.hasRobotsMeta ? "Pass" : "Fail", technicalSeo.hasRobotsMeta],
    ["Indexable", technicalSeo.robotsIndex || "Fail", technicalSeo.robotsIndex === "Pass"],
    ["Follow Links", technicalSeo.robotsFollow || "Fail", technicalSeo.robotsFollow === "Pass"],
    ["Viewport Meta", technicalSeo.hasViewport ? "Yes" : "No", technicalSeo.hasViewport],
    ["HTTPS", technicalSeo.https ? "Yes" : "No", technicalSeo.https],
    ["Favicon", technicalSeo.hasFavIcon ? "Yes" : "No", technicalSeo.hasFavIcon],
    ["Language Tag", technicalSeo.hreflang ? "Yes" : "No", technicalSeo.hreflang],
    ["Mixed Content", technicalSeo.mixedContent ? "Yes" : "No", !technicalSeo.mixedContent],
    ["Canonical Conflict", technicalSeo.canonicalConflict ? "Yes" : "No", !technicalSeo.canonicalConflict],
    ["Trailing Slash", technicalSeo.trailingSlash ? "Yes" : "No", technicalSeo.trailingSlash],
    ["Page Size (KB)", technicalSeo.pageSizeKB || "Unknown", technicalSeo.pageSizeKB < 2048],
    ["Number of Requests", technicalSeo.numRequests || "Unknown", technicalSeo.numRequests < 100],
    ["Accelerated Mobile Pages (AMP)", technicalSeo.hasAMP ? "Yes" : "No", technicalSeo.hasAMP],
    ["Sitemap Valid URLs", (technicalSeo.sitemapValidUrls || []).map((u) => `${u.url} - ${u.status}`).join(", ") || "None", (technicalSeo.sitemapValidUrls || []).length > 0],
    ["Robots.txt", technicalSeo.robotsTxtUrl || "Missing", !!technicalSeo.robotsTxtUrl],
    ["Sitemap", technicalSeo.sitemapUrl || "Missing", !!technicalSeo.sitemapUrl],
    ["WWW Version", technicalSeo.isWWW ? "WWW" : "Non-WWW", true],
  ];

  techFields.forEach(([label, value, pass]) => addTextWithPassFail(`${label}: ${value}`, pass));

  // Content SEO
  doc.addPage();
  yPos = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  addText("Content SEO Details");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const contentSeo = seoData.contentSeo?.contentSeo || {};
  const contentFields = [
    ["Title", contentSeo.title || "<empty>", contentSeo.titleLength >= 50 && contentSeo.titleLength <= 60],
    ["Meta Description", contentSeo.metaDescription || "<empty>", contentSeo.metaDescLength >= 120 && contentSeo.metaDescLength <= 160],
    ["Keyword Density", contentSeo.keywordDensity || 0, parseFloat(contentSeo.keywordDensity) > 0 && parseFloat(contentSeo.keywordDensity) < 5],
    ["Keyword in Title", contentSeo.hasKeywordInTitle ? "Yes" : "No", contentSeo.hasKeywordInTitle],
    ["Keyword in Headings", contentSeo.keywordInHeadings ? "Yes" : "No", contentSeo.keywordInHeadings],
    ["Keyword in First Paragraph", contentSeo.keywordInFirstParagraph ? "Yes" : "No", contentSeo.keywordInFirstParagraph],
    ["Keyword in Meta", contentSeo.hasKeywordInMeta ? "Yes" : "No", contentSeo.hasKeywordInMeta],
    ["Word Count", contentSeo.wordCount || 0, contentSeo.wordCount >= 300],
    ["Body Length", contentSeo.bodyLength || 0, contentSeo.bodyLength > 500],
    ["Average Sentence Length", contentSeo.avgSentenceLength ? `${contentSeo.avgSentenceLength} words` : "Unknown", contentSeo.avgSentenceLength <= 20],
    ["Images with ALT", `${contentSeo.imagesWithAlt || 0}/${contentSeo.totalImages || 0}`, contentSeo.imagesWithAlt === contentSeo.totalImages],
    ["Media Count", contentSeo.mediaCount || 0, contentSeo.mediaCount > 0],
    ["Internal Links", contentSeo.internalLinks || 0, contentSeo.internalLinks > 0],
    ["External Links", contentSeo.externalLinks || 0, contentSeo.externalLinks > 0],
  ];

  contentFields.forEach(([label, value, pass]) => addTextWithPassFail(`${label}: ${value}`, pass));

  // Performance SEO
  if (performanceData) {
    doc.addPage();
    yPos = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    addText("Performance SEO Details");

    const { desktopData, mobileData } = performanceData;

    if (desktopData) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      addText("Desktop Performance");
      drawCircularProgress(margin + 20, yPos + 20, 15, desktopData.score || 0, "#fb6a45"); 
      yPos += 50;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      addText(`FCP: ${desktopData.fcp} ms`);
      addText(`LCP: ${desktopData.lcp} ms`);
      addText(`TTI: ${desktopData.tti} ms`);
      addText(`Speed Index: ${desktopData.speedIndex} ms`);
      addText(`TBT: ${desktopData.tbt} ms`);
      addText(`CLS: ${desktopData.cls}`);
      addText(`FID: ${desktopData.fid} ms`);
      yPos += 10;
    }

    if (mobileData) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      addText("Mobile Performance");
      drawCircularProgress(margin + 20, yPos + 20, 15, mobileData.score || 0, "#fb6a45"); 
      yPos += 50;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      addText(`FCP: ${mobileData.fcp} ms`);
      addText(`LCP: ${mobileData.lcp} ms`);
      addText(`TTI: ${mobileData.tti} ms`);
      addText(`Speed Index: ${mobileData.speedIndex} ms`);
      addText(`TBT: ${mobileData.tbt} ms`);
      addText(`CLS: ${mobileData.cls}`);
      addText(`FID: ${mobileData.fid} ms`);
      yPos += 10;
    }
  }

  // On-Page SEO Recommendations
  doc.addPage();
  yPos = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  addText("On-Page SEO Recommendations");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const onpageRecs = getFullOnpageRecommendations(onpage);

  if (onpageRecs.length > 0) {
    onpageRecs.forEach((rec) => addText(`• ${rec}`));
  } else {
    addText("Your on-page SEO is fully optimized!");
  }

  // Technical SEO Recommendations
  yPos += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  addText("Technical SEO Recommendations");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const techRecs = getTechnicalSeoRecommendations(technicalSeo);

  if (techRecs.length > 0) {
    techRecs.forEach((rec) => addText(`• ${rec}`));
  } else {
    addText("Your technical SEO looks good! No major issues found.");
  }


  // Content SEO Recommendations
  yPos += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  addText("Content SEO Recommendations");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const recommendations = getSeoContentRecommendations(contentSeo);

  if (recommendations.length > 0) {
    recommendations.forEach((rec) => addText(`• ${rec}`));
  } else {
    addText("Your content looks well-optimized!");
  }

  // Performance SEO Recommendations
  if (performanceData) {
    const { desktopData, mobileData } = performanceData;

    const desktopRecs = getPerformanceRecommendations(desktopData?.opportunities);
    const mobileRecs = getPerformanceRecommendations(mobileData?.opportunities);

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    addText("Performance SEO Recommendations");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Desktop
    if (desktopRecs.length > 0) {
      addText("Desktop Recommendations");
      desktopRecs.forEach((rec) => addText(`• ${normalizeText(rec)}`));
    } else {
      addText("No major desktop performance opportunities found.");
    }

    // Mobile
    if (mobileRecs.length > 0) {
      addText("Mobile Recommendations");
      mobileRecs.forEach((rec) => addText(`• ${normalizeText(rec)}`));
    } else {
      addText("No major mobile performance opportunities found.");
    }
  }

  // Save PDF
  if (download) {
    doc.save(`SEO_Report_${url.replace(/https?:\/\//, "").replace(/\W/g, "_")}.pdf`);
  } else {
    return doc.output("blob"); // return Blob instead of downloading
  }
};
