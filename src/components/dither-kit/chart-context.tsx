import type { ScaleLinear } from "d3-scale";
import { createContext, useContext } from "react";
import type { DitherColor, Rgb } from "./palette";

export type ChartConfig = Record<
  string,
  { label?: string; color: DitherColor }
>;

export interface Margins {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export type Row = Record<string, unknown>;

export interface ChartContextValue {
  bands: Record<string, [number, number][]>; // per-series [y0, y1] per row
  // Bar geometry in plot px for category `index`, series `seriesIndex` of
  // `seriesCount`.
  barSlot: (
    index: number,
    seriesIndex: number,
    seriesCount: number
  ) => { x: number; width: number };
  colorOf: (key: string) => Rgb;
  config: ChartConfig;
  configKeys: string[]; // series order — drives stacking and the legend
  cursorX: number;
  data: Row[];
  hoverIndex: number | null;
  isMouseInChart: boolean;
  labelKey: string; // row column that names each category (tooltip, table)
  margins: Margins;
  plot: { width: number; height: number }; // inner drawing area
  ready: boolean; // true once measured (width > 0)
  stacked: boolean;
  xCenter: (index: number) => number; // category centre px within the plot
  y: ScaleLinear<number, number>; // value → px within the plot
}

export const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart(part: string): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) {
    throw new Error(`<${part} /> must be used within <BarChart />.`);
  }
  return ctx;
}
