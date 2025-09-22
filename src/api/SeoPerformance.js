const API_KEY = process.env.REACT_APP_PAGESPEED_KEY;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

if (!API_KEY) throw new Error("⚠️ Missing PageSpeed API key");

function getCacheKey(url, strategy) {
  return `seo-perf-${strategy}-${url}`;
}

function getCachedResult(url, strategy) {
  const key = getCacheKey(url, strategy);
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  const expired = Date.now() - parsed.time > CACHE_TTL;

  if (expired) {
    localStorage.removeItem(key);
    return null;
  }
  return parsed.data;
}

function setCacheResult(url, strategy, data) {
  const key = getCacheKey(url, strategy);
  localStorage.setItem(
    key,
    JSON.stringify({ time: Date.now(), data })
  );
}

async function fetchStrategy(url, strategy = "mobile") {
  // Check cache first
  const cached = getCachedResult(url, strategy);
  if (cached) {
    return cached;
  }

  // Call API if not cached
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${API_KEY}&strategy=${strategy}&category=performance`;

  const psiRes = await fetch(psiUrl);
  if (!psiRes.ok) throw new Error(`Failed to fetch PageSpeed data (${strategy})`);

  const psiData = await psiRes.json();
  const lighthouse = psiData.lighthouseResult;
  if (!lighthouse) return null;

  const categories = lighthouse.categories || {};
  const performanceScore = categories.performance?.score;

  const parsed = {
    strategy,
    score:
      performanceScore !== undefined
        ? Math.round(performanceScore * 100)
        : null,
    fcp: lighthouse.audits["first-contentful-paint"]?.numericValue,
    lcp: lighthouse.audits["largest-contentful-paint"]?.numericValue,
    tti: lighthouse.audits["interactive"]?.numericValue,
    speedIndex: lighthouse.audits["speed-index"]?.numericValue,
    tbt: lighthouse.audits["total-blocking-time"]?.numericValue,
    cls: lighthouse.audits["cumulative-layout-shift"]?.numericValue,
    fid: lighthouse.audits["max-potential-fid"]?.numericValue,
    opportunities: Object.values(lighthouse.audits || {})
      .filter((a) => a.details?.type === "opportunity")
      .map((a) => ({
        title: a.title,
        savingsMs: a.details.overallSavingsMs,
      })),
  };

  // Save to cache
  setCacheResult(url, strategy, parsed);

  return parsed;
}

// 🚀 Main function: fetch both Desktop & Mobile in parallel
export async function fetchSeoPerformance(url) {
  try {
    const [desktop, mobile] = await Promise.all([
      fetchStrategy(url, "desktop"),
      fetchStrategy(url, "mobile"),
    ]);
    return { desktop, mobile };
  } catch (err) {
    console.error("❌ SeoPerformance fetch error:", err);
    return { desktop: null, mobile: null };
  }
}
