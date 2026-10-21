import type { CSSProperties } from "react";
import { OG_ICONS, type OgIconName } from "./og-icons";

const CENTER_X = 600;
const CENTER_Y = 315;
const ICON_COUNT = 14;
// The ring the icons sit on: just outside the title block, and far enough
// from the canvas edges that drift and icon size never reach them.
const RING_RADIUS_X = 470;
const RING_RADIUS_Y = 220;
const RING_SAMPLES = 720;
// A superellipse rather than an ellipse: the diagonals sit further out, so
// icons there clear long titles and descriptions.
const RING_SQUARENESS = 3;
const MIN_ICON_SIZE = 32;
const ICON_SIZE_RANGE = 12;
const MIN_DRIFT_RADIUS = 3;
const DRIFT_RADIUS_RANGE = 2;
const LOOP_SECONDS = 5;

type Point = readonly [number, number];

function squarify(value: number): number {
	return Math.sign(value) * Math.abs(value) ** (2 / RING_SQUARENESS);
}

// Sampled once so icons can be spaced by distance along the ring. Spacing by
// angle bunches them up at the left and right ends of the ellipse.
const RING_POINTS: Point[] = Array.from(
	{ length: RING_SAMPLES + 1 },
	(_, index) => {
		const angle = (index / RING_SAMPLES) * Math.PI * 2;
		return [
			CENTER_X + squarify(Math.cos(angle)) * RING_RADIUS_X,
			CENTER_Y + squarify(Math.sin(angle)) * RING_RADIUS_Y,
		];
	}
);
const RING_DISTANCES = RING_POINTS.reduce<number[]>(
	(distances, point, index) => {
		const previous = RING_POINTS[index - 1];
		distances.push(
			previous
				? (distances.at(-1) ?? 0) +
						Math.hypot(point[0] - previous[0], point[1] - previous[1])
				: 0
		);
		return distances;
	},
	[]
);
const RING_LENGTH = RING_DISTANCES.at(-1) ?? 0;

const BASE_ICONS: OgIconName[] = [
	"code",
	"terminal",
	"globe",
	"server",
	"database",
	"cloud-nodes",
	"bolt",
	"cube-2",
	"layers-3",
	"microchip",
	"window-code-2",
	"cursor-default",
	"plug",
	"globe-pointer",
];

// Pages that mention one of these get its icons first, so the backdrop
// hints at what the page is about.
const TOPICS: { icons: OgIconName[]; match: RegExp }[] = [
	{
		icons: ["cursor-default", "globe-pointer", "window-code-2", "robot"],
		match: /\b(browser|automat|scrap)/i,
	},
	{
		icons: ["webhook", "plug", "chat-bot", "robot"],
		match: /\b(webhook|gateway|ai|agent|llm)\b/i,
	},
	{
		icons: ["film-play", "cloud-streaming", "bucket", "database-cloud"],
		match: /\b(video|stream|object storage|media)/i,
	},
	{
		icons: ["envelope-open", "inbox", "envelope-check"],
		match: /\b(e-?mail|inbox)/i,
	},
	{
		icons: ["bell-on", "chart-bar-trend-up", "heart-pulse", "server"],
		match: /\b(better stack|uptime|monitor|incident)/i,
	},
];

// Park–Miller generator seeded from the page: the same page draws the same
// backdrop on every build, which keeps its OG video cache hit.
const PRNG_MODULUS = 2_147_483_647;
const PRNG_MULTIPLIER = 48_271;

function seededRandom(seed: string): () => number {
	let state = 1;
	for (const char of seed) {
		state = (state * 31 + (char.codePointAt(0) ?? 0)) % PRNG_MODULUS;
	}
	state = state || 1;
	return () => {
		state = (state * PRNG_MULTIPLIER) % PRNG_MODULUS;
		return (state - 1) / (PRNG_MODULUS - 1);
	};
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const swap = Math.floor(random() * (index + 1));
		[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
	}
	return shuffled;
}

function pickIcons(text: string, random: () => number): OgIconName[] {
	const related = TOPICS.filter(({ match }) => match.test(text)).flatMap(
		({ icons }) => icons
	);
	const pool = [...related, ...related, ...shuffle(BASE_ICONS, random)];
	return shuffle(
		Array.from(
			{ length: ICON_COUNT },
			(_, index) => pool[index % pool.length] as OgIconName
		),
		random
	);
}

function ringPositions(random: () => number): Point[] {
	const offset = random();
	return Array.from({ length: ICON_COUNT }, (_, index) => {
		const fraction = ((index + offset) / ICON_COUNT) % 1;
		const sample = RING_DISTANCES.findIndex(
			(distance) => distance >= fraction * RING_LENGTH
		);
		return RING_POINTS[Math.max(sample, 0)] as Point;
	});
}

function formatPoint([x, y]: Point): string {
	return `${x.toFixed(1)} ${y.toFixed(1)}`;
}

// A tiny circle around the icon's spot, followed at constant speed. A circle
// rather than an ellipse: a flattened loop reads as sliding back and forth.
function driftPath([x, y]: Point, random: () => number): string {
	const radius = (MIN_DRIFT_RADIUS + random() * DRIFT_RADIUS_RANGE).toFixed(1);
	const sweep = random() < 0.5 ? 0 : 1;
	const start = formatPoint([x + Number(radius), y]);
	const end = formatPoint([x - Number(radius), y]);
	const arc = `A${radius} ${radius} 0 0 ${sweep}`;
	return `M${start}${arc} ${end}${arc} ${start}Z`;
}

// Negative delays start each icon part-way through its loop, so they never
// move in step. Any negative delay still loops cleanly on an infinite animation.
function randomPhase(random: () => number): string {
	return `${(-random() * LOOP_SECONDS).toFixed(2)}s`;
}

export function OgBackdrop({ seed, text }: { seed: string; text: string }) {
	const random = seededRandom(seed);
	const icons = pickIcons(text, random);
	const positions = ringPositions(random);

	return (
		<div className="absolute inset-0 text-neutral-950 [mask-image:radial-gradient(ellipse_50%_50%_at_center,transparent_50%,black_65%,black_88%,transparent)]">
			{icons.map((name, index) => {
				const position = positions[index] ?? [CENTER_X, CENTER_Y];
				const size = MIN_ICON_SIZE + random() * ICON_SIZE_RANGE;
				return (
					<svg
						aria-hidden="true"
						className="absolute top-0 left-0 opacity-15"
						height={size}
						key={formatPoint(position)}
						style={
							{
								animation: `og-drift ${LOOP_SECONDS}s linear ${randomPhase(random)} infinite`,
								offsetPath: `path("${driftPath(position, random)}")`,
								offsetRotate: "0deg",
							} as CSSProperties
						}
						viewBox="0 0 18 18"
						width={size}
					>
						{OG_ICONS[name].map((iconPath) => (
							<path
								d={iconPath.d}
								fill="currentColor"
								fillRule={"evenOdd" in iconPath ? "evenodd" : undefined}
								key={iconPath.d}
								opacity={"duo" in iconPath ? 0.4 : undefined}
							/>
						))}
					</svg>
				);
			})}
		</div>
	);
}
