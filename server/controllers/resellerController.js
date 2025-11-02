import { createMailer } from "../config/mailer.js";
import path from "path";
import fs from "fs";

export const sendResellerRequest = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      email,
      contactNumber,
      website,
      primaryColor,
      secondaryColor,
      accentColor,
      message,
      logo_url,
    } = req.body;

    const transporter = createMailer();

    // ✅ Check if logo file exists locally
    let attachments = [];
    if (logo_url) {
      const localPath = path.join("server", logo_url); // e.g. /server/uploads/partners/logo-123.png
      if (fs.existsSync(localPath)) {
        attachments.push({
          filename: path.basename(localPath),
          path: localPath,
          cid: "partnerlogo@mojo", // Content-ID for inline image
        });
      }
    }

    await transporter.sendMail({
      from: `"SEO Mojo" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: `🧩 New Reseller Whitelabel Request — ${companyName}`,
      html: `
        <h2>New Reseller Whitelabel Request</h2>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Company:</b> ${companyName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Contact:</b> ${contactNumber || "N/A"}</p>
        <p><b>Website:</b> ${website || "N/A"}</p>
        <h3>🎨 Branding</h3>
        <p>Primary: ${primaryColor}<br>Secondary: ${secondaryColor}<br>Accent: ${accentColor}</p>
        <p><b>Message:</b> ${message || "N/A"}</p>
        ${
          attachments.length
            ? `<img src="cid:partnerlogo@mojo" style="max-width:200px;border:1px solid #eee;margin-top:10px;" />`
            : ""
        }
      `,
      attachments,
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("❌ Reseller email error:", err);
    res.status(500).json({ error: "Failed to send reseller request" });
  }
};