// src/components/PartnerHelmet.js
import React from "react";
import { Helmet } from "react-helmet-async";

export default function PartnerHelmet({ partner }) {
  const hasPartner = Boolean(partner);

  // DEFAULTS
  const defaultTitle =
    "Free SEO Audit Tool | Analyse Your Website Instantly | SEO Mojo by Web Design Davao";

  const defaultDescription =
    "Run a free SEO audit with SEO Mojo. Discover what’s stopping your site from ranking higher and get a custom action plan in under a minute. Powered by Web Design Davao.";

  const defaultOgTitle = "SEO Mojo";
  const defaultOgImage = "/seo-logo.png";
  const defaultFavicon = "/seo-icon.png";

  // PARTNER VALUES (if present)
  const title = hasPartner
    ? `Free SEO Audit Tool | Analyse Your Website Instantly | ${partner.company_name}`
    : defaultTitle;

  const description = hasPartner
    ? `Run a free SEO audit with ${partner.company_name}. Discover what’s stopping your site from ranking higher and get a custom action plan in under a minute. Powered by Web Design Davao.`
    : defaultDescription;

  const ogTitle = hasPartner ? partner.company_name : defaultOgTitle;

  const ogImage = hasPartner
    ? partner.logo_url || defaultOgImage
    : defaultOgImage;

  const favicon = hasPartner
    ? partner.logo_url || defaultFavicon
    : defaultFavicon;

  return (
    <Helmet>
      {/* TITLE */}
      <title>{title}</title>

      {/* FAVICON  */}
      <link rel="icon" type="image/png" href={favicon} />

      {/* DESCRIPTION */}
      <meta name="description" content={description} />

      {/* OG TAGS */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:image" content={ogImage} />
      <meta
        property="og:description"
        content="Run your free SEO audit instantly and get AI-powered insights."
      />
    </Helmet>
  );
}