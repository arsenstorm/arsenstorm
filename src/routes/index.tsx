import { createFileRoute } from "@tanstack/react-router";
import { Controls } from "#/components/controls";
import { HapticAnchor } from "#/components/haptic-link";

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
		href: "https://extra-github-tools.vercel.app/",
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

function Home() {
	const grouped = groupByYear(PROJECTS);

	return (
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
				<Controls />
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
												<HapticAnchor
													className="group flex flex-col gap-0.5"
													href={item.href}
												>
													{title}
													{description}
												</HapticAnchor>
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
							<HapticAnchor
								className="text-zinc-500 underline decoration-zinc-200 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-zinc-950 dark:text-zinc-400 dark:decoration-zinc-800 dark:hover:text-zinc-50 dark:hover:decoration-zinc-50"
								href={item.href}
							>
								{item.label}
							</HapticAnchor>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
