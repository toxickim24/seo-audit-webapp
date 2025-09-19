import { useState, useEffect } from "react";

const AnimatedProgress = ({ score, maxScore = 100, label, duration = 3000 }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = score / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < score) {
        setDisplayScore(Math.round(start));
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(score);
      }
    };

    animate();
  }, [score, duration]);

  return (
    <div className="seo-score-box">
      <h3>
        {label}: {displayScore}%
      </h3>
      <div className="progress-container">
        <div
          className="progress-fill"
          style={{ width: `${(displayScore / maxScore) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AnimatedProgress;
