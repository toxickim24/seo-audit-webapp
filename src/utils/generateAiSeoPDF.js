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
  const now = new Date().toLocaleString();

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
    doc.setFontSize(10);
    doc.text(footerText, margin, pageHeight - 8);

    const pageLabel = `Page ${pageNum} of ${totalPages}`;
    const textWidth = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, pageWidth - margin - textWidth, pageHeight - 8);
  };

  // === Cover Page ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("SEO Mojo Audit Report", pageWidth / 2, yPos, { align: "center" });
  yPos += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(`Prepared for: ${String(url || "").replace(/^https?:\/\//, "")}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Date: ${now}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 20;

  // === Scores with Progress Bars on Cover ===
  if (aiAudit?.scores) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Scores Overview", margin, yPos);
    yPos += 10;

    const barHeight = 10;
    const barWidth = pageWidth - margin * 2 - 65;

    const drawBar = (label, value, y) => {
      const percentage = `${value}%`;

      // Label left
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(label, margin, y + barHeight - 2);

      // Grey background
      doc.setFillColor(220, 220, 220);
      doc.rect(margin + 60, y, barWidth, barHeight, "F");

      // Orange filled bar
      const filledWidth = Math.max(0, (value / 100) * barWidth);
      doc.setFillColor(251, 106, 69); // #fb6a45
      doc.rect(margin + 60, y, filledWidth, barHeight, "F");

      // % text
      doc.setFontSize(10);
      if (filledWidth > 20) {
        doc.setTextColor(255, 255, 255); // white inside bar
        doc.text(percentage, margin + 62, y + barHeight - 2);
      } else {
        doc.setTextColor(0, 0, 0); // black outside
        doc.text(percentage, margin + 62 + filledWidth + 2, y + barHeight - 2);
      }
      doc.setTextColor(0, 0, 0);
    };

    drawBar("Overall SEO", aiAudit.scores.overall || 0, yPos);
    yPos += 16;
    drawBar("On-Page SEO", aiAudit.scores.onpage || 0, yPos);
    yPos += 16;
    drawBar("Technical SEO", aiAudit.scores.technical || 0, yPos);
    yPos += 16;
    drawBar("Content SEO", aiAudit.scores.content || 0, yPos);
    yPos += 16;
    drawBar("Performance SEO", aiAudit.scores.performance || 0, yPos);
    yPos += 22;
  }

  // === Page 2 onwards ===
  doc.addPage();
  yPos = 40;

  addText("Overall Summary:", 0, "bold", 16);
  addText(aiAudit.overall_summary || "No summary available.");
  yPos += 10;

  addText("Key Findings:", 0, "bold", 16);
  (aiAudit.bullets || []).forEach((b) => addText(`• ${b}`));
  yPos += 10;

  addText("Quick Wins:", 0, "bold", 16);
  (aiAudit.quick_wins || []).forEach((q) => addText(`• ${q}`));
  yPos += 10;

  addText("Prioritized Issues:", 0, "bold", 16);
  (aiAudit.prioritized_issues || []).forEach((issue, i) => {
    addText(`${i + 1}. ${issue.issue} (Priority: ${issue.priority})`);
    (issue.fix_steps || []).forEach((step) => addText(`   - ${step}`, 6));
    yPos += 4;
  });
  yPos += 10;

  addText("30-Day Roadmap:", 0, "bold", 16);
  Object.entries(aiAudit.roadmap_weeks || {}).forEach(([week, tasks]) => {
    addText(`${week.toUpperCase()}:`, 2, "bold");
    (tasks || []).forEach((task) => addText(`• ${task}`, 6));
    yPos += 4;
  });
  yPos += 10;

  addText("Category Notes:", 0, "bold", 16);
  Object.entries(aiAudit.category_notes || {}).forEach(([cat, note]) => {
    addText(`${cat.toUpperCase()}: ${note}`);
  });

  // === Footer for all pages ===
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  if (download) {
    const safeUrl = String(url || "").replace(/^https?:\/\//, "").replace(/\W/g, "_");
    doc.save(`SEO_Mojo_Report_${safeUrl}.pdf`);
  } else {
    return doc.output("blob");
  }
};
