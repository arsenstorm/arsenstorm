import { cn } from "cnfast";
import {
	createContext,
	useContext,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Panel } from "./panel.tsx";

const useIsomorphicLayoutEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Generic SVG diagram primitives for write-ups.
 *
 * Compose them inside per-write-up diagram modules — they carry no
 * subject-specific content. Coordinates are authored by hand against the
 * viewBox you pass to <Diagram>; the rendered SVG scales to the column width.
 *
 * Visual language:
 *   - <Box variant="solid">    → filled / emphasised
 *   - <Box variant="outline">  → default, outlined
 *   - <Box variant="dashed">   → muted / tentative
 *   - <Arrow />                → solid line, or dashed for a secondary flow
 */

const STROKE = "stroke-neutral-400 dark:stroke-neutral-600";
const ARROW_FILL = "fill-neutral-400 dark:fill-neutral-600";
const ARROW_LEN = 6;
const FG = "fill-neutral-950 dark:fill-neutral-50";
const MUTED = "fill-neutral-500 dark:fill-neutral-400";

const REGEX_VIEWBOX = /\s+/;

// Dev badge: does the set viewBox match the measured fit, within ±1px?
const VIEWBOX_TOLERANCE = 1;
function viewBoxesMatch(a: string, b: string) {
	const pa = a.trim().split(REGEX_VIEWBOX).map(Number);
	const pb = b.trim().split(REGEX_VIEWBOX).map(Number);
	if (pa.length !== 4 || pb.length !== 4) {
		return false;
	}
	return pa.every((v, i) => Math.abs(v - pb[i]) <= VIEWBOX_TOLERANCE);
}

const DiagramContext = createContext<{ marker: string; pad: number } | null>(
	null
);

function useDiagram() {
	const ctx = useContext(DiagramContext);
	if (!ctx) {
		throw new Error("Diagram primitives must be rendered inside <Diagram>");
	}
	return ctx;
}

/** Returns the `url(#…)` arrowhead marker for the enclosing <Diagram>. */
export function useArrowMarker() {
	return useDiagram().marker;
}

/**
 * Dev-only overlay: the viewBox that would tightly fit `contentRef`'s content,
 * so the authored one can be compared against it.
 */
function FitBadge({
	contentRef,
	viewBox,
	fitPadding,
}: {
	contentRef: React.RefObject<SVGGElement | null>;
	viewBox: string;
	fitPadding: number;
}) {
	const [measured, setMeasured] = useState<string>();

	useIsomorphicLayoutEffect(() => {
		if (!import.meta.env.DEV) {
			return;
		}
		const content = contentRef.current;
		if (!content) {
			return;
		}
		const b = content.getBBox();
		const p = fitPadding;
		const round = (n: number) => Math.round(n);
		setMeasured(
			`${round(b.x - p)} ${round(b.y - p)} ${round(b.width + p * 2)} ${round(b.height + p * 2)}`
		);
	}, [fitPadding, contentRef]);

	if (!(import.meta.env.DEV && measured)) {
		return null;
	}

	return (
		<span
			className={cn(
				"absolute top-1 right-1 rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
				viewBoxesMatch(viewBox, measured)
					? "bg-emerald-600/85 text-white"
					: "bg-neutral-900/80 text-neutral-50"
			)}
		>
			{measured}
		</span>
	);
}

export function Diagram({
	title,
	label,
	viewBox,
	children,
	arrowPad = 8,
	fitPadding = 12,
}: {
	/** Heading shown on the surrounding panel. */
	title: string;
	/** Accessible description of the whole diagram. */
	label: string;
	/** Authoritative coordinate box. Use the dev badge to find the fitted value. */
	viewBox: string;
	children: React.ReactNode;
	/** Default gap left at each arrow end. Set 0 for sequence diagrams. */
	arrowPad?: number;
	/** Margin the dev badge adds around the measured content. */
	fitPadding?: number;
}) {
	const markerId = `diagram-arrow-${useId().replace(/:/g, "")}`;
	const contentRef = useRef<SVGGElement>(null);

	return (
		<Panel title={title}>
			<DiagramContext.Provider
				value={{ marker: `url(#${markerId})`, pad: arrowPad }}
			>
				<div className="relative">
					<svg
						aria-label={label}
						className="h-auto w-full"
						role="img"
						viewBox={viewBox}
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>{label}</title>
						<defs>
							{/* Base anchored at the line end (refX=0); tip extends forward,
							    so the shaft tucks fully under the head — no poke-through. */}
							<marker
								id={markerId}
								markerHeight={6}
								markerUnits="userSpaceOnUse"
								markerWidth={ARROW_LEN}
								orient="auto"
								refX={0}
								refY={3}
							>
								<path
									className={ARROW_FILL}
									d={`M0,0 L${ARROW_LEN},3 L0,6 Z`}
								/>
							</marker>
						</defs>
						<g ref={contentRef}>{children}</g>
					</svg>
					<FitBadge
						contentRef={contentRef}
						fitPadding={fitPadding}
						viewBox={viewBox}
					/>
				</div>
			</DiagramContext.Provider>
		</Panel>
	);
}

type BoxVariant = "solid" | "outline" | "dashed";

const OUTLINE_RECT =
	"fill-neutral-100 stroke-neutral-300 dark:fill-neutral-900 dark:stroke-neutral-700";

const BOX_VARIANTS: Record<
	BoxVariant,
	{ rect: string; label: string; sub: string; dashArray?: string }
> = {
	solid: {
		rect: "fill-neutral-900 dark:fill-neutral-100",
		label: "fill-neutral-50 dark:fill-neutral-900",
		sub: "fill-neutral-400 dark:fill-neutral-500",
	},
	outline: { rect: OUTLINE_RECT, label: FG, sub: MUTED },
	dashed: {
		rect: OUTLINE_RECT,
		label: MUTED,
		sub: MUTED,
		dashArray: "4 3",
	},
};

export function Box({
	x,
	y,
	w,
	h,
	label,
	sub,
	variant = "outline",
}: {
	x: number;
	y: number;
	w: number;
	h: number;
	label: string;
	sub?: string;
	variant?: BoxVariant;
}) {
	const styles = BOX_VARIANTS[variant];

	return (
		<g>
			<rect
				className={styles.rect}
				height={h}
				rx={9}
				strokeDasharray={styles.dashArray}
				strokeWidth={1.25}
				width={w}
				x={x}
				y={y}
			/>
			<text
				className={cn("font-mono", styles.label)}
				dominantBaseline="middle"
				fontSize={12}
				textAnchor="middle"
				x={x + w / 2}
				y={y + h / 2 + (sub ? -4 : 0)}
			>
				{label}
			</text>
			{sub ? (
				<text
					className={styles.sub}
					dominantBaseline="middle"
					fontSize={9.5}
					textAnchor="middle"
					x={x + w / 2}
					y={y + h / 2 + 10}
				>
					{sub}
				</text>
			) : null}
		</g>
	);
}

type LineVariant = "solid" | "dashed";

const DASH_ARRAY: Record<LineVariant, string | undefined> = {
	solid: undefined,
	dashed: "4 3",
};

export function Arrow({
	x1,
	y1,
	x2,
	y2,
	variant = "solid",
	pad,
}: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	variant?: LineVariant;
	/** Gap left at each end. Defaults to the diagram's `arrowPad`. */
	pad?: number;
}) {
	const { marker, pad: defaultPad } = useDiagram();
	const len = Math.hypot(x2 - x1, y2 - y1) || 1;
	const ux = (x2 - x1) / len;
	const uy = (y2 - y1) / len;
	const startOff = Math.min(pad ?? defaultPad, len * 0.3);
	// End the shaft a head-length short so the arrowhead (which extends forward
	// from here) forms the tip; the shaft never reaches past it.
	const endOff = Math.min(startOff + ARROW_LEN, len - 2);
	return (
		<line
			className={STROKE}
			markerEnd={marker}
			strokeDasharray={DASH_ARRAY[variant]}
			strokeWidth={1.5}
			x1={x1 + ux * startOff}
			x2={x2 - ux * endOff}
			y1={y1 + uy * startOff}
			y2={y2 - uy * endOff}
		/>
	);
}

/** An arrowed path with a custom `d` — for self-loops and curved flows. */
export function MarkedPath({
	d,
	variant = "solid",
}: {
	d: string;
	variant?: LineVariant;
}) {
	const marker = useArrowMarker();
	return (
		<path
			className={STROKE}
			d={d}
			fill="none"
			markerEnd={marker}
			strokeDasharray={DASH_ARRAY[variant]}
			strokeWidth={1.5}
		/>
	);
}

type LabelAnchor = "start" | "middle" | "end";

/** Left edge of the knockout rect, per text anchor. */
const LABEL_RECT_X: Record<LabelAnchor, (x: number, w: number) => number> = {
	start: (x) => x - 4,
	middle: (x, w) => x - w / 2,
	end: (x, w) => x - w + 4,
};

const LABEL_TONES = { muted: MUTED, fg: FG } as const;

export function Label({
	x,
	y,
	children,
	anchor = "middle",
	tone = "muted",
}: {
	x: number;
	y: number;
	children: string;
	anchor?: LabelAnchor;
	tone?: keyof typeof LABEL_TONES;
}) {
	const w = children.length * 5.6 + 10;
	return (
		<g>
			{/* Knock out a background behind the text so arrows pass behind it. */}
			<rect
				className="fill-neutral-100 dark:fill-neutral-900"
				height={15}
				rx={3}
				width={w}
				x={LABEL_RECT_X[anchor](x, w)}
				y={y - 11}
			/>
			<text
				className={LABEL_TONES[tone]}
				fontSize={10}
				textAnchor={anchor}
				x={x}
				y={y}
			>
				{children}
			</text>
		</g>
	);
}
