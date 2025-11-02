import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import styles from "./ResellerWhitelabelForm.module.css";

function ResellerWhitelabelForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    contactNumber: "",
    website: "",
    primaryColor: "#FF8E3A",
    secondaryColor: "#FB6A45",
    accentColor: "#22354D",
    logo: null,
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, logo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!formData.fullName || !formData.companyName || !formData.email || !formData.logo) {
      setStatus({ type: "error", message: "Please fill all required fields and upload logo." });
      return;
    }

    try {
      // ✅ Step 1: Upload logo first
      const logoForm = new FormData();
      logoForm.append("logo", formData.logo);
      const uploadRes = await fetch("/api/upload/logo", { method: "POST", body: logoForm });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.url) throw new Error("Logo upload failed.");

      // ✅ Step 2: Then send email + form details
      const payload = { ...formData, logo_url: uploadData.url };
      const res = await fetch("/api/resellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send request.");

      setStatus({
        type: "success",
        message: "✅ Request submitted successfully! Our team will contact you soon.",
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <div className="main-layout">
      <div className="main-container">
        <Helmet>
          <title>Reseller Whitelabel Setup Request</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <h1 className={styles.title}>🤝 Reseller Whitelabel Request</h1>
        <p className={styles.subtitle}>
          Submit your details below to request a Whitelabel setup.
        </p>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Reseller Setup Form</h2>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
            encType="multipart/form-data"
          >
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your company name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Contact Number (Optional)</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Website (Optional)</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {/* ✅ Upload Logo */}
              <div className={styles.formGroup}>
                <label>Upload Logo *</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Primary Color *</label>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  required
                />
                <small className={styles.colorDesc}>
                  Used for header background, main buttons, and other key elements.
                </small>
              </div>

              <div className={styles.formGroup}>
                <label>Secondary Color *</label>
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  required
                />
                <small className={styles.colorDesc}>
                  Used for footer background, hover states, and supporting accents.
                </small>
              </div>

              <div className={styles.formGroup}>
                <label>Accent Color *</label>
                <input
                  type="color"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  required
                />
                <small className={styles.colorDesc}>
                  Used for progress bars, spinners, and subtle highlights.
                </small>
              </div>
            </div>

            <div className={styles.formGroupFull}>
              <label>Additional Notes (Optional)</label>
              <textarea
                name="message"
                rows="5"
                placeholder="Tell us more about your branding or any specific needs."
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
              🚀 Submit Request
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ResellerWhitelabelForm;
