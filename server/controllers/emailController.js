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
      ? "Your SEO Audit Report from SEO Mojo"
      : `${company_name} – Your Personalized SEO Audit Report`;

    await mailer.sendMail({
    from: `"SEO Mojo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjectLine,
    text: `Hello ${name || ""},

Attached is your personalized SEO Audit Report prepared by ${
    company_name || "SEO Mojo"
  }.
It includes an overview of your website’s performance, key findings, and actionable recommendations.

If you have any questions or would like to discuss next steps, feel free to reply to this email.

Best regards,
${company_name || "Chip | SEO Mojo"}
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
