import React from "react";
import styles from "./SeoJourney.module.css";

function SeoJourney({ step }) {
  const steps = [
    { id: "enter", title: "01.", label: "Enter Website", desc: "Type your website URL and start the audit.", img: "/enter-website.png" },
    { id: "scanning", title: "02.", label: "Analyze Website", desc: "Our system scans your site’s structure and data.", img: "/analyze-website.png" },
    { id: "form", title: "03.", label: "Submit Form", desc: "Fill in your contact details to receive your full report.", img: "/submit-form.png" },
    { id: "get-report", title: "04.", label: "Get Full Report", desc: "Review your detailed insights and SEO recommendations.", img: "/get-full-report.png" },
    { id: "done", title: "05.", label: "All Done!", desc: "Receive your branded PDF report, ready to share or present.", img: "/all-done.png" },
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
            <div key={s.id} className={`${styles.stepCard} ${isCompleted ? styles.completedCard : ""}`}>
              <div className={styles.iconWrap}>
                <img src={isCompleted ? "/done.png" : s.img} alt={s.label} className={styles.iconImg} />
              </div>

              <div className={styles.stepNumber}>{s.title}</div>
              <div className={styles.stepTitle}>{s.label}</div>
              <p className={styles.stepDesc}>{s.desc}</p>

              {/* Orange bar on completed steps */}
              {isCompleted && <div className={styles.orangeBar}></div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SeoJourney;
