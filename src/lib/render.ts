import type { Year } from "#/lib/types";
import { DARK_COLORS, LIGHT_COLORS } from "#/lib/variables";

const BP_MEDIUM = 550;
const BP_LARGE = 700;
const BODY_COPY = "I'm Arsen, a builder, philosopher, and tinkerer.";

interface Props {
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

export const shared = `
	:root {
		--color-text-light: ${LIGHT_COLORS.text};
		--color-dot-bg-0-light: ${LIGHT_COLORS.bg0};
		--color-dot-bg-1-light: ${LIGHT_COLORS.bg1};
		--color-dot-bg-2-light: ${LIGHT_COLORS.bg2};
		--color-dot-bg-3-light: ${LIGHT_COLORS.bg3};
		--color-dot-bg-4-light: ${LIGHT_COLORS.bg4};
		--color-dot-border-light: ${LIGHT_COLORS.border};

		--color-text-dark: ${DARK_COLORS.text};
		--color-dot-bg-0-dark: ${DARK_COLORS.bg0};
		--color-dot-bg-1-dark: ${DARK_COLORS.bg1};
		--color-dot-bg-2-dark: ${DARK_COLORS.bg2};
		--color-dot-bg-3-dark: ${DARK_COLORS.bg3};
		--color-dot-bg-4-dark: ${DARK_COLORS.bg4};
		--color-dot-border-dark: ${DARK_COLORS.border};

		--default-delay: 1s;
		--default-duration: 1.55s;
		--default-stagger: 0.1s;

		--animate-in-menu-delay: calc(var(--default-delay) + var(--default-stagger) * 0);
		--animate-in-links-delay: calc(var(--default-delay) + var(--default-stagger) * 1);
		--animate-in-contributions-delay: calc(var(--default-delay) + var(--default-stagger) * 5);
		--animate-in-readme-delay: calc(var(--default-delay) + var(--default-stagger) * 6);
		--animate-in-copy-delay: calc(var(--default-delay) + var(--default-stagger) * 7);
		--animate-in-graph-delay: calc(var(--default-delay) + var(--default-stagger) * 17);
	}

	[data-theme="dark"] {
		--color-text: var(--color-text-dark);
		--color-dot-bg-0: var(--color-dot-bg-0-dark);
		--color-dot-bg-1: var(--color-dot-bg-1-dark);
		--color-dot-bg-2: var(--color-dot-bg-2-dark);
		--color-dot-bg-3: var(--color-dot-bg-3-dark);
		--color-dot-bg-4: var(--color-dot-bg-4-dark);
		--color-dot-border: var(--color-dot-border-dark);
	}

	[data-theme="light"] {
		--color-text: var(--color-text-light);
		--color-dot-bg-0: var(--color-dot-bg-0-light);
		--color-dot-bg-1: var(--color-dot-bg-1-light);
		--color-dot-bg-2: var(--color-dot-bg-2-light);
		--color-dot-bg-3: var(--color-dot-bg-3-light);
		--color-dot-bg-4: var(--color-dot-bg-4-light);
		--color-dot-border: var(--color-dot-border-light);
	}

	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
	}

	.wrapper {
		contain: strict;
		block-size: calc(var(--size-height) * 1px);
		container-type: inline-size;
		position: relative;
		overflow: clip;
		font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
		color: var(--color-text);
	}

	@-moz-document url-prefix() {
		.wrapper {
			display: none;
		}
	}

	.label {
		contain: content;
		font-size: 14px;
		font-weight: 600;
	}

	.link {
		contain: content;
		font-size: 14px;
	}

	.fade-in {
		will-change: opacity;
		animation-name: fade-in;
		animation-fill-mode: both;
		animation-duration: var(--duration, var(--default-duration));
		animation-timing-function: var(--ease, ease-out);
		animation-delay: var(--delay, var(--default-delay));
	}

	p {
		margin: 0;
	}

	@keyframes fade-in {
		0% { opacity: 0; }
		100% { opacity: 1; }
	}

	.shine {
		background-color: var(--color-text);
		background-image: linear-gradient(-75deg,
			rgb(0 0 0 / 0) 0%,
			rgb(255 255 255 / 0.18) 15%,
			rgb(0 0 0 / 0) 25%
		);
		background-size: 200%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;

		animation-name: shine;
		animation-duration: 14s;
		animation-iteration-count: infinite;
	}

	@keyframes shine {
		0% { background-position: 200%; }
		10% { background-position: 0%; }
		to { background-position: 0%; }
	}
`;

export interface Main {
	dots: {
		rows: number;
		size: number;
		gap: number;
	};
	length: number;
	location: { city: string; country: string };
	sizes: number[][];
	year: {
		gap: number;
	};
	years: Year[];
}

export const main = (props: Props & Main) => {
	const styles = `
		${shared}

		:root {
			--rows: ${props.dots.rows};
			--size-width: 100cqw;
			--size-height: ${props.height};
			--size-dot-gap: ${props.dots.gap};
			--size-dot: ${props.dots.size};
			--size-year-gap: ${props.year.gap};
			--size-label-height: 20;
			--duration: 360;
		}

		.wrapper {
			align-items: flex-end;
			grid-template-rows: 1fr auto;
			row-gap: 20px;
		}

		.intro {
			contain: content;
			grid-area: 1 / 1 / span 1 / span 6;
			font-size: 18px;
			font-weight: 300;
		}
		.intro span {
			contain: content;
			--duration: 980ms;
			--delay: calc(var(--animate-in-copy-delay) + var(--i) * 10ms);
		}

		@media (width > ${BP_MEDIUM}px) {
			.intro {
				grid-area: 1 / 3 / span 1 / span 4;
				font-size: 22px;
			}
		}
		@media (width > ${BP_LARGE}px) {
			.intro {
				grid-area: 1 / 4 / span 1 / span 3;
			}
		}

		.graph {
			--delay: var(--animate-in-graph-delay);
			grid-area: 2 / 1 / span 1 / span 6;
		}

		.years {
			--_w: var(--w);
			--_h: calc(var(--h) + var(--size-label-height));

			display: flex;
			gap: calc(var(--size-year-gap) * 1px);

			contain: strict;
			inline-size: calc(var(--_w) * 1px);
			block-size: calc(var(--_h) * 1px);
			will-change: transform;
			backface-visibility: hidden;
			transform: translateZ(0);

			animation-name: scroll, fade-in;
			animation-timing-function: linear, ease-out;
			animation-duration: calc(30s + (var(--_w) * 0.06s)), 2.5s;
			animation-fill-mode: both, both;
			animation-delay: 2s, var(--animate-in-graph-delay);
		}
		@keyframes scroll {
			0% { transform: translateX(60px); }
			100% { transform: translateX(calc(-100% + 100cqw)); }
		}

		.year {
			contain: strict;
			content-visibility: auto;
			inline-size: calc(var(--w) * 1px);
			block-size: calc(var(--_h) * 1px);
		}

		.year__label {
			contain: strict;
			block-size: calc(var(--size-label-height) * 1px);
			content-visibility: auto;
			display: flex;
			align-items: end;
		}
		.year__days {
			display: grid;
			grid-auto-flow: column;
			grid-template-rows: repeat(var(--rows), calc(var(--size-dot) * 1px));
			grid-auto-columns: calc(var(--size-dot) * 1px);
			gap: calc(var(--size-dot-gap) * 1px);

			contain: strict;
			content-visibility: auto;
			inline-size: calc(var(--w) * 1px);
			block-size: calc(var(--h) * 1px);
		}
		.year__days .dot {
			contain: strict;
			content-visibility: auto;
			aspect-ratio: 1;
			inline-size: calc(var(--size-dot) * 1px);
			block-size: calc(var(--size-dot) * 1px);
			border: calc(var(--size-dot) * 0.075 * 1px) solid var(--color-dot-border);
			border-radius: calc(var(--size-dot) * 0.15 * 1px);
			will-change: transform;
		}
		.dot--0 { background-color: var(--color-dot-bg-0); }
		.dot--1 { background-color: var(--color-dot-bg-1); }
		.dot--2 { background-color: var(--color-dot-bg-2); }
		.dot--3 { background-color: var(--color-dot-bg-3); }
		.dot--4 { background-color: var(--color-dot-bg-4); }
	`;

	const dots = (year: Year) =>
		year.days.map((level) => `<div class="dot dot--${level}"></div>`).join("");

	const html = `
		<main class="wrapper grid">
			<article class="intro">
				<p>${BODY_COPY.split("")
					.map((c, i) => `<span class="fade-in" style="--i: ${i};">${c}</span>`)
					.join("")}</p>
			</article>
			<article class="graph">
				<div class="years" style="--w: ${props.length}; --h: ${props.sizes[0][1]};">
					${props.years
						.map(
							(year, i) => `
						<div class="year year--${i}" style="--w: ${props.sizes[i][0]}; --h: ${props.sizes[i][1]};">
							<div class="year__days">${dots(year)}</div>
						</div>
					`
						)
						.join("")}
				</div>
			</article>
		</main>
	`;

	return svg(styles, html, {
		height: `${props.height}`,
		"data-theme": props.theme,
	});
};

export const top = (props: Props & { contributions: number }) => {
	const styles = `
		${shared}

		:root {
			--size-height: ${props.height};
		}

		.wrapper {
			align-items: center;
		}

		.menu {
			--delay: var(--animate-in-menu-delay);
			contain: content;
			text-align: left;
			grid-area: 1 / 1 / span 1 / span 2;
		}
		.contributions {
			--delay: var(--animate-in-contributions-delay);
			contain: strict;
			grid-area: 1 / 3 / span 1 / span 2;
		}
		.readme {
			--delay: var(--animate-in-readme-delay);
			contain: content;
			text-align: right;
			grid-area: 1 / 5 / span 1 / span 2;
		}

		@media (width > ${BP_MEDIUM}px) {
			.menu {
				grid-area: 1 / 1 / span 1 / span 2;
			}
			.contributions {
				contain: content;
				grid-area: 1 / 3 / span 1 / span 2;
			}
			.readme {
				grid-area: 1 / 5 / span 1 / span 2;
			}
		}

		@media (width > ${BP_LARGE}px) {
			.menu {
				grid-area: 1 / 1 / span 1 / span 3;
			}
			.contributions {
				grid-area: 1 / 4 / span 1 / span 2;
			}
			.readme {
				grid-area: 1 / 6 / span 1 / span 1;
			}
		}
	`;

	const html = `
		<div class="wrapper grid label">
			<div class="menu fade-in">Menu</div>
			<div class="contributions fade-in">
				<span class="shine">${(props.contributions / 1000).toFixed(1)}k</span> Contributions
			</div>
			<div class="readme fade-in">readme.md</div>
		</div>
	`;

	return svg(styles, html, {
		height: `${props.height}`,
		"data-theme": props.theme,
	});
};

export const link = (props: Props & { index: number }) => (label: string) => {
	const arrowDelay = (Math.random() * 5).toFixed(2);
	const labelDelay = (Math.random() * 10).toFixed(2);

	const styles = `
		${shared}

		:root {
			--size-height: ${props.height};
			--size-width: ${props.width ?? 100};
			--i: ${props.index};
		}

		.wrapper {
			--delay: calc(var(--animate-in-links-delay) + var(--i) * 1.2s);
		}
		@-moz-document url-prefix() {
			.wrapper {
				display: block;
			}
		}

		.link {
			display: flex;
			justify-content: start;
			align-items: center;
			gap: 3px;
		}
		.link__label {
			animation-delay: ${labelDelay}s;
		}
		.link__arrow {
			font-size: 0.75em;
			position: relative;
			inset-block-start: 0.1em;
			animation-name: rotate;
			animation-duration: 5s;
			animation-timing-function: ease-in-out;
			animation-iteration-count: infinite;
			animation-delay: ${arrowDelay}s;
		}

		@keyframes rotate {
			0% { transform: rotate(0deg); }
			10%, 100% { transform: rotate(360deg); }
		}
	`;

	const html = `
		<main class="wrapper">
			<a class="link fade-in">
				<div class="link__label shine">${label}</div>
				<div class="link__arrow">↗</div>
			</a>
		</main>
	`;

	return svg(styles, html, {
		width: `${props.width ?? 100}`,
		height: `${props.height}`,
		"data-theme": props.theme,
	});
};

export const fallback = (props: Props & { width: number }) => {
	const styles = `
		${shared}

		:root {
			--size-height: ${props.height};
			--size-width: ${props.width};
		}

		.wrapper {
			display: none;
		}
		@-moz-document url-prefix() {
			.wrapper {
				display: flex;
				align-items: end;
			}
		}

		.intro {
			font-size: 22px;
			font-weight: 300;
		}
		.intro span {
			contain: content;
			--duration: 980ms;
			--delay: calc(var(--animate-in-contributions-delay) + var(--i) * 10ms);
		}

		.hint {
			--duration: 1.2s;
			--delay: calc(var(--animate-in-contributions-delay) + 2.5s);
			margin-block-start: 10px;
			font-size: 10px;
			font-style: italic;
		}
	`;

	const html = `
		<main class="wrapper">
			<div class="intro">
				<p>${BODY_COPY.split("")
					.map((c, i) => `<span class="fade-in" style="--i: ${i};">${c}</span>`)
					.join("")}</p>
				<p class="hint fade-in">
					Slight issue... Firefox doesn't support <code>foreignObject</code> yet.
				</p>
			</div>
		</main>
	`;

	return svg(styles, html, {
		width: `${props.width}`,
		height: `${props.height}`,
		"data-theme": props.theme,
		viewBox: `0 0 ${props.width} ${props.height}`,
	});
};
