const API_KEY = process.env.REACT_APP_PAGESPEED_KEY;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

if (!API_KEY) throw new Error("⚠️ Missing PageSpeed API key");

function getCacheKey(url, strategy) {
  return `seoPerformance:${url}:${strategy}`;
}

function getCachedResult(url, strategy) {
  const key = getCacheKey(url, strategy);
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    // Remove cache expiry temporarily
    // const expired = Date.now() - parsed.time > CACHE_TTL;
    // if (expired) {
    //   localStorage.removeItem(key);
    //   return null;
    // }
    return parsed.data;
  } catch {
    localStorage.removeItem(key); // corrupted data
    return null;
  }
}

function setCacheResult(url, strategy, data) {
  const key = getCacheKey(url, strategy);
  localStorage.setItem(
    key,
    JSON.stringify({ time: Date.now(), data })
  );
}

export async function fetchSeoPerformance(url, strategy = "mobile") {
  // ✅ Try cache first
  const cached = getCachedResult(url, strategy);
  if (cached) return cached;

  // 🌐 Fetch fresh data
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

  const result = {
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

  // 💾 Save to cache
  setCacheResult(url, strategy, result);

  return result;
}
