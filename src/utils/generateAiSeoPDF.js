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
  let yPos = 50;
  const margin = 20;
  const lineHeight = 8;
  const year = new Date().getFullYear();

  // ✅ Clean domain
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

  // ✅ Date
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ✅ Helpers
  const addText = (text, indent = 0, fontStyle = "normal", size = 12) => {
    const safeText = String(text ?? "");
    const maxWidth = pageWidth - margin * 2 - indent;
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(safeText, maxWidth);
    for (const line of lines) {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = 45;
      }
      doc.text(line, margin + indent, yPos);
      yPos += lineHeight;
    }
  };

  const addHeaderFooter = (pageNum, totalPages) => {
    try {
      const logo = "/seo-logo.png";
      doc.addImage(logo, "PNG", margin, 8, 20, (20 * 97.5) / 130);
    } catch (_) {}
    doc.setDrawColor(200);
    doc.line(margin, 30, pageWidth - margin, 30);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    const footerText = `© ${year} SEO Mojo. All Rights Reserved. Made by Web Design Davao`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const footerY = pageHeight - 8;
    doc.text(footerText, margin, footerY);

    const pageLabel = `Page ${pageNum} of ${totalPages}`;
    const textWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, pageWidth - margin - textWidth, footerY);
  };

  const sectionPage = {};

  // === COVER + TOC ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("SEO Mojo Audit Report", pageWidth / 2, yPos, { align: "center" });
  yPos += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`Prepared for: ${cleanDomain}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Date: ${now}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Table of Contents", pageWidth / 2, yPos, { align: "center" });
  const tocPage = 1;
  const tocYStart = yPos + 20;

  // === PAGE 2 – Executive Summary + Key Findings + Quick Wins ===
  doc.addPage();
  yPos = 40;
  const summaryPage = doc.internal.getNumberOfPages();
  sectionPage["Executive Summary"] = summaryPage;
  sectionPage["Key Findings"] = summaryPage;
  sectionPage["Quick Wins"] = summaryPage;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Executive Summary", margin, yPos);
  yPos += 12;

  if (typeof aiAudit.overall_summary === "object" && aiAudit.overall_summary) {
    if (aiAudit.overall_summary.headline) {
      addText(aiAudit.overall_summary.headline);
      yPos += 10;
    }
    if (Array.isArray(aiAudit.overall_summary.bullets)) {
      aiAudit.overall_summary.bullets.forEach((b) => addText(`• ${b}`));
    }
  } else {
    addText(aiAudit.overall_summary || "No summary available.");
  }
  yPos += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Key Findings", margin, yPos);
  yPos += 12;

  const allFindings = Array.isArray(aiAudit?.bullets)
    ? aiAudit.bullets
    : Array.isArray(aiAudit?.key_findings)
    ? aiAudit.key_findings
    : Array.isArray(aiAudit?.findings)
    ? aiAudit.findings
    : [];

  const keyFindings = allFindings.filter(
    (f) => typeof f === "string" && !/score|%|\d{1,3}/i.test(f.trim())
  );

  if (keyFindings.length) {
    keyFindings.forEach((b) => addText(`• ${b}`));
  } else {
    addText("No descriptive key findings available.");
  }
  yPos += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Quick Wins", margin, yPos);
  yPos += 12;
  (aiAudit.quick_wins || []).forEach((q) => addText(`• ${q}`));
  yPos += 12;

  // === PAGE 3 – Scores Overview ===
  doc.addPage();
  yPos = 40;
  const scoresPage = doc.internal.getNumberOfPages();
  sectionPage["Scores Overview"] = scoresPage;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Scores Overview", margin, yPos);
  yPos += 7;

  if (aiAudit?.scores) {
    const barHeight = 7;
    const barWidth = pageWidth - margin * 2 - 65;
    const drawBar = (label, value, y) => {
      const percentage = `${value}%`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(label, margin, y + barHeight - 1);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin + 60, y, barWidth, barHeight, 2, 2, "F");
      const filledWidth = Math.max(0, (value / 100) * barWidth);
      doc.setFillColor(251, 106, 69);
      doc.roundedRect(margin + 60, y, filledWidth, barHeight, 2, 2, "F");
      doc.setFontSize(10);
      const textY = y + barHeight - 2;
      if (filledWidth > 25) {
        doc.setTextColor(255, 255, 255);
        doc.text(percentage, margin + 62, textY);
      } else {
        doc.setTextColor(0, 0, 0);
        doc.text(percentage, margin + 62 + filledWidth + 2, textY);
      }
      doc.setTextColor(0, 0, 0);
    };
    drawBar("Overall SEO", aiAudit.scores.overall || 0, yPos);
    yPos += 10;
    drawBar("On-Page SEO", aiAudit.scores.onpage || 0, yPos);
    yPos += 10;
    drawBar("Technical SEO", aiAudit.scores.technical || 0, yPos);
    yPos += 10;
    drawBar("Content SEO", aiAudit.scores.content || 0, yPos);
    yPos += 10;
    drawBar("Performance SEO", aiAudit.scores.performance || 0, yPos);
    yPos += 20; // increased spacing before suggestions
  }

  // === Colored Suggestions ===
  if (seoData) {
    const onPageRecs = generateSeoSuggestions(seoData.onpage?.onpage, seoData.contentSeo);
    const techRecs = buildTechnicalRecs(seoData.technicalSeo?.technicalSeo);
    const contentRecs = buildContentRecs(seoData.contentSeo?.contentSeo);

    const renderSuggestions = (title, list) => {
      if (!list || !list.length) return;
      const ordered = [...list].sort((a, b) => {
        const order = { high: 1, medium: 2, low: 3 };
        return order[a.level] - order[b.level];
      });
      yPos += 0;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title, margin, yPos);
      yPos += 8;
      ordered.forEach(({ text, level }) => {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 45;
        }
        if (level === "high") doc.setTextColor(220, 53, 69);
        else if (level === "medium") doc.setTextColor(255, 165, 0);
        else doc.setTextColor(40, 167, 69);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(level.toUpperCase(), margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(`- ${text}`, margin + 25, yPos);
        yPos += 7;
      });
      yPos += 10;
    };

    renderSuggestions("On-Page SEO Suggestions", onPageRecs);
    renderSuggestions("Technical SEO Suggestions", techRecs);
    renderSuggestions("Content SEO Suggestions", contentRecs);
  }

  // === PAGE 4 – SEO Performance Results ===
  doc.addPage();
  yPos = 40;
  const perfPage = doc.internal.getNumberOfPages();
  sectionPage["SEO Performance Results"] = perfPage;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SEO Performance Results", margin, yPos);
  yPos += 12;
  const renderPerfBlock = (title, data) => {
    if (!data || typeof data !== "object") return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin, yPos);
    yPos += 5;
    if (typeof data.score === "number") {
      const barHeight = 7;
      const barWidth = pageWidth - margin * 2 - 65;
      const filledWidth = Math.max(0, (data.score / 100) * barWidth);
      const percentage = `${data.score}%`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Score", margin, yPos + barHeight - 1);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin + 60, yPos, barWidth, barHeight, 2, 2, "F");
      doc.setFillColor(251, 106, 69);
      doc.roundedRect(margin + 60, yPos, filledWidth, barHeight, 2, 2, "F");
      doc.setFontSize(10);
      const textY = yPos + barHeight - 2;
      if (filledWidth > 25) {
        doc.setTextColor(255, 255, 255);
        doc.text(percentage, margin + 62, textY);
      } else {
        doc.setTextColor(0, 0, 0);
        doc.text(percentage, margin + 62 + filledWidth + 2, textY);
      }
      doc.setTextColor(0, 0, 0);
      yPos += 14;
    }
    if (data.metrics) {
      addText("Core Web Vitals", 0, "bold");
      addText(`FCP: ${data.metrics.fcp ?? "N/A"} ms`, 6);
      addText(`LCP: ${data.metrics.lcp ?? "N/A"} ms`, 6);
      addText(`TTI: ${data.metrics.tti ?? "N/A"} ms`, 6);
      yPos += 4;
    }
    if (Array.isArray(data.opportunities) && data.opportunities.length) {
      addText("Opportunities for Improvement:", 0, "bold");
      data.opportunities.slice(0, 10).forEach((opp, idx) => {
        const label = opp.title || "Untitled";
        const val = opp.savingsMs ? `${opp.savingsMs} ms` : "";
        addText(`${idx + 1}. ${label} ${val}`, 6);
      });
    } else {
      addText("No major performance opportunities detected.", 6);
    }
    yPos += 14;
  };
  renderPerfBlock("Desktop Performance", simplifiedDesktop);
  renderPerfBlock("Mobile Performance", simplifiedMobile);

  // === PAGE 5 – Prioritized Issues ===
  doc.addPage();
  yPos = 40;
  const issuesPage = doc.internal.getNumberOfPages();
  sectionPage["Prioritized Issues"] = issuesPage;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Prioritized Issues", margin, yPos);
  yPos += 12;

  const cleanText = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/[\]\[\{\}'"]/g, "")
      .replace(/-+\s?(issue|roadmap_weeks|total_potential_speed_gain_sec|priority|fix_steps)[^:]*:?/gi, "")
      .replace(/ref:.*$/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  (Array.isArray(aiAudit.prioritized_issues) ? aiAudit.prioritized_issues : []).forEach((issue, i) => {
    if (!issue) return;
    const title = cleanText(issue?.title || issue?.issue || `Issue ${i + 1}`);
    const priority = cleanText(issue?.priority || issue?.severity || "");
    addText(`${i + 1}. ${title}${priority ? ` (Priority: ${priority})` : ""}`);

    let steps = [];

    if (Array.isArray(issue.fix_steps)) steps = issue.fix_steps;
    else if (typeof issue.fix_steps === "string") {
      try {
        const parsed = JSON.parse(issue.fix_steps);
        if (Array.isArray(parsed)) steps = parsed;
        else steps = [issue.fix_steps];
      } catch {
        steps = issue.fix_steps.split(/[-•]\s*/).filter((s) => s.length > 5);
      }
    }

    steps.forEach((step) => addText(`- ${cleanText(step)}`, 6));
    yPos += 5;
  });

  // === PAGE 6 – 30-Day Roadmap ===
  doc.addPage();
  yPos = 40;
  const roadmapPage = doc.internal.getNumberOfPages();
  sectionPage["30-Day Roadmap"] = roadmapPage;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("30-Day Roadmap", margin, yPos);
  yPos += 12;
  Object.entries(aiAudit.roadmap_weeks || {}).forEach(([week, tasks]) => {
    yPos += 6;
    addText(`${String(week).toUpperCase()}`, 2, "bold");
    (tasks || []).forEach((task) => addText(`- ${task}`, 6));
  });

  // === PAGE 7 – Category Notes ===
  doc.addPage();
  yPos = 40;
  const notesPage = doc.internal.getNumberOfPages();
  sectionPage["Category Notes"] = notesPage;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Category Notes", margin, yPos);
  yPos += 12;
  Object.entries(aiAudit.category_notes || {}).forEach(([cat, note]) => {
    yPos += 6;
    addText(String(cat).toUpperCase(), 0, "bold");
    addText(`- ${note}`, 6);
  });

  const tps = aiAudit.total_potential_speed_gain_sec;
  if (typeof tps === "number" && tps > 0) {
    yPos += 20;
    const tpsPage = doc.internal.getNumberOfPages();
    sectionPage["Total Potential Speed Gain"] = tpsPage;
    addText("Total Potential Speed Gain", 0, "bold", 16);
    addText(`${tps} seconds (estimated)`);
  }

  if (Array.isArray(aiAudit.disclaimers) && aiAudit.disclaimers.length > 0) {
    yPos += 20;
    const discPage = doc.internal.getNumberOfPages();
    sectionPage["Disclaimers"] = discPage;
    addText("Disclaimers", 0, "bold", 16);
    aiAudit.disclaimers.forEach((d) => addText(`- ${d}`, 6));
  }

  // === TOC ===
  doc.setPage(tocPage);
  yPos = tocYStart;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const tocOrder = [
    "Executive Summary",
    "Key Findings",
    "Quick Wins",
    "Scores Overview",
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
    doc.text(leftText, margin, yPos);
    doc.text(dots, margin + leftWidth + 2, yPos);
    doc.text(rightText, pageWidth - margin - rightWidth, yPos);
    yPos += 8;
  });

  // === FOOTERS ===
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  // === OUTPUT ===
  if (download) {
    const safeUrl = cleanDomain.replace(/\W/g, "_");
    doc.save(`SEO_Mojo_Report_${safeUrl}.pdf`);
  } else {
    return doc.output("blob");
  }
};
