// controllers/contactController.js
import { createMailer } from "../config/mailer.js";
import { getDB } from "../config/db.js";

// Escape HTML to prevent injection (important for spam filters & security)
const escapeHTML = (str = "") =>
  str
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const sendContactMessage = async (req, res) => {
  try {
    const db = getDB();

    const {
      name = "",
      email = "",
      message = "",
      partner_id,
      partner_slug,
    } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "All fields (name, email, message) are required." });
    }

    console.log("📩 Incoming contact message...");

    // -----------------------------------------
    // DEFAULT RECEIVER (for non-partner pages)
    // -----------------------------------------
    let receiverEmail =
      process.env.EMAIL_RECEIVER || process.env.EMAIL_USER;

    let fromName = "SEO Mojo Contact";
    let partnerName = null;

    // -----------------------------------------
    // IF PARTNER MESSAGE → FETCH OWNER EMAIL
    // -----------------------------------------
    if (partner_id || partner_slug) {
      console.log("🔍 Partner contact detected. Fetching owner email...");

      const identifier = partner_id || partner_slug;

      const [rows] = await db.query(
        `
        SELECT 
          p.company_name,
          p.user_id,
          u.email AS user_email
        FROM partners p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE ${partner_id ? "p.id = ?" : "p.slug = ?"}
        LIMIT 1
        `,
        [identifier]
      );

      if (rows.length > 0) {
        const partner = rows[0];

        partnerName = partner.company_name;

        if (partner.user_email) {
          receiverEmail = partner.user_email;
          console.log("📨 Sending to partner owner:", receiverEmail);
        } else {
          console.log(
            "⚠ Partner owner email missing — fallback to default receiver."
          );
        }

        // FROM NAME FORMAT:
        // "Jam Advertising via SEO Mojo"
        fromName = `${partner.company_name} via SEO Mojo`;
      } else {
        console.log("⚠ No partner found — using default receiver.");
      }
    }

    // -----------------------------------------
    // PREPARE EMAIL SENDING
    // -----------------------------------------
    const transporter = createMailer();

    const safeName = escapeHTML(name);
    const safeEmail = escapeHTML(email);
    const safeMessage = escapeHTML(message).replace(/\n/g, "<br>");

    // -----------------------------------------
    // FINAL HTML EMAIL TEMPLATE
    // -----------------------------------------
    const html = `
      <h2 style="font-family:Arial; color:#333;">New Contact Message</h2>

      <p style="font-family:Arial; font-size:14px; color:#444;">
        <strong>Name:</strong> ${safeName}<br>
        <strong>Email:</strong> ${safeEmail}
      </p>

      <p style="font-family:Arial; font-size:14px; color:#444; white-space:pre-line;">
        ${safeMessage}
      </p>

      ${
        partner_slug
          ? `<p style="font-size:13px;color:#777;font-family:Arial;">
              Message sent from: <strong>https://seomojo.app/${partner_slug}/contact</strong>
            </p>`
          : ""
      }

      <hr style="margin:20px 0; border:none; border-top:1px solid #eee;">

      <p style="font-size:12px; color:#888; font-family:Arial;">
        This message was securely sent via the SEO Mojo Partner Contact System.
      </p>

      <p style="font-size:12px; color:#aaa; font-family:Arial;">
        SEO Mojo HQ · Davao City · Philippines
      </p>
    `;

    // -----------------------------------------
    // EMAIL OPTIONS
    // -----------------------------------------
    const mailOptions = {
      from: `"${fromName}" <${process.env.EMAIL_USER}>`, // ★ GOLD STANDARD anti-spam format
      to: receiverEmail,
      replyTo: safeEmail, // Safe, deliverable
      subject: `New Contact Message from ${safeName}`, // No emojis to avoid spam triggers
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email successfully sent to:", receiverEmail);

    return res
      .status(200)
      .json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    return res.status(500).json({
      error: "Failed to send message. Please try again later.",
    });
  }
};