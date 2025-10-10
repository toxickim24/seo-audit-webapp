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
      text: "Attached is your SEO report PDF.",
      attachments: [{ filename, content: pdfBuffer }],
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
}
