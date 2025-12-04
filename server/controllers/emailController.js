import { createMailer } from "../config/mailer.js";

export async function sendSeoEmail(req, res) {
  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const {
    email,
    name,
    pdfBlob,
    url,
    safeUrl,
    company_name,
    slug,
    primary_color,
    secondary_color,
    partner_logo,
    booking_link,
  } = req.body;

  if (!email || !pdfBlob) {
    return res.status(400).json({ error: "Email and PDF required" });
  }

  try {
    const pdfBuffer = Buffer.from(pdfBlob.split(",")[1], "base64");
    const mailer = createMailer();

    // Logo
    const logoSrc = partner_logo
      ? `${BASE_URL}${partner_logo}`
      : `${BASE_URL}/public/seo-logo.png`;

    // Clean domain (FINAL FIX)
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

    // Default company logic
    const isDefaultCompany =
      !company_name || company_name.toLowerCase().trim() === "seo mojo";

    const cleanCompany = isDefaultCompany
      ? "SEO_Mojo"
      : company_name.replace(/\W+/g, "_");

    // Filename
    const filename = isDefaultCompany
      ? `${cleanCompany}_Audit_Report_${safeUrl || "Report"}.pdf`
      : `${cleanCompany}_SEO_Audit_Report_${safeUrl || "Report"}.pdf`;

    // Subject (safe & non-phishing)
    const subjectLine = isDefaultCompany
      ? `SEO Audit Results for ${cleanDomain || "your website"}`
      : `${company_name} – SEO Audit Results for ${cleanDomain || "your website"}`;

    // Colors
    const headerColor = isDefaultCompany
      ? "#ffffff"
      : primary_color || "#22354d";

    const headerTextColor = isDefaultCompany ? "#22354d" : "#ffffff";

    // --------------------------
    // BOOKING LINK LOGIC (FINAL)
    // --------------------------
    const partnerSlug = slug?.trim() || "";

    // First priority: default company
    let bookingLink = "https://seomojo.app/seo-contact";

    // If not default → try partner booking link (from DB)
    if (!isDefaultCompany) {
      if (req.body.booking_link && req.body.booking_link.trim() !== "") {
        bookingLink = req.body.booking_link.trim();
      } else {
        // fallback when no booking link saved
        bookingLink = `https://seomojo.app/${partnerSlug}/contact`;
      }
    }

    // Sender — safe (no impersonation)
    const fromEmail = process.env.EMAIL_USER; // reports@seomojo.app

    const fromName = company_name
      ? `${company_name} via SEO Mojo`
      : "SEO Mojo Reports";

    const replyToEmail = process.env.EMAIL_RECEIVER;

    // --------------------------
    // PLAIN TEXT VERSION
    // --------------------------
    const plainText = `
Hi ${name || "there"},

Your SEO audit for ${cleanDomain || "your website"} is attached.

Inside the report:
- Your website's SEO performance
- Key findings
- Recommended improvements

If you need help understanding the results, simply reply to this email.

To stop receiving reports, reply with "Unsubscribe".

SEO Mojo
https://seomojo.app
`.trim();

    // --------------------------
    // SEND EMAIL
    // --------------------------

    await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      replyTo: replyToEmail,
      subject: subjectLine,
      text: plainText,

      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
background: #ffffff; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">

  <!-- HEADER -->
  <div style="background: ${headerColor}; color: ${headerTextColor};
  text-align: center; padding: 20px;">
    <img src="${logoSrc}" alt="Logo" style="max-width:160px;margin-bottom:5px;" />
    <h2 style="margin:0; font-size:22px; color: #333;">
      SEO Audit Results
    </h2>
  </div>

  <!-- BODY -->
  <div style="padding: 25px; color: #333;">
    <p>Hi ${name || "there"},</p>

    <p>Your SEO audit report for
    <strong>${cleanDomain || "your website"}</strong> is attached.</p>

    <p>The report includes:</p>
    <ul>
      <li>Your current SEO performance</li>
      <li>Key issues detected</li>
      <li>Recommended improvements & priorities</li>
    </ul>

    <p>If you’d like help reviewing the results, our team is here to guide you.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${bookingLink}"
        style="background: ${secondary_color}; color: #fff; text-decoration: none;
        padding: 12px 28px; border-radius: 6px; font-weight: bold;
        display: inline-block;">
        Book a Free Consultation
      </a>
    </div>

    <p>
      Kind regards,<br />
      <strong>${isDefaultCompany ? "SEO Mojo Team" : company_name}</strong>
    </p>
  </div>

  <!-- FOOTER -->
  <div style="background: #f9f9f9; text-align: center; padding: 15px;
  font-size: 0.8rem; color: #888;">
    © ${new Date().getFullYear()} SEO Mojo. All Rights Reserved.<br />
    <span style="font-size:12px;">If you no longer want these reports,
    <a href="mailto:${process.env.EMAIL_RECEIVER}?subject=Unsubscribe"
       style="color:#555;">click here to unsubscribe</a>.</span>
  </div>

</div>
`,
      attachments: [{ filename, content: pdfBuffer }],

      // Gmail & Outlook Anti-Spam / Anti-Phishing header
      list: {
        unsubscribe: {
          url: `mailto:${process.env.EMAIL_RECEIVER}?subject=Unsubscribe`,
          comment: "Unsubscribe from SEO Mojo reports",
        },
      },
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