import React, { useEffect, useState } from "react";
import "../css/Loader.css";

export default function GlobalLoader({ visible = true, partner }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => setFadeOut(true), 400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const primaryColor = partner?.primary_color || "#22354d";

  return (
    <div className={`global-loader ${fadeOut ? "hidden" : ""}`}>
      <div
        className="loader-spinner"
        style={{ borderTopColor: primaryColor }}
      ></div>
    </div>
  );
}