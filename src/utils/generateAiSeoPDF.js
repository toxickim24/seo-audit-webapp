import jsPDF from "jspdf";

export const generateAiSeoPDF = (url, aiAudit, download = true) => {
  if (!aiAudit) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 45;
  const margin = 14;
  const lineHeight = 8;
  const year = new Date().getFullYear();
  const now = new Date().toLocaleString();

  // === Helpers ===
  const addText = (text, indent = 0) => {
    const safeText = String(text || "");
    const maxWidth = pageWidth - margin * 2 - indent;
    const lines = doc.splitTextToSize(safeText, maxWidth);
    lines.forEach((line) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = 45;
      }
      doc.text(line, margin + indent, yPos);
      yPos += lineHeight;
    });
  };

  // === Cover Page ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SEO Mojo Audit Report", margin, yPos);
  yPos += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  addText(`Website: ${url}`);
  yPos += 5;
  addText(`Date: ${now}`);
  yPos += 15;

  // === Summary ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addText("Overall Summary:");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  addText(aiAudit.overall_summary || "No summary available.");
  yPos += 10;

  // === AI Quick Wins ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addText("Quick Wins:");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  if (aiAudit.quick_wins && aiAudit.quick_wins.length > 0) {
    aiAudit.quick_wins.forEach((item) => addText(`• ${item}`));
  } else {
    addText("No data available.");
  }
  yPos += 10;

  // === AI Prioritized Issues ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addText("Prioritized Issues:");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  if (aiAudit.prioritized_issues && aiAudit.prioritized_issues.length > 0) {
    aiAudit.prioritized_issues.forEach((issue, i) => {
      const text = issue?.issue
        ? `${i + 1}. ${issue.issue} (Priority: ${issue.priority})`
        : String(issue);
      addText(text);
    });
  } else {
    addText("No data available.");
  }
  yPos += 10;

  // === AI Roadmap ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addText("30-Day Roadmap:");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  if (aiAudit.roadmap_weeks && Object.keys(aiAudit.roadmap_weeks).length > 0) {
    Object.entries(aiAudit.roadmap_weeks).forEach(([week, tasks]) => {
      addText(`${week.toUpperCase()}:`, 2);
      (tasks || []).forEach((task) => addText(`• ${task}`, 6));
      yPos += 4;
    });
  } else {
    addText("No data available.");
  }
  yPos += 10;

  // === AI Category Notes ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  addText("Category Notes:");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  if (aiAudit.category_notes && Object.keys(aiAudit.category_notes).length > 0) {
    Object.entries(aiAudit.category_notes).forEach(([cat, note]) => {
      addText(`${cat.toUpperCase()}: ${note}`);
    });
  } else {
    addText("No data available.");
  }

  // === Header + Footer ===
  const addHeaderFooter = (pageNum, totalPages) => {
    const logo = "/seo-logo.png";
    try {
      doc.addImage(logo, "PNG", margin, 8, 20, (20 * 97.5) / 130);
    } catch (e) {}

    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(margin, 30, pageWidth - margin, 30);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    const footerText = `© ${year} SEO Mojo. All Rights Reserved. Made by Web Design Davao`;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(footerText, margin, pageHeight - 8);

    const pageLabel = `Page ${pageNum} of ${totalPages}`;
    const textWidth = doc.getTextWidth(pageLabel);
    doc.setTextColor(0, 0, 0);
    doc.text(pageLabel, pageWidth - margin - textWidth, pageHeight - 8);
  };

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  if (download) {
    const safeUrl = String(url || "")
      .replace(/^https?:\/\//, "")
      .replace(/\W/g, "_");
    doc.save(`SEO_Mojo_AI_Report_${safeUrl}.pdf`);
  } else {
    return doc.output("blob");
  }
};
