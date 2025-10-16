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
    "login",
    "register",
    "partner-dashboard",
    "partner-settings",
    "partner-leads",
    "admin-dashboard",
    "admin-partners",
    "admin-leads",
    "admin-settings",
  ];

  useEffect(() => {
    const isPublic = firstSegment && !knownRoutes.includes(firstSegment);
    setIsPartnerPublic(isPublic);

    // ✅ If admin route — skip everything related to partner theme
    if (firstSegment.startsWith("admin")) {
      document.documentElement.style.setProperty("--primary-color", "");
      document.documentElement.style.setProperty("--secondary-color", "");
      setPartnerData(null);
      return;
    }

    // ✅ Only fetch partner data if it's a public partner page
    if (isPublic) {
      document.body.classList.add("partner-theme");
      
      const fetchPartner = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/partners/${firstSegment}`);
          if (!res.ok) throw new Error("Partner not found");

          const data = await res.json();
          setPartnerData(data);

          // ✅ Apply colors to document
          const primary = data.primary_color || DEFAULT_COLORS.primary;
          const secondary = data.secondary_color || DEFAULT_COLORS.secondary;

          document.documentElement.style.setProperty("--primary-color", primary);
          document.documentElement.style.setProperty("--secondary-color", secondary);
        } catch (err) {
          console.warn("⚠️ Failed to load partner:", err);
          setPartnerData(null);
          document.documentElement.style.setProperty("--primary-color", "");
          document.documentElement.style.setProperty("--secondary-color", "");
        }
      };

      fetchPartner();
    } else {
      // ✅ Reset theme on non-partner pages
      setPartnerData(null);
      document.documentElement.style.setProperty("--primary-color", "");
      document.documentElement.style.setProperty("--secondary-color", "");
    }
  }, [firstSegment, API_BASE_URL]);

  return { partnerData, isPartnerPublic };
}
