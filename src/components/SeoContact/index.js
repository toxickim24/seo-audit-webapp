import React, { useState } from "react";
import styles from "./SeoContact.module.css";

function SeoContact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message.");

      setFormData({ name: "", email: "", message: "" });
      setStatus({ type: "success", message: "✅ Message sent successfully!" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <div className="main-container">
      <h1 className="title">📬 Contact SEO Mojo</h1>
      <p className="subtitle">
        Got questions, partnership inquiries, or technical issues? We’d love to hear from you.
      </p>

      {/* ---------- Contact Info Section ---------- */}
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <span className={styles.icon}>💬</span>
          <h3>Chat Support</h3>
          <p>Reach us through our in-app chat or via email anytime.</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.icon}>📧</span>
          <h3>Email Us</h3>
          <p>support@seomojo.app</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.icon}>🏢</span>
          <h3>Head Office</h3>
          <p>Door #5, J Sulit Bldg, Phase 1, 1st Street, Ecoland Dr, Talomo, Davao City, 8000 Davao del Sur</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.icon}>🌐</span>
          <h3>Visit Us</h3>
          <p>www.seomojo.app</p>
        </div>
      </div>

      {/* ---------- Contact Form Section ---------- */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Send Us a Message</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
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
              placeholder="How can we help you?"
              value={formData.message}
              onChange={handleChange}
            ></textarea>
          </div>

          {status.message && (
            <p
              className={
                status.type === "success"
                  ? styles.success
                  : styles.error
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
  );
}

export default SeoContact;
