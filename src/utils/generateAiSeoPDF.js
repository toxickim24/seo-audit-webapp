import jsPDF from "jspdf";

export const generateAiSeoPDF = async (url, aiAudit, download = true) => {
  if (!aiAudit) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 50;
  const margin = 20;
  const lineHeight = 8;
  const year = new Date().getFullYear();

  // Clean domain (no http/https/paths)
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

  // Professional date
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helpers
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

  // --- We’ll record section start pages for a reliable TOC
  const sectionPage = {}; // { label: pageNumber }

  // === Cover + TOC header (we fill items later) ===
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

  // === Page 2: Scores Overview ===
  doc.addPage();
  yPos = 40;
  const scoresPage = doc.internal.getNumberOfPages();
  sectionPage["Scores Overview"] = scoresPage;

  if (aiAudit?.scores) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Scores Overview", margin, yPos);
    yPos += 12;

    // your current, working bar style (height aligned to text)
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
    yPos += 20;
    drawBar("On-Page SEO", aiAudit.scores.onpage || 0, yPos);
    yPos += 20;
    drawBar("Technical SEO", aiAudit.scores.technical || 0, yPos);
    yPos += 20;
    drawBar("Content SEO", aiAudit.scores.content || 0, yPos);
    yPos += 20;
    drawBar("Performance SEO", aiAudit.scores.performance || 0, yPos);
    yPos += 25;
  }

  // === Page 3: Overall Summary + Key Findings + Quick Wins (same page)
  doc.addPage();
  yPos = 40;
  const overviewPage = doc.internal.getNumberOfPages();
  sectionPage["Overall Summary"] = overviewPage;
  sectionPage["Key Findings"] = overviewPage; // force same page in TOC
  sectionPage["Quick Wins"] = overviewPage;   // force same page in TOC

  // Overall Summary (supports headline+bullets or plain string)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Overall Summary", margin, yPos);
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

  // Key Findings
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Key Findings", margin, yPos);
  yPos += 12;
  (aiAudit.bullets || []).forEach((b) => addText(`• ${b}`));
  yPos += 12;

  // Quick Wins
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Quick Wins", margin, yPos);
  yPos += 12;
  (aiAudit.quick_wins || []).forEach((q) => addText(`• ${q}`));
  yPos += 12;

  // === Prioritized Issues (revert to your original style)
  doc.addPage();
  yPos = 40;
  const issuesPage = doc.internal.getNumberOfPages();
  sectionPage["Prioritized Issues"] = issuesPage;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Prioritized Issues", margin, yPos);
  yPos += 12;

  (aiAudit.prioritized_issues || []).forEach((issue, i) => {
    // Backward/forward compatible: title or issue + priority/severity
    const title = issue?.title || issue?.issue || "Untitled";
    const priority = issue?.priority || issue?.severity; // keep your original "Priority:" label
    yPos += 6;
    addText(`${i + 1}. ${title}${priority ? ` (Priority: ${priority})` : ""}`);
    (issue?.fix_steps || []).forEach((step) => addText(`- ${step}`, 6));
  });

  // === 30-Day Roadmap
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

  // === Category Notes (+ Performance note included)
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

  // === Total Potential Speed Gain (hide if 0/null/undefined)
  const tps = aiAudit.total_potential_speed_gain_sec;
  if (typeof tps === "number" && tps > 0) {
    yPos += 20;
    const tpsPage = doc.internal.getNumberOfPages();
    sectionPage["Total Potential Speed Gain"] = tpsPage;

    addText("Total Potential Speed Gain", 0, "bold", 16);
    addText(`${tps} seconds (estimated)`);
  }

  // === Disclaimers
  if (Array.isArray(aiAudit.disclaimers) && aiAudit.disclaimers.length > 0) {
    yPos += 20;
    const discPage = doc.internal.getNumberOfPages();
    sectionPage["Disclaimers"] = discPage;

    addText("Disclaimers", 0, "bold", 16);
    aiAudit.disclaimers.forEach((d) => addText(`- ${d}`, 6));
  }

  // === Build TOC dynamically on page 1
  doc.setPage(tocPage);
  yPos = tocYStart;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const tocOrder = [
    "Scores Overview",
    "Overall Summary",
    "Key Findings",
    "Quick Wins",
    "Prioritized Issues",
    "30-Day Roadmap",
    "Category Notes",
    "Total Potential Speed Gain",
    "Disclaimers",
  ];

  tocOrder.forEach((label) => {
    // skip entries not present (e.g., TPS hidden)
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

    // Left label
    doc.text(leftText, margin, yPos);
    // Dots
    doc.text(dots, margin + leftWidth + 2, yPos);
    // Right page number (right aligned)
    doc.text(rightText, pageWidth - margin - rightWidth, yPos);

    yPos += 8;
  });

  // === Footer for all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  if (download) {
    const safeUrl = cleanDomain.replace(/\W/g, "_");
    doc.save(`SEO_Mojo_Report_${safeUrl}.pdf`);
  } else {
    return doc.output("blob");
  }
};
