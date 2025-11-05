import { createMailer } from "../config/mailer.js";

export async function sendSeoEmail(req, res) {
  
  const { email, name, pdfBlob, safeUrl, company_name } = req.body;

  if (!email || !pdfBlob) return res.status(400).json({ error: "Email and PDF required" });

  try {
    const pdfBuffer = Buffer.from(pdfBlob.split(",")[1], "base64");
    const mailer = createMailer(); // 🧠 created only when used, env now loaded!

    // ✅ Professional filename and subject
    const isDefaultCompany =
      !company_name || company_name.toLowerCase().trim() === "seo mojo";

    const cleanCompany = isDefaultCompany
      ? "SEO_Mojo"
      : company_name.replace(/\W+/g, "_");

    // ✅ Consistent file naming
    const filename = isDefaultCompany
      ? `${cleanCompany}_Audit_Report_${safeUrl || "Report"}.pdf`
      : `${cleanCompany}_SEO_Audit_Report_${safeUrl || "Report"}.pdf`;

    // ✅ Professional email subject
    const subjectLine = isDefaultCompany
      ? "🧩 Your SEO Audit Report from SEO Mojo"
      : `🧩 ${company_name} – Your Personalized SEO Audit Report`;

    await mailer.sendMail({
  from: `"${company_name || "SEO Mojo"}" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: subjectLine,
  html: `
    <p>Hi ${name || "there"},</p>
    <p>Attached is your personalized <strong>SEO Audit Report</strong> prepared by <strong>${company_name || "SEO Mojo"}</strong>.</p>
    <p>It includes an overview of your website’s performance, key findings, and actionable recommendations.</p>

    <h3>🧭 Next Steps</h3>
    <p>You’ve now got a clearer picture of how your website’s performing — but the question is, what do you do with this information?</p>
    <p>Most business owners see an audit like this and wonder:</p>
    <blockquote>
      “Where should I even start?”<br>
      “Which of these fixes will actually move the needle?”
    </blockquote>
    <p>If that sounds familiar, you don’t have to figure it out alone.</p>
    <p>Just hit <strong>reply</strong> to this email, and we’ll personally walk you through what to prioritize first, what can wait, and how to turn these insights into measurable growth.</p>
    <p>There’s no obligation — just a straightforward conversation about where you are, where you want to be, and how we can help you get there faster.</p>
    <p>Best regards,<br><strong>${company_name || "Chip | SEO Mojo"}</strong></p>
  `,
  attachments: [{ filename, content: pdfBuffer }],
});

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    res.status(500).json({
      error: err.message || "Failed to send email",
      stack: err.stack,
    });
  }
}
