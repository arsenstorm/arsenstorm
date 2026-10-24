import {
	Children,
	isValidElement,
	type ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";
import { BarCanvas } from "./bar-canvas";
import {
	type ChartConfig,
	ChartContext,
	type ChartContextValue,
	type Margins,
	type Row,
} from "./chart-context";
import { PALETTE } from "./palette";
import {
	buildBandScale,
	buildYScale,
	computeBands,
	indexAtBand,
} from "./scales";
import { useChartDimensions } from "./use-chart-dimensions";

const MARGINS: Margins = {
	bottom: 22,
	left: 36,
	right: 12,
	top: 10,
};

/** One absolutely-positioned SVG layer, its contents shifted into the plot rect.
 * Hidden from assistive tech: the chart's table carries the data. */
function Layer({
	children,
	height,
	width,
}: {
	children: ReactNode;
	height: number;
	width: number;
}) {
	return (
		<svg
			aria-hidden="true"
			className="absolute inset-0 overflow-visible"
			height={height}
			width={width}
		>
			<g transform={`translate(${MARGINS.left},${MARGINS.top})`}>{children}</g>
		</svg>
	);
}

/** The chart's values as a table for screen readers, and for anyone without
 * JavaScript: the canvas, axes and tooltip are all visual only. */
function DataTable({
	config,
	configKeys,
	data,
	labelKey,
}: {
	config: ChartConfig;
	configKeys: string[];
	data: Row[];
	labelKey: string;
}) {
	return (
		<table className="sr-only">
			<thead>
				<tr>
					<th scope="col">
						{labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}
					</th>
					{configKeys.map((key) => (
						<th key={key} scope="col">
							{config[key]?.label ?? key}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row) => {
					const label = String(row[labelKey] ?? "");
					return (
						<tr key={label}>
							<th scope="row">{label}</th>
							{configKeys.map((key) => {
								const value = row[key];
								return (
									<td key={key}>
										{(typeof value === "number" ? value : 0).toLocaleString(
											"en-GB"
										)}
									</td>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}

/** Which render layer a composed part targets — defaults to the front SVG. */
function layerOf(node: ReactNode): "back" | "dom" | "svg" {
	if (!isValidElement(node) || typeof node.type === "string") {
		return "svg";
	}
	return (node.type as { chartLayer?: "back" | "dom" }).chartLayer ?? "svg";
}

/**
 * Dither bar chart. Paints one bar series per `config` key, grouped side by side
 * or `stacked`. Grid sits behind the dither canvas; axes, legend and tooltip are
 * composed as children on top.
 */
// `object` rather than `Record<string, unknown>`: interfaces don't get an
// implicit index signature, so interface-typed rows failed to satisfy the
// generic.
export function BarChart<TData extends object>({
	children,
	config,
	data: rows,
	labelKey,
	stacked = false,
}: {
	children: ReactNode;
	config: ChartConfig;
	data: TData[];
	/** The row field that names each category, e.g. "month". */
	labelKey: string;
	stacked?: boolean;
}) {
	// Safe: the chart only reads row[key] for configured keys and label keys.
	const data = rows as Row[];
	const { ref, size } = useChartDimensions<HTMLDivElement>();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [cursorX, setCursorX] = useState(0);
	const [isMouseInChart, setMouseInChart] = useState(false);

	const plotWidth = Math.max(0, size.width - MARGINS.left - MARGINS.right);
	const plotHeight = Math.max(0, size.height - MARGINS.top - MARGINS.bottom);
	const ready = plotWidth > 0 && plotHeight > 0;

	const configKeys = useMemo(() => Object.keys(config), [config]);
	const { bands, max, min } = useMemo(
		() => computeBands(data, configKeys, stacked),
		[data, configKeys, stacked]
	);
	const xBand = useMemo(
		() => buildBandScale(data.length, plotWidth),
		[data.length, plotWidth]
	);
	const y = useMemo(
		() => buildYScale(min, max, plotHeight),
		[min, max, plotHeight]
	);
	const bandwidth = xBand.bandwidth();
	const xCenter = useCallback(
		(i: number) => (xBand(i) ?? 0) + xBand.bandwidth() / 2,
		[xBand]
	);
	const barSlot = useCallback(
		(i: number, si: number, n: number) => {
			const center = xCenter(i);
			if (stacked) {
				const w = bandwidth * 0.9;
				return { width: w, x: center - w / 2 };
			}
			const slot = bandwidth / Math.max(n, 1);
			return {
				width: slot * 0.84,
				x: center - bandwidth / 2 + si * slot + slot * 0.08,
			};
		},
		[xCenter, stacked, bandwidth]
	);
	const colorOf = useCallback(
		(key: string) => PALETTE[config[key]?.color ?? "grey"],
		[config]
	);

	// Memoized so consumers re-render only when something they read changes.
	const ctx = useMemo<ChartContextValue>(
		() => ({
			bands,
			barSlot,
			colorOf,
			config,
			configKeys,
			cursorX,
			data,
			hoverIndex,
			isMouseInChart,
			labelKey,
			margins: MARGINS,
			plot: { height: plotHeight, width: plotWidth },
			ready,
			stacked,
			xCenter,
			y,
		}),
		[
			bands,
			barSlot,
			colorOf,
			config,
			configKeys,
			cursorX,
			data,
			hoverIndex,
			isMouseInChart,
			labelKey,
			plotHeight,
			plotWidth,
			ready,
			stacked,
			xCenter,
			y,
		]
	);

	const backChildren: ReactNode[] = [];
	const svgChildren: ReactNode[] = [];
	const domChildren: ReactNode[] = [];
	Children.forEach(children, (child) => {
		const layer = layerOf(child);
		if (layer === "back") {
			backChildren.push(child);
		} else if (layer === "dom") {
			domChildren.push(child);
		} else {
			svgChildren.push(child);
		}
	});

	const onPointerEnter = useCallback(() => setMouseInChart(true), []);
	const onPointerLeave = useCallback(() => {
		setMouseInChart(false);
		setHoverIndex(null);
	}, []);
	const onPointerMove = useCallback(
		(event: { clientX: number }) => {
			const el = ref.current;
			if (!el) {
				return;
			}
			const rect = el.getBoundingClientRect();
			const px = event.clientX - rect.left - MARGINS.left;
			setHoverIndex(indexAtBand(px, data.length, plotWidth));
			setCursorX(event.clientX - rect.left);
		},
		[ref, data.length, plotWidth]
	);

	return (
		<ChartContext value={ctx}>
			<div
				className="relative h-full w-full"
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				onPointerMove={onPointerMove}
				ref={ref}
			>
				<DataTable
					config={config}
					configKeys={configKeys}
					data={data}
					labelKey={labelKey}
				/>
				{ready && backChildren.length > 0 ? (
					<Layer height={size.height} width={size.width}>
						{backChildren}
					</Layer>
				) : null}
				<BarCanvas />
				{ready ? (
					<Layer height={size.height} width={size.width}>
						{svgChildren}
					</Layer>
				) : null}
				{domChildren}
			</div>
		</ChartContext>
	);
}
