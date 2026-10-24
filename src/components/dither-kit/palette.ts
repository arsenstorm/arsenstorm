export type Rgb = [number, number, number];

export type DitherColor = "blue" | "green" | "grey" | "red";

// One fill hue per colour; the dither varies only its opacity.
export const PALETTE: Record<DitherColor, Rgb> = {
  blue: [53, 143, 243],
  green: [40, 210, 110],
  // For "everything else" buckets: a muted grey that reads as secondary.
  grey: [92, 92, 100],
  red: [240, 70, 70],
};

export const rgb = ([r, g, b]: Rgb, k = 1, a = 1) =>
  `rgba(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)},${a})`;
