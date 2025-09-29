import React from "react";
import styles from "./SeoJourney.module.css";

function SeoJourney({ step }) {
  const steps = [
    { id: "enter", label: "Enter Website" },
    { id: "scanning", label: "Scanning" },
    { id: "form", label: "Submit Form" },
    { id: "results", label: "View Results" },
    { id: "report", label: "Get Report" },
  ];

  const stepOrder = steps.map((s) => s.id);
  let currentIndex = stepOrder.indexOf(step);

  // ✅ If done, force last step as completed
  if (step === "done") currentIndex = steps.length;

  return (
    <div className={styles.journeyContainer}>
      {/* ✅ Professional Label */}
      <div className={styles.journeyHeader}>
        <h3>SEO Audit Journey</h3>
        <p className={styles.journeySubtitle}>
          Track your progress step by step
        </p>
      </div>
      
      {steps.map((s, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex && step !== "done";

        return (
          <div key={s.id} className={styles.stepWrapper}>
            <div
              className={`${styles.circle} 
                ${isCompleted ? styles.completed : ""} 
                ${isActive ? styles.active : ""}`}
            >
              {isCompleted ? "✓" : idx + 1}
            </div>
            <span
              className={`${styles.label} ${
                isActive ? styles.labelActive : ""
              }`}
            >
              {s.label}
            </span>

            {/* Vertical connector */}
            {idx < steps.length - 1 && (
              <div
                className={`${styles.connector} ${
                  isCompleted ? styles.connectorCompleted : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SeoJourney;
