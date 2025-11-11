import React from "react";
import styles from "./SeoJourney.module.css";

function SeoJourney({ step }) {
  const steps = [
    { id: "enter", title: "Step 1:", label: "Enter Website", desc: "Type your website URL and start the audit." },
    { id: "scanning", title: "Step 2:", label: "Analyzing Website", desc: "Our system scans your site’s structure and data." },
    { id: "form", title: "Step 3:", label: "Submit Form", desc: "Fill in your contact details to receive your full report." },
    { id: "get-report", title: "Step 4:", label: "Get Full Report", desc: "Review your detailed insights and SEO recommendations." },
    { id: "done", title: "Step 5:", label: "Done", desc: "Receive your branded PDF report, ready to share or present." },
  ];

  const stepOrder = steps.map((s) => s.id);
  let currentIndex = stepOrder.indexOf(step);
  if (step === "results") currentIndex = steps.length - 1;

  return (
    <section className={styles.journeySection}>
      <h2 className={styles.journeyTitle}>How It Works</h2>
      <p className={styles.journeySubtitle}>
        Follow our simple five-step process to understand, analyze, and improve your website’s SEO performance.
      </p>

      <div className={styles.journeyContainer}>
        {steps.map((s, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={s.id} className={`${styles.stepBlock} ${isCompleted ? styles.completed : ""}`}>
              <div
                className={`${styles.circle} 
                  ${isCompleted ? styles.completed : ""} 
                  ${isActive ? styles.active : ""}`}
              >
                {/* ✅ Restore your check mark for completed steps */}
                {isCompleted ? (
                  <span className={styles.checkMark}>✓</span>
                ) : (
                  <>
                    <div className={styles.stepNumber}>{s.title}</div>
                    <div className={styles.stepText}>{s.label}</div>
                  </>
                )}
              </div>
              <div className={`${styles.label} ${isActive ? styles.labelActive : ""}`}>
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SeoJourney;