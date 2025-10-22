import React, { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react"; // optional
import "../css/Loader.css";

export default function GlobalLoader({ partner }) {
  const [fadeOut, setFadeOut] = useState(false);

  // Extract brand colors
  const primary = partner?.primary_color;
  const secondary = partner?.secondary_color;

  // ✅ Use partner logo or fallback to /seo-logo.png
  const logo = partner?.logo_url || "/seo-logo.png";

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`global-loader ${fadeOut ? "hidden" : ""}`}
      style={{ background: secondary }}
    >
      <img
        src={logo}
        alt="Brand Logo"
        className="loader-logo"
        onError={(e) => (e.target.src = "/seo-logo.png")} // fallback if broken
      />

      <div
        className="loader-spinner"
        style={{ borderTopColor: primary }}
      ></div>

      <p style={{ color: primary }}>Preparing your SEO Audit...</p>
    </div>
  );
}
