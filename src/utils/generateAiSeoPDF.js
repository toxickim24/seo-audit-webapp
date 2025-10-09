import jsPDF from "jspdf";
import { generateSeoSuggestions } from "../components/SeoOnpage/SeoOnPageSuggestions";
import { buildTechnicalRecs } from "../components/SeoTechnical/SeoTechnicalSuggestions";
import { buildContentRecs } from "../components/SeoContent/SeoContentSuggestions";

export const generateAiSeoPDF = async (
  url,
  aiAudit,
  download = true,
  simplifiedDesktop,
  simplifiedMobile,
  seoData
) => {
  if (!aiAudit) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 8;
  const headerY = 30;           // header rule
  const footerTopY = pageHeight - 18;
  const footerTextY = pageHeight - 8;
  const contentTopY = 40;       // start of content per page
  const contentBottomY = footerTopY; // guard for content
  let yPos = 50;
  const year = new Date().getFullYear();

  // --- Colors ---
  const COLOR_TEXT = [0, 0, 0];
  const COLOR_MUTED = [90, 90, 90];
  const COLOR_BAR = [251, 106, 69];      // brand orange
  const COLOR_BG = [240, 240, 240];
  const COLOR_HIGH = [220, 53, 69];      // red
  const COLOR_MED = [255, 165, 0];       // orange
  const COLOR_LOW = [40, 167, 69];       // green
  const COLOR_BRAND_FOOTER = [251, 106, 69]; // #FB6A45

  // --- Tag typography (shared across sections) ---
  const TAG_FONT_STYLE = "bold";
  const TAG_FONT_SIZE = 11;

  // --- Clean domain ---
  const cleanDomain = (() => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return String(url || "")
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "");
    }
  })();

  // --- Date ---
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- Utilities ---
  const spaceLeft = () => contentBottomY - yPos;

  const addPage = () => {
    doc.addPage();
    yPos = contentTopY;
  };

  const addText = (text, indent = 0, fontStyle = "normal", size = 12, color = COLOR_TEXT) => {
    const safeText = String(text ?? "");
    const maxWidth = pageWidth - margin * 2 - indent;
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(safeText, maxWidth);
    for (const line of lines) {
      if (yPos > contentBottomY - lineHeight) {
        addPage();
      }
      doc.text(line, margin + indent, yPos);
      yPos += lineHeight;
    }
    doc.setTextColor(...COLOR_TEXT);
  };

  // Single-page-safe text: writes only if there is space on the current page; otherwise stops (no overflow)
  const addTextSinglePage = (text, indent = 0, fontStyle = "normal", size = 12, color = COLOR_TEXT) => {
    const safeText = String(text ?? "");
    const maxWidth = pageWidth - margin * 2 - indent;
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(safeText, maxWidth);
    for (const line of lines) {
      if (yPos > contentBottomY - lineHeight) break;
      doc.text(line, margin + indent, yPos);
      yPos += lineHeight;
    }
    doc.setTextColor(...COLOR_TEXT);
  };

  const addSectionTitle = (title) => {
    if (yPos > contentBottomY - 18) addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(title, margin, yPos);
    yPos += 14;
  };

  const addSectionTitleSinglePage = (title) => {
    if (yPos <= contentBottomY - 18) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...COLOR_TEXT);
      doc.text(title, margin, yPos);
      yPos += 14;
    }
  };

  const drawProgressBar = (label, value) => {
    const barHeight = 7;
    const barWidth = pageWidth - margin * 2 - 65;
    const score = Math.max(0, Math.min(100, Number(value) || 0));
    const filledWidth = (score / 100) * barWidth;
    const percentage = `${Math.round(score)}%`;

    if (yPos > contentBottomY - 14) addPage();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(label, margin, yPos + barHeight - 1);

    // Background
    doc.setFillColor(...COLOR_BG);
    doc.roundedRect(margin + 60, yPos, barWidth, barHeight, 2, 2, "F");

    // Fill
    doc.setFillColor(...COLOR_BAR);
    doc.roundedRect(margin + 60, yPos, filledWidth, barHeight, 2, 2, "F");

    // % label
    doc.setFontSize(10);
    const textY = yPos + barHeight - 2;
    if (filledWidth > 25) {
      doc.setTextColor(255, 255, 255);
      doc.text(percentage, margin + 62, textY);
    } else {
      doc.setTextColor(...COLOR_TEXT);
      doc.text(percentage, margin + 62 + filledWidth + 2, textY);
    }
    doc.setTextColor(...COLOR_TEXT);
    yPos += 14;
  };

  // Single-page-safe progress bar: do not overflow page, silently skip if no space
  const drawProgressBarSinglePage = (label, value) => {
    const need = 14;
    if (spaceLeft() < need) return; // don't draw if it won't fit
    const barHeight = 7;
    const barWidth = pageWidth - margin * 2 - 65;
    const score = Math.max(0, Math.min(100, Number(value) || 0));
    const filledWidth = (score / 100) * barWidth;
    const percentage = `${Math.round(score)}%`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(label, margin, yPos + barHeight - 1);

    doc.setFillColor(...COLOR_BG);
    doc.roundedRect(margin + 60, yPos, barWidth, barHeight, 2, 2, "F");

    doc.setFillColor(...COLOR_BAR);
    doc.roundedRect(margin + 60, yPos, filledWidth, barHeight, 2, 2, "F");

    doc.setFontSize(10);
    const textY = yPos + barHeight - 2;
    if (filledWidth > 25) {
      doc.setTextColor(255, 255, 255);
      doc.text(percentage, margin + 62, textY);
    } else {
      doc.setTextColor(...COLOR_TEXT);
      doc.text(percentage, margin + 62 + filledWidth + 2, textY);
    }
    doc.setTextColor(...COLOR_TEXT);
    yPos += 10;
  };

  const severityColor = (lvl) => {
    const v = String(lvl || "").toLowerCase();
    if (v === "high") return COLOR_HIGH;
    if (v === "medium") return COLOR_MED;
    return COLOR_LOW;
  };

  const addHeaderFooter = (pageNum, totalPages) => {
    // Header
    try {
      const logo = "/seo-logo.png";
      const w = 20;
      const h = (w * 97.5) / 130;
      doc.addImage(logo, "PNG", margin, 8, w, h);
    } catch (_) {}
    doc.setDrawColor(200);
    doc.line(margin, headerY, pageWidth - margin, headerY);

    // Footer line
    doc.line(margin, footerTopY, pageWidth - margin, footerTopY);

    // Left-aligned footer text + right-aligned page #
    const pre = `© ${year} SEO Mojo. All Rights Reserved. Made by `;
    const brand = "Web Design Davao";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(pre, margin, footerTextY);
    const preW = doc.getTextWidth(pre);
    doc.setTextColor(...COLOR_BRAND_FOOTER);
    doc.text(brand, margin + preW, footerTextY);
    doc.setTextColor(...COLOR_TEXT);

    const pageLabel = `Page ${pageNum} of ${totalPages}`;
    const textWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, pageWidth - margin - textWidth, footerTextY);
  };

  const sectionPage = {};

  // ===== COVER + TOC (Page 1) =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...COLOR_TEXT);
  doc.text("SEO Mojo Audit Report", pageWidth / 2, yPos, { align: "center" });
  yPos += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`Prepared for: ${cleanDomain}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(`Date: ${now}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLOR_TEXT);
  doc.text("Table of Contents", pageWidth / 2, yPos, { align: "center" });
  const tocPage = 1;
  const tocYStart = yPos + 20;

  // ===== PAGE 2 – ONE-PAGE: Scores Overview + Exec Summary + Key Findings + Quick Wins =====
  addPage();
  const onePager1 = doc.internal.getNumberOfPages();
  sectionPage["Scores Overview"] = onePager1;
  sectionPage["Executive Summary"] = onePager1;
  sectionPage["Key Findings"] = onePager1;
  sectionPage["Quick Wins"] = onePager1;

  // Scores Overview
  addSectionTitleSinglePage("Scores Overview");
  addTextSinglePage(
    "SEO (Search Engine Optimization) — the scores below show your site's performance across key categories.",
    0,
    "normal",
    10,
    COLOR_MUTED
  );
  
  if (aiAudit?.scores) {
    drawProgressBarSinglePage("Overall SEO", aiAudit.scores.overall ?? 0);
    drawProgressBarSinglePage("On-Page SEO", aiAudit.scores.onpage ?? 0);
    drawProgressBarSinglePage("Technical SEO", aiAudit.scores.technical ?? 0);
    drawProgressBarSinglePage("Content SEO", aiAudit.scores.content ?? 0);
    drawProgressBarSinglePage("Performance SEO", aiAudit.scores.performance ?? 0);
  }
  yPos += 14; // light gap before next subsection

  // Executive Summary
  addSectionTitleSinglePage("Executive Summary");
  if (typeof aiAudit.overall_summary === "object" && aiAudit.overall_summary) {
    if (aiAudit.overall_summary.headline) {
      addTextSinglePage(aiAudit.overall_summary.headline);
      yPos += 4;
    }
    if (Array.isArray(aiAudit.overall_summary.bullets)) {
      aiAudit.overall_summary.bullets.forEach((b) => addTextSinglePage(`• ${b}`));
    }
  } else {
    addTextSinglePage(aiAudit.overall_summary || "No summary available.");
  }
  yPos += 6;

  // Key Findings
  addSectionTitleSinglePage("Key Findings");
  const keyFindings = Array.isArray(aiAudit?.key_findings)
    ? aiAudit.key_findings
    : Array.isArray(aiAudit?.bullets)
    ? aiAudit.bullets
    : Array.isArray(aiAudit?.findings)
    ? aiAudit.findings
    : [];
  if (keyFindings.length) keyFindings.forEach((b) => addTextSinglePage(`• ${b}`));
  else addTextSinglePage("No key findings available.");
  yPos += 6;

  // Quick Wins
  addSectionTitleSinglePage("Quick Wins");
  (aiAudit.quick_wins || []).forEach((q) => addTextSinglePage(`• ${q}`));
  // end of one-page block (content beyond limit is simply not drawn)

  // ===== PAGE 3 – ONE-PAGE: Recommendations & Suggestions (all 4 groups) =====
  addPage();
  const recsPage = doc.internal.getNumberOfPages();
  sectionPage["Recommendations & Suggestions"] = recsPage;

  // Build recs
  const onPageRecs = seoData ? generateSeoSuggestions(seoData.onpage?.onpage, seoData.contentSeo) : [];
  const techRecs  = seoData ? buildTechnicalRecs(seoData.technicalSeo?.technicalSeo) : [];
  const contentRecs = seoData ? buildContentRecs(seoData.contentSeo?.contentSeo) : [];
  const perfRecs = [];
  const addOpps = (src) => {
    if (src?.opportunities) {
      src.opportunities.slice(0, 5).forEach((opp) => opp?.title && perfRecs.push({ text: opp.title, level: "medium" }));
    }
  };
  addOpps(simplifiedDesktop);
  addOpps(simplifiedMobile);

  addSectionTitleSinglePage("Recommendations & Suggestions");

  const renderRecGroupSinglePage = (title, list) => {
    if (!list?.length || spaceLeft() < 22) return; // ensure room for subheading + at least one item
    // Subheading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(title, margin, yPos);
    yPos += 8;

    // Order by severity
    const ordered = [...list].sort((a, b) => {
      const order = { high: 1, medium: 2, low: 3 };
      const av = order[String(a.level || "low").toLowerCase()] || 3;
      const bv = order[String(b.level || "low").toLowerCase()] || 3;
      return av - bv;
    });

    // Render items until we run out of vertical space
    ordered.forEach(({ text, level }) => {
      if (spaceLeft() < 10) return; // stop if no room for this item
      const tag = String(level || "low").toUpperCase();

      // Tag (unified style)
      doc.setFont("helvetica", TAG_FONT_STYLE);
      doc.setFontSize(TAG_FONT_SIZE);
      doc.setTextColor(...severityColor(level));
      doc.text(tag, margin, yPos);

      // Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_TEXT);
      const tagWidth = doc.getTextWidth(tag) + 6;
      const maxWidth = pageWidth - margin * 2 - tagWidth;
      const lines = doc.splitTextToSize(`- ${text}`, maxWidth);

      for (const ln of lines) {
        if (spaceLeft() < lineHeight) break;
        doc.text(ln, margin + tagWidth, yPos);
        yPos += lineHeight;
      }

      // tidy spacing
      yPos -= lineHeight;
      yPos += 7;
    });

    yPos += 6; // group gap
  };

  renderRecGroupSinglePage("On-Page SEO", onPageRecs);
  renderRecGroupSinglePage("Technical SEO", techRecs);
  renderRecGroupSinglePage("Content SEO", contentRecs);
  renderRecGroupSinglePage("Performance SEO", perfRecs);

  // ===== PAGE 4 – SEO Performance Results =====
  addPage();
  const perfPage = doc.internal.getNumberOfPages();
  sectionPage["SEO Performance Results"] = perfPage;
  addSectionTitle("SEO Performance Results");

  const renderPerfBlock = (title, data) => {
    if (!data) return;
    if (yPos > contentBottomY - 24) addPage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_TEXT);
    doc.text(title, margin, yPos);
    yPos += 6;

    if (typeof data.score === "number") drawProgressBar(title === "Score" ? "Score" : "Score", data.score);

    if (data.metrics) {
      addText("Core Web Vitals", 0, "bold");
      addText(`FCP (First Contentful Paint): ${data.metrics.fcp ?? "N/A"} ms`, 6);
      addText(`LCP (Largest Contentful Paint): ${data.metrics.lcp ?? "N/A"} ms`, 6);
      addText(`TTI (Time to Interactive): ${data.metrics.tti ?? "N/A"} ms`, 6);
      yPos += 2;
    }

    if (Array.isArray(data.opportunities) && data.opportunities.length) {
      addText("Opportunities for Improvement:", 0, "bold");
      data.opportunities.slice(0, 10).forEach((opp, idx) => {
        const label = opp.title || "Untitled";
        const val = opp.savingsMs ? ` ${opp.savingsMs} ms` : "";
        addText(`${idx + 1}. ${label}${val}`, 6);
      });
    } else {
      addText("No major performance opportunities detected.", 6);
    }
    yPos += 8;
  };

  renderPerfBlock("Desktop Performance", simplifiedDesktop);
  renderPerfBlock("Mobile Performance", simplifiedMobile);

  // ===== PAGE 5 – Prioritized Issues =====
  addPage();
  const issuesPage = doc.internal.getNumberOfPages();
  sectionPage["Prioritized Issues"] = issuesPage;
  addSectionTitle("Prioritized Issues");

  const cleanText = (str) =>
    String(str || "")
      .replace(/[\[\]\{\}"']/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);

  (Array.isArray(aiAudit.prioritized_issues) ? aiAudit.prioritized_issues : []).forEach((issue, i) => {
    if (yPos > contentBottomY - 16) addPage();

    const title = cleanText(issue?.title || issue?.issue || `Issue ${i + 1}`);
    const priorityRaw = String(issue?.priority || issue?.severity || "").toLowerCase();
    const tag = priorityRaw ? `(${priorityRaw.toUpperCase()})` : "";

    // "N. Title (HIGH)" in one sentence with unified tag style
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_TEXT);

    const contentWidth = pageWidth - margin * 2;
    const tagWidth = tag ? doc.getTextWidth(tag) : 0;

    const firstLineMax = tag ? contentWidth - tagWidth - 4 : contentWidth;
    const base = `${i + 1}. ${title}`;
    const lines = doc.splitTextToSize(base, firstLineMax);

    const firstLine = lines.shift() || base;
    doc.text(firstLine, margin, yPos);

    if (tag) {
      const color = severityColor(priorityRaw);
      const preWidth = doc.getTextWidth(firstLine + " ");
      doc.setFont("helvetica", TAG_FONT_STYLE);
      doc.setFontSize(TAG_FONT_SIZE);
      doc.setTextColor(...color);
      doc.text(" " + tag, margin + preWidth, yPos);
      doc.setTextColor(...COLOR_TEXT);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
    }
    yPos += lineHeight;

    lines.forEach((ln) => {
      if (yPos > contentBottomY - lineHeight) return;
      doc.text(ln, margin, yPos);
      yPos += lineHeight;
    });

    // Steps
    let steps = [];
    if (Array.isArray(issue.fix_steps)) steps = issue.fix_steps;
    else if (typeof issue.fix_steps === "string") {
      try {
        const parsed = JSON.parse(issue.fix_steps);
        steps = Array.isArray(parsed) ? parsed : [issue.fix_steps];
      } catch {
        steps = issue.fix_steps.split(/(?:^|\n|[-•]\s*)/).filter((s) => s && s.trim().length > 3);
      }
    }

    toArray(steps).forEach((step) => {
      if (yPos > contentBottomY - lineHeight) return;
      addText(`- ${cleanText(step)}`, 6);
    });

    yPos += 4;
  });

  // ===== PAGE 6 – 30-Day Roadmap =====
  addPage();
  const roadmapPage = doc.internal.getNumberOfPages();
  sectionPage["30-Day Roadmap"] = roadmapPage;
  addSectionTitle("30-Day Roadmap");

  Object.entries(aiAudit.roadmap_weeks || {}).forEach(([week, tasks]) => {
    if (yPos > contentBottomY - 14) addPage();
    addText(String(week).toUpperCase(), 2, "bold");
    (tasks || []).forEach((task) => addText(`- ${task}`, 6));
    yPos += 2;
  });

  // ===== PAGE 7 – Category Notes (separate) + Speed Gain + Disclaimers =====
  addPage();
  const notesPage = doc.internal.getNumberOfPages();
  sectionPage["Category Notes"] = notesPage;
  addSectionTitle("Category Notes");

  Object.entries(aiAudit.category_notes || {}).forEach(([cat, note]) => {
    if (yPos > contentBottomY - 12) addPage();
    addText(String(cat).toUpperCase(), 0, "bold");
    addText(`- ${note}`, 6);
  });

  const tps = aiAudit.total_potential_speed_gain_sec;
  if (typeof tps === "number" && tps > 0) {
    yPos += 10;
    sectionPage["Total Potential Speed Gain"] = notesPage;
    addText("Total Potential Speed Gain", 0, "bold", 16);
    addText(`${tps} seconds (estimated)`);
  }

  if (Array.isArray(aiAudit.disclaimers) && aiAudit.disclaimers.length > 0) {
    yPos += 10;
    sectionPage["Disclaimers"] = notesPage;
    addText("Disclaimers", 0, "bold", 16);
    aiAudit.disclaimers.forEach((d) => addText(`- ${d}`, 6));
  }

  // ===== TOC (updated order) =====
  doc.setPage(tocPage);
  yPos = tocYStart;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_TEXT);

  const tocOrder = [
    "Scores Overview",
    "Executive Summary",
    "Key Findings",
    "Quick Wins",
    "Recommendations & Suggestions",
    "SEO Performance Results",
    "Prioritized Issues",
    "30-Day Roadmap",
    "Category Notes",
    "Total Potential Speed Gain",
    "Disclaimers",
  ];

  tocOrder.forEach((label) => {
    if (!(label in sectionPage)) return;
    const pageNo = sectionPage[label];
    const leftText = label;
    const rightText = String(pageNo);
    const leftWidth = doc.getTextWidth(leftText);
    const rightWidth = doc.getTextWidth(rightText);
    const availableWidth = pageWidth - margin * 2 - leftWidth - rightWidth - 4;
    const dotWidth = doc.getTextWidth(".");
    const dotCount = Math.max(0, Math.floor(availableWidth / dotWidth));
    const dots = ".".repeat(dotCount);

    if (yPos > contentBottomY - 10) {
      addPage();
      // return to TOC page context? No: TOC must all be on cover page.
      // So instead, never overflow on TOC: small safeguard
    }
    doc.text(leftText, margin, yPos);
    doc.text(dots, margin + leftWidth + 2, yPos);
    doc.text(rightText, pageWidth - margin - rightWidth, yPos);
    yPos += 8;
  });

  // ===== FOOTERS =====
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  // ===== OUTPUT =====
  if (download) {
    const safeUrl = cleanDomain.replace(/\W/g, "_");
    doc.save(`SEO_Mojo_Report_${safeUrl}.pdf`);
  } else {
    return doc.output("blob");
  }
};
