import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PartnerHelmet from "../../components/Partner/PartnerHelmet";
import styles from "./PublicPartnerContact.module.css";

export default function PublicPartnerContact() {
  const { slug } = useParams();
  const [partner, setPartner] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  // ===========================================================
  // 🔍 FETCH PARTNER DETAILS (including owner email)
  // ===========================================================
  useEffect(() => {
    const loadPartner = async () => {
      try {
        const res = await fetch(`/api/partners/${slug}`);
        if (!res.ok) throw new Error("Failed to load partner details");
        const data = await res.json();
        setPartner(data);
      } catch (err) {
        console.error("Partner load error:", err);
      }
    };

    loadPartner();
  }, [slug]);

  // ===========================================================
  // HANDLE FORM INPUT
  // ===========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===========================================================
  // SUBMIT CONTACT MESSAGE (to partner owner)
  // ===========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }

    try {
      const res = await fetch("/api/contact/partner-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          send_to: partner?.user_email,   // ✅ Correct
          partner_id: partner?.id,        // ⭐ Highly recommended for logging
          partner_slug: slug              // ⭐ Recommended
        }),
      });

      if (!res.ok) throw new Error("Failed to send message.");

      setFormData({ name: "", email: "", message: "" });
      setStatus({ type: "success", message: "Message sent successfully!" });
    } catch (err) {
      setStatus({ type: "error", message: "Failed to send message." });
    }
  };

  const supportEmail =
    partner?.user_email ||
    partner?.email ||
    partner?.support_email ||
    "reports@seomojo.app";

  return (
    <>
      <PartnerHelmet partner={partner} slug={slug} page="contact" />

      <div className="main-layout">
        <div className="main-container">
          <h1 className="title">📬 Contact {partner?.company_name || "Us"}</h1>
          <p className="subtitle">
            Get in touch at {supportEmail} — we normally respond within 24 hours.
          </p>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Send a Message</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Your Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Message</label>
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Write your message…"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              {status.message && (
                <p
                  className={
                    status.type === "success" ? styles.success : styles.error
                  }
                >
                  {status.message}
                </p>
              )}

              <button type="submit" className={styles.primaryBtn}>
                📤 Send Message
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
