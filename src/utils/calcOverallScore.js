export function getOverallScore(seoData, pageSpeed) {
  if (!seoData || typeof seoData !== "object") {
    console.warn("⚠️ getOverallScore called with invalid seoData");
    return 0;
  }

  // Extract scores safely
  const onpageScore = seoData.onpage?.overview?.score ?? 0;
  const technicalScore = seoData.technicalSeo?.overview?.score ?? 0;
  const contentScore = seoData.contentSeo?.overview?.score ?? 0;
  const performanceScore = typeof pageSpeed === "number" ? pageSpeed : 0;

  // Build score array
  const scores = [onpageScore, technicalScore, contentScore, performanceScore];

  // Filter out 0 values only if *all* are 0, otherwise include them in average
  const validScores = scores.filter((s) => typeof s === "number" && s >= 0);

  if (validScores.length === 0) return 0;

  // Calculate average and round
  const total = validScores.reduce((sum, val) => sum + val, 0);
  const avg = total / validScores.length;

  return Math.round(avg);
}