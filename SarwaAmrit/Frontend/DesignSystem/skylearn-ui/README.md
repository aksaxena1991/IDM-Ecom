# @skylearn/ui — SkyLearn Design System

K–8 edtech React component library: dyslexia-friendly type, warm sky/sun/leaf palette, 56px tap targets, Storybook docs.

## Develop

```bash
cd SarwaAmrit/Frontend/DesignSystem/skylearn-ui
npm install
npm run storybook   # http://localhost:6008
npm run build       # library → dist/
npm run typecheck
```

## Use in an app

```tsx
import '@skylearn/ui/styles.css';
import { ThemeProvider, LessonCard, BigFriendlyButton } from '@skylearn/ui';

export function App() {
  return (
    <ThemeProvider>
      <LessonCard title="Fractions" description="Parts of a whole" progress={30} />
      <BigFriendlyButton>Start</BigFriendlyButton>
    </ThemeProvider>
  );
}
```

## Accessibility toggles

`ThemeProvider` supports high contrast, reduced motion, and parent/teacher density via `useSkyLearnTheme()`.

Storybook docs: **Overview**, **Voice & tone**, **Accessibility**, **Do's and Don'ts**, **Foundations** (elevation/spacing), **Iconography**, plus component stories for `Modal`, `EmptyState`, and the learning UI set.

Optional **`AccessibilityToolbar`** in apps mirrors Storybook toggles (high contrast, reduced motion, parent view).

### Data visualization

Storybook sidebar **SkyLearn → Data Visualization** includes: AreaChart, BarChart, CandleChart, ChartTooltip, ConnectionMapChart, DensityMapChart, DonutChart, FunnelChart, GanttChart, GaugeChart, HeatMapChart, HistogramChart, LineChart, Map, PieChart, PinMapChart, RadarChart, RadialChart, RangeAreaChart, RouteMapChart, ScatterPlotChart, TableChart, VennDiagramChart.

```tsx
import { BarChart, SKYLEARN_CHART_COLORS } from '@skylearn/ui';
```
