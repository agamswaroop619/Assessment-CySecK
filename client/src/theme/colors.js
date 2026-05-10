const DEFAULTS = Object.freeze({
  ratingGood: "#9BCFA7",
  ratingOk: "#F2CFA4",
  ratingBad: "#F4B6C2",
  chartGrid: "#ece8ff",
  chartXAxis: "#64748b",
  chartYAxis: "#475569",
  chartLabel: "#334155"
});

export const CSS_VARS = Object.freeze({
  ratingGood: "--color-rating-good",
  ratingOk: "--color-rating-ok",
  ratingBad: "--color-rating-bad",
  chartGrid: "--color-chart-grid",
  chartXAxis: "--color-chart-xaxis",
  chartYAxis: "--color-chart-yaxis",
  chartLabel: "--color-chart-label"
});

export function getCssColor(varName, fallback) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

export function getRatingColor(score) {
  if (score >= 4) return getCssColor(CSS_VARS.ratingGood, DEFAULTS.ratingGood);
  if (score >= 3) return getCssColor(CSS_VARS.ratingOk, DEFAULTS.ratingOk);
  return getCssColor(CSS_VARS.ratingBad, DEFAULTS.ratingBad);
}

export function getChartTheme() {
  return {
    grid: getCssColor(CSS_VARS.chartGrid, DEFAULTS.chartGrid),
    xAxis: getCssColor(CSS_VARS.chartXAxis, DEFAULTS.chartXAxis),
    yAxis: getCssColor(CSS_VARS.chartYAxis, DEFAULTS.chartYAxis),
    label: getCssColor(CSS_VARS.chartLabel, DEFAULTS.chartLabel)
  };
}
