import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_COLORS = {
  primary: "",
  secondary: "",
  accent: "",
};

export default function usePartnerTheme(
  API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"
) {
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

    // 🧹 Skip partner theme on backend/system paths
    if (
      firstSegment.startsWith("api") ||
      firstSegment.startsWith("clear") ||
      firstSegment.startsWith("reset") ||
      firstSegment.startsWith("favicon") ||
      firstSegment.startsWith("admin")
    ) {
      setPartnerData(null);
      document.documentElement.style.setProperty("--primary-color", "");
      document.documentElement.style.setProperty("--secondary-color", "");
      document.documentElement.style.setProperty("--accent-color", "");
      return; // ✅ stop early
    }

    // ✅ If admin route — skip theme entirely
    // if (firstSegment.startsWith("admin")) {
    //   document.documentElement.style.setProperty("--primary-color", "");
    //   document.documentElement.style.setProperty("--secondary-color", "");
    //   document.documentElement.style.setProperty("--accent-color", "");
    //   setPartnerData(null);
    //   return;
    // }

    // ✅ Only run on public partner pages
    if (isPublic) {
      document.body.classList.add("partner-theme");

      const fetchPartner = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/partners/${firstSegment}`);

          // ✅ Gracefully handle 404 (deleted/inactive)
          if (res.status === 404) {
            // Don’t throw — just reset colors quietly
            setPartnerData(null);
            document.documentElement.style.setProperty("--primary-color", "");
            document.documentElement.style.setProperty("--secondary-color", "");
            document.documentElement.style.setProperty("--accent-color", "");
            return; // stop here silently
          }

          // ✅ Handle other server errors (400–599)
          if (!res.ok) {
            console.warn("⚠️ Partner theme fetch returned:", res.status);
            setPartnerData(null);
            document.documentElement.style.setProperty("--primary-color", "");
            document.documentElement.style.setProperty("--secondary-color", "");
            document.documentElement.style.setProperty("--accent-color", "");
            return;
          }

          const data = await res.json();
          setPartnerData(data);

          // ✅ Apply colors to document
          const primary = data.primary_color || DEFAULT_COLORS.primary;
          const secondary = data.secondary_color || DEFAULT_COLORS.secondary;
          const accent = data.accent_color || DEFAULT_COLORS.accent;
          document.documentElement.style.setProperty("--primary-color", primary);
          document.documentElement.style.setProperty("--secondary-color", secondary);
          document.documentElement.style.setProperty("--accent-color", accent);
        } catch (err) {
          // ✅ Silent catch for network errors
          if (!String(err).includes("Partner not found")) {
            console.warn("⚠️ Partner theme fetch failed:", err);
          }
          setPartnerData(null);
          document.documentElement.style.setProperty("--primary-color", "");
          document.documentElement.style.setProperty("--secondary-color", "");
          document.documentElement.style.setProperty("--accent-color", "");
        }
      };

      fetchPartner();
    } else {
      // ✅ Reset colors when leaving partner pages
      setPartnerData(null);
      document.documentElement.style.setProperty("--primary-color", "");
      document.documentElement.style.setProperty("--secondary-color", "");
      document.documentElement.style.setProperty("--accent-color", "");
    }
  }, [firstSegment, API_BASE_URL]);

  return { partnerData, isPartnerPublic };
}