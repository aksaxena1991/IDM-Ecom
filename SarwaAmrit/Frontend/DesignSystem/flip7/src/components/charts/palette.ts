export const CHART_COLORS = ['#2BA8A2', '#FFD23F', '#EF6C4A', '#5DADE2', '#1E8C86', '#E6B800'];

export function chartColor(index: number, override?: string) {
  return override || CHART_COLORS[index % CHART_COLORS.length];
}
