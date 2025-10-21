import { createMailer } from "../config/mailer.js";

export async function sendSeoEmail(req, res) {
  const { email, pdfBlob, safeUrl } = req.body;
  if (!email || !pdfBlob) return res.status(400).json({ error: "Email and PDF required" });

  try {
    const pdfBuffer = Buffer.from(pdfBlob.split(",")[1], "base64");
    const mailer = createMailer(); // 🧠 created only when used, env now loaded!

    const filename = safeUrl
      ? `SEO_Mojo_Report_${safeUrl}.pdf`
      : "SEO_Mojo_Report.pdf";

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your SEO Report",
      text: `Hello,

Attached is your personalized SEO Audit Report. 
It includes an overview of your website’s performance, key findings, and actionable recommendations to help improve visibility and search rankings.

If you have any questions or would like to discuss next steps, feel free to reply to this email.

Best regards,
The SEO Mojo Team
`,
      attachments: [{ filename, content: pdfBuffer }],
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
}
