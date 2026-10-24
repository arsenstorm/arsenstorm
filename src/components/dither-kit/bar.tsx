import { type ReactNode, useCallback, useEffect } from "react";
import {
	type AreaVariant,
	type StrokeVariant,
	useChartPart,
} from "./chart-context";
import type { DitherColor } from "./palette";
import { SeriesContext } from "./series-context";

export interface BarProps {
	children?: ReactNode;
	// Per-datum colour overrides, keyed by data index.
	colors?: Partial<Record<number, DitherColor>>;
	dataKey: string;
	isClickable?: boolean;
	strokeVariant?: StrokeVariant;
	variant?: AreaVariant;
}

/**
 * One bar series. The dithered bars are painted on the canvas; this registers
 * the series and (when `isClickable`) lays transparent hit rects over each bar
 * — using the shared `barSlot` geometry so clicks line up with the pixels — to
 * select the series. The Legend offers the same toggle accessibly.
 */
export function Bar({
	dataKey,
	variant = "gradient",
	strokeVariant = "solid",
	isClickable = false,
	colors,
	children,
}: BarProps) {
	const ctx = useChartPart("Bar", "bar");
	const { registerSeries, unregisterSeries } = ctx;

	if (process.env.NODE_ENV !== "production" && !ctx.config[dataKey]) {
		console.warn(
			`<Bar dataKey="${dataKey}" />: "${dataKey}" is not in the chart \`config\`. Add it so the series has a colour and label.`
		);
	}

	useEffect(() => {
		registerSeries({ colors, dataKey, kind: "bar", strokeVariant, variant });
		return () => unregisterSeries(dataKey);
	}, [
		dataKey,
		variant,
		strokeVariant,
		colors,
		registerSeries,
		unregisterSeries,
	]);

	const { selectDataKey, selectedDataKey } = ctx;
	const onClick = useCallback(
		() => selectDataKey(selectedDataKey === dataKey ? null : dataKey),
		[selectDataKey, selectedDataKey, dataKey]
	);

	const band = ctx.bands[dataKey];
	if (!(ctx.ready && band)) {
		return null;
	}

	const seed = ctx.seedOf(dataKey);
	const dimmed =
		ctx.selectedDataKey !== null && ctx.selectedDataKey !== dataKey;
	const si = ctx.configKeys.indexOf(dataKey);
	const n = ctx.configKeys.length;

	return (
		<>
			{isClickable
				? band.map((b, i) => {
						const slot = ctx.barSlot(i, si, n);
						const top = ctx.y(b[1]);
						const base = ctx.y(b[0]);
						return (
							// biome-ignore lint/a11y/noStaticElementInteractions: progressive enhancement; the Legend offers the same toggle accessibly
							<rect
								fill="transparent"
								height={Math.abs(base - top)}
								// biome-ignore lint/suspicious/noArrayIndexKey: index is the stable category position
								key={i}
								onClick={onClick}
								style={{ cursor: "pointer" }}
								width={slot.width}
								x={slot.x}
								y={Math.min(top, base)}
							/>
						);
					})
				: null}
			<SeriesContext value={{ dataKey, dimmed, seed }}>
				{children}
			</SeriesContext>
		</>
	);
}
