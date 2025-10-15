import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_COLORS = {
  primary: "",
  secondary: "",
};

export default function usePartnerTheme(API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000") {
  const location = useLocation();
  const firstSegment = location.pathname.split("/")[1] || "";
  const [partnerData, setPartnerData] = useState(null);
  const [isPartnerPublic, setIsPartnerPublic] = useState(false);

  const knownRoutes = [
    "",
    "seo-audit",
    "seo-pricing",
    "seo-tools",
    "seo-contact",
    "leads-management",
    "partner-login",
    "partner-register",
    "partner-dashboard",
    "partner-settings",
    "partner-leads",
  ];

  useEffect(() => {
    const isPublic = firstSegment && !knownRoutes.includes(firstSegment);
    setIsPartnerPublic(isPublic);

    const applyColors = (primary, secondary) => {
      document.documentElement.style.setProperty("--primary-color", primary);
      document.documentElement.style.setProperty("--secondary-color", secondary);
    };

    if (isPublic) {
      document.body.classList.add("partner-theme");

      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/partners/${firstSegment}`);
          if (!res.ok) throw new Error("Partner not found");
          const data = await res.json();
          setPartnerData(data);

          applyColors(
            data.primary_color || DEFAULT_COLORS.primary,
            data.secondary_color || DEFAULT_COLORS.secondary
          );
        } catch (err) {
          console.error("⚠️ Failed to load partner:", err);
          setPartnerData(null);
          applyColors(DEFAULT_COLORS.primary, DEFAULT_COLORS.secondary);
        }
      })();
    } else {
      document.body.classList.remove("partner-theme");
      setPartnerData(null);
      applyColors(DEFAULT_COLORS.primary, DEFAULT_COLORS.secondary);
    }
  }, [firstSegment]);

  return { partnerData, isPartnerPublic };
}
