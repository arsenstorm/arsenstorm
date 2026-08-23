import {
	fallbackStyles,
	linkStyles,
	mainStyles,
	topStyles,
} from "#/lib/render-styles";
import type { Year } from "#/lib/types";

const BODY_COPY_LINE_1 = "I'm Arsen.";
const BODY_COPY_LINE_2 = "I build software with care.";
const LINE_GAP_CHARS = 30;

export interface Props {
	height: number;
	theme: "light" | "dark";
	width?: number;
}

const attr = (obj: Record<string, string>) =>
	Object.entries(obj).reduce(
		(acc, [key, value]) => `${acc} ${key}="${value}"`,
		""
	);

interface SvgAttributes {
	"data-theme": "light" | "dark";
	height: string;
	[key: string]: string;
}

const svg = (styles: string, html: string, attributes: SvgAttributes) => {
	const attrs = { ...attributes };
	if (!attrs.width) {
		attrs.width = "100%";
	}
	return `
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" ${attr(attrs)}>
		<foreignObject width="100%" height="100%">
			<div xmlns="http://www.w3.org/1999/xhtml">
				<style>${styles}</style>
				${html}
			</div>
		</foreignObject>
	</svg>`;
};

const introCopy = () => {
	const span = (c: string, i: number) =>
		`<span class="fade-in" style="--i: ${i};">${c}</span>`;

	const first = BODY_COPY_LINE_1.split("").map(span).join("");
	const second = BODY_COPY_LINE_2.split("")
		.map((c, i) => span(c, i + BODY_COPY_LINE_1.length + LINE_GAP_CHARS))
		.join("");

	return `<p>${first}</p>\n\t\t\t\t<p>${second}</p>`;
};

export interface Main {
	dots: {
		rows: number;
		size: number;
		gap: number;
	};
	length: number;
	sizes: number[][];
	year: {
		gap: number;
	};
	years: Year[];
}

export const main = (props: Props & Main) => {
	const dots = (year: Year) =>
		year.days.map((level) => `<div class="dot dot--${level}"></div>`).join("");

	const years = props.years
		.map(
			(year, i) => `
						<div class="year year--${i}" style="--w: ${props.sizes[i][0]}; --h: ${props.sizes[i][1]};">
							<div class="year__days">${dots(year)}</div>
						</div>
					`
		)
		.join("");

	const html = `
		<main class="wrapper grid">
			<article class="intro">
				${introCopy()}
			</article>
			<article class="graph">
				<div class="years" style="--w: ${props.length}; --loop-w: ${props.length + props.year.gap}; --track-w: ${props.length * 2 + props.year.gap}; --h: ${props.sizes[0][1]};">
					${years}
					${years}
				</div>
			</article>
		</main>
	`;

	return svg(mainStyles(props), html, {
		height: `${props.height}`,
		"data-theme": props.theme,
	});
};

export const top = (props: Props & { contributions: number }) => {
	const html = `
		<div class="wrapper grid label">
			<div class="menu fade-in">Menu</div>
			<div class="contributions fade-in">
				<span class="shine">${(props.contributions / 1000).toFixed(1)}k</span> Contributions
			</div>
			<div class="readme fade-in">readme.md</div>
		</div>
	`;

	return svg(topStyles(props), html, {
		height: `${props.height}`,
		"data-theme": props.theme,
	});
};

export const link = (props: Props & { index: number }) => (label: string) => {
	const html = `
		<main class="wrapper">
			<a class="link fade-in">
				<div class="link__label shine">${label}</div>
				<div class="link__arrow">↗</div>
			</a>
		</main>
	`;

	return svg(linkStyles(props), html, {
		width: `${props.width ?? 100}`,
		height: `${props.height}`,
		"data-theme": props.theme,
	});
};

export const fallback = (props: Props & { width: number }) => {
	const html = `
		<main class="wrapper">
			<div class="intro">
				${introCopy()}
				<p class="hint fade-in">
					Slight issue... Firefox doesn't support <code>foreignObject</code> yet.
				</p>
			</div>
		</main>
	`;

	return svg(fallbackStyles(props), html, {
		width: `${props.width}`,
		height: `${props.height}`,
		"data-theme": props.theme,
		viewBox: `0 0 ${props.width} ${props.height}`,
	});
};
