"use client";

import { useChart } from "./chart-context";

const TICK_COUNT = 4;
const TICK_MARGIN = 8;

export function YAxis() {
  const ctx = useChart("YAxis");
  if (!ctx.ready) {
    return null;
  }

  return (
    <g className="fill-current font-mono text-[10px] text-muted-foreground">
      {ctx.y.ticks(TICK_COUNT).map((t) => (
        <text
          dominantBaseline="central"
          fill="currentColor"
          key={t}
          textAnchor="end"
          x={-TICK_MARGIN}
          y={ctx.y(t)}
        >
          {String(t)}
        </text>
      ))}
    </g>
  );
}
