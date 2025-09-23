export const getOverallSpeedScore = (desktopScore, mobileScore) => {
  if (desktopScore == null || mobileScore == null) return null;
  return Math.round((desktopScore + mobileScore) / 2);
};