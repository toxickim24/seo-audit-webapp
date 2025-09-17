export async function fetchSeoPerformance(url) {
  const apiKey = process.env.REACT_APP_PAGESPEED_KEY;
  if (!apiKey) throw new Error("⚠️ Missing PageSpeed API key");

  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${apiKey}&strategy=mobile`;

  const psiRes = await fetch(psiUrl);
  if (!psiRes.ok) throw new Error("Failed to fetch PageSpeed data");

  const psiData = await psiRes.json();
  console.log("✅ Full PSI Data:", psiData); // 👈 add this

  const lighthouse = psiData.lighthouseResult;
  const performanceScore = lighthouse?.categories?.performance?.score;

  return {
    score:
      performanceScore !== undefined
        ? Math.round(performanceScore * 100)
        : null,
    fcp: lighthouse?.audits["first-contentful-paint"]?.numericValue,
    lcp: lighthouse?.audits["largest-contentful-paint"]?.numericValue,
    tti: lighthouse?.audits["interactive"]?.numericValue,
    speedIndex: lighthouse?.audits["speed-index"]?.numericValue,
    tbt: lighthouse?.audits["total-blocking-time"]?.numericValue,
    cls: lighthouse?.audits["cumulative-layout-shift"]?.numericValue,
    fid: lighthouse?.audits["max-potential-fid"]?.numericValue,
    opportunities: Object.values(lighthouse?.audits || {})
      .filter((a) => a.details?.type === "opportunity")
      .map((a) => ({
        title: a.title,
        savingsMs: a.details.overallSavingsMs,
      })),
  };
}