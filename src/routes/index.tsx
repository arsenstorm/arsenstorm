import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { useWebHaptics } from "web-haptics/react";
import {
	setAudioEnabled,
	useAudioEnabled,
	useInterfaceSounds,
} from "#/lib/interface-sounds";
import { setTheme, useTheme } from "#/lib/theme";

export const Route = createFileRoute("/")({ component: Home });

interface Project {
	description: string;
	href?: string;
	title: string;
	year: string;
}

const PROJECTS: Project[] = [
	{
		year: "2026",
		title: "arsenstorm",
		description: "This site. A small corner of the internet.",
		href: "https://github.com/arsenstorm/arsenstorm",
	},
	{
		year: "2026",
		title: "Kayle ID",
		description: "Privacy-first identity verification.",
		href: "https://kayle.id",
	},
	{
		year: "2026",
		title: "World Class Education",
		description: "Expert tutoring for top students.",
		href: "https://worldclass.education",
	},
	{
		year: "2026",
		title: "Films",
		description: "A personal film archive.",
		href: "https://films.arsenstorm.com",
	},
	{
		year: "2026",
		title: "AI Gateway",
		description: "Compare AI model outputs side by side.",
		href: "https://ai.arsenstorm.com",
	},
	{
		year: "2026",
		title: "ios-id-scanner",
		description: "iOS app for scanning identity documents over NFC.",
		href: "https://github.com/arsenstorm/ios-id-scanner",
	},
	{
		year: "2026",
		title: "MRTDReader",
		description:
			"A Swift library for reading NFC-enabled passports and ID cards.",
		href: "https://github.com/arsenstorm/MRTDReader",
	},
	{
		year: "2025",
		title: "Anyverse",
		description: "Helping students get into university for free.",
		href: "https://anyverse.app",
	},
	{
		year: "2025",
		title: "Track My Podcast",
		description: "Search and track across your favorite podcasts.",
		href: "https://trackmypodcast.com",
	},
	{
		year: "2025",
		title: "Sotsial",
		description: "Cross-posting to social media, built for developers.",
		href: "https://sotsial.com",
	},
	{
		year: "2024",
		title: "Amazonomics",
		description: "Tools for Amazon sellers.",
		href: "https://amazonomics.com",
	},
	{
		year: "2024",
		title: "Extra GitHub Tools",
		description: "GitHub tools that aren't part of the default interface.",
		href: "https://github.com/arsenstorm/Extra-GitHub-Tools",
	},
];

const ELSEWHERE = [
	{ label: "GitHub", href: "https://github.com/arsenstorm" },
	{ label: "Twitter", href: "https://x.com/arsenstorm" },
	{ label: "Email", href: "mailto:arsen@shkrumelyak.com" },
];

function groupByYear(projects: Project[]): [string, Project[]][] {
	const map = new Map<string, Project[]>();
	for (const p of projects) {
		const bucket = map.get(p.year) ?? [];
		bucket.push(p);
		map.set(p.year, bucket);
	}
	return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

function HapticLink({
	href,
	onPointerEnter,
	onPointerDown,
	...props
}: ComponentPropsWithoutRef<"a">) {
	const { trigger } = useWebHaptics();
	const { playHover, playClick } = useInterfaceSounds();
	const external = href?.startsWith("http");
	return (
		<a
			{...props}
			href={href}
			onPointerDown={(e) => {
				trigger("success");
				playClick();
				onPointerDown?.(e);
			}}
			onPointerEnter={(e) => {
				trigger(8);
				playHover();
				onPointerEnter?.(e);
			}}
			rel={external ? "noopener noreferrer" : undefined}
			target={external ? "_blank" : undefined}
		/>
	);
}

const ICON_BUTTON =
	"relative text-zinc-400 transition-colors after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50";

function AudioToggle() {
	const enabled = useAudioEnabled();
	const { playHover } = useInterfaceSounds();
	const Icon = enabled ? Volume2 : VolumeX;

	return (
		<button
			aria-label={
				enabled ? "Disable interface sounds" : "Enable interface sounds"
			}
			aria-pressed={enabled}
			className={ICON_BUTTON}
			onClick={() => setAudioEnabled(!enabled)}
			onPointerEnter={() => playHover()}
			type="button"
		>
			<Icon className="size-4" />
		</button>
	);
}

function ThemeSwitch() {
	const theme = useTheme();
	const { playHover, playClick } = useInterfaceSounds();
	const Icon = theme === "dark" ? Sun : Moon;

	return (
		<button
			aria-label="Toggle theme"
			className={ICON_BUTTON}
			onClick={() => {
				playClick();
				setTheme(theme === "dark" ? "light" : "dark");
			}}
			onPointerEnter={() => playHover()}
			type="button"
		>
			<Icon className="size-4" />
		</button>
	);
}

function Home() {
	const grouped = groupByYear(PROJECTS);

	return (
		<div className="isolate min-h-dvh bg-white font-sans text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
			<main className="mx-auto max-w-xl px-6 py-24">
				<header className="mb-12 flex items-start justify-between gap-4">
					<div>
						<h1 className="font-medium text-base text-zinc-950 dark:text-zinc-50">
							Arsen Shkrumelyak
						</h1>
						<p className="mt-1 max-w-[56ch] text-pretty text-base text-zinc-500 dark:text-zinc-400">
							Builder, philosopher, and tinkerer. I make things for the web that
							are worth making.
						</p>
					</div>
					<div className="flex items-center gap-4">
						<AudioToggle />
						<ThemeSwitch />
					</div>
				</header>

				<section className="mb-12">
					<h2 className="mb-4 font-medium text-sm text-zinc-950 dark:text-zinc-50">
						Projects
					</h2>
					<div className="flex flex-col gap-6">
						{grouped.map(([year, items]) => (
							<div className="relative" key={year}>
								<h3 className="mb-2 text-sm text-zinc-400 tabular-nums md:absolute md:top-0 md:right-full md:mr-4 md:mb-0 dark:text-zinc-500">
									{year}
								</h3>
								<ul className="flex flex-col gap-3">
									{items.map((item) => {
										const title = (
											<span className="text-sm text-zinc-950 decoration-zinc-300 underline-offset-4 group-hover:underline dark:text-zinc-50 dark:decoration-zinc-700">
												{item.title}
											</span>
										);
										const description = (
											<span className="text-sm text-zinc-500 dark:text-zinc-400">
												{item.description}
											</span>
										);
										return (
											<li key={item.title}>
												{item.href ? (
													<HapticLink
														className="group flex flex-col gap-0.5"
														href={item.href}
													>
														{title}
														{description}
													</HapticLink>
												) : (
													<div className="flex flex-col gap-0.5">
														{title}
														{description}
													</div>
												)}
											</li>
										);
									})}
								</ul>
							</div>
						))}
					</div>
				</section>

				<section>
					<h2 className="mb-4 font-medium text-sm text-zinc-950 dark:text-zinc-50">
						Elsewhere
					</h2>
					<ul className="flex flex-col gap-2">
						{ELSEWHERE.map((item) => (
							<li className="text-sm" key={item.label}>
								<HapticLink
									className="text-zinc-500 underline decoration-zinc-200 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-zinc-950 dark:text-zinc-400 dark:decoration-zinc-800 dark:hover:text-zinc-50 dark:hover:decoration-zinc-50"
									href={item.href}
								>
									{item.label}
								</HapticLink>
							</li>
						))}
					</ul>
				</section>
			</main>
		</div>
	);
}
