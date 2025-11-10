import { createMailer } from "../config/mailer.js";

export async function sendSeoEmail(req, res) {

  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  
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
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
    <div style="background: ${isDefaultCompany ? "#fb6a45" : "#22354d"}; color: #fff; text-align: center; padding: 20px;">
      <img src="${BASE_URL}/public/seo-logo.png" alt="Logo" style="max-width: 160px; margin-bottom: 5px;" />
      <h2 style="margin: 0; font-size: 22px;">Your SEO Audit Report</h2>
    </div>

    <div style="padding: 25px; color: #333;">
      <p>Hi ${name || "there"},</p>
      <p>Attached is your personalized <strong>SEO Audit Report</strong> prepared by <strong>${company_name || "SEO Mojo"}</strong>.</p>
      <p>It includes an overview of your website’s performance, key findings, and actionable recommendations to improve rankings and visibility.</p>

      <h3 style="color: #22354d;">Next Steps</h3>
      <p>You’ve now got a clearer picture of how your website’s performing — but the question is, what do you do with this information?</p>

      <blockquote style="border-left: 4px solid #fb6a45; padding-left: 12px; color: #555; font-style: italic; margin: 10px 0;">
        “Where should I even start?”<br />
        “Which of these fixes will actually move the needle?”
      </blockquote>

      <p>If that sounds familiar, you don’t have to figure it out alone. Just hit <strong>reply</strong> to this email, and we’ll personally walk you through what to prioritize first, what can wait, and how to turn these insights into measurable growth.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://seomojo.app/contact" style="background: #fb6a45; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">Book a Free Consultation</a>
      </div>

      <p>Best regards,<br /><strong>${company_name || "Chip | SEO Mojo"}</strong></p>
    </div>

    <div style="background: #f9f9f9; text-align: center; padding: 15px; font-size: 0.8rem; color: #888;">
      © ${new Date().getFullYear()} ${company_name || "SEO Mojo"}. All Rights Reserved.
    </div>
  </div>
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
