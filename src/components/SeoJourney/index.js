import React from "react";
import styles from "./SeoJourney.module.css";

function SeoJourney({ step }) {
  const steps = [
    { id: "enter", label: "Enter Website" },
    { id: "scanning", label: "Analyzing Website" },
    { id: "form", label: "Submit Form" },
    { id: "get-report", label: "Get Full Report" }, // ✅ new step
    { id: "done", label: "Done" },
  ];

  const stepOrder = steps.map((s) => s.id);
  let currentIndex = stepOrder.indexOf(step);

  // Handle "results" alias → map to last step before done
  if (step === "results") currentIndex = steps.length - 1;

  return (
    <div className={styles.journeyContainer}>
      {steps.map((s, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <div
            key={s.id}
            className={`${styles.stepBlock} ${
              isCompleted ? styles.completed : ""
            }`}
          >
            <div
              className={`${styles.circle} 
                ${isCompleted ? styles.completed : ""} 
                ${isActive ? styles.active : ""}`}
            >
              {isCompleted ? "✓" : `Step ${idx + 1}`}
            </div>
            <div
              className={`${styles.label} ${
                isActive ? styles.labelActive : ""
              }`}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SeoJourney;
