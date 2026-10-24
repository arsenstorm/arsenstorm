import { useChart } from "./chart-context";

/** Horizontal dashed grid lines at the y-axis ticks. */
export function Grid() {
  const ctx = useChart("Grid");
  if (!ctx.ready) {
    return null;
  }
  const { width } = ctx.plot;

  return (
    <g className="stroke-border" strokeDasharray="3 3">
      {ctx.y.ticks(4).map((t) => (
        <line key={`h-${t}`} x1={0} x2={width} y1={ctx.y(t)} y2={ctx.y(t)} />
      ))}
    </g>
  );
}

// Render beneath the dither canvas so grid lines sit behind the fill.
Grid.chartLayer = "back" as const;
