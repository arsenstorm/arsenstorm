export interface Project {
	description: string;
	href?: string;
	title: string;
	year: string;
}

export const PROJECTS: Project[] = [
	{
		year: "2026",
		title: "Open Live Object Streaming (OLOS)",
		description:
			"A protocol for low-latency live streaming on top of object storage.",
		href: "https://github.com/arsenstorm/olos",
	},
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
		title: "iOS ID Reader",
		description: "iOS app for reading identity documents over NFC.",
		href: "https://apps.apple.com/us/app/id-reader/id6757679372",
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
		title: "World Class Education",
		description: "Expert tutoring for top students.",
		href: "https://worldclass.education",
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
		year: "2024",
		title: "Sotsial",
		description: "Cross-posting to social media, built for developers.",
		href: "https://sotsial.com",
	},
	{
		year: "2024",
		title: "Amazonomics",
		description: "Analytics and data for optimising Amazon listings and sales.",
		href: "https://amazonomics.com",
	},
	{
		year: "2024",
		title: "Extra GitHub Tools",
		description: "Useful tools that should be in GitHub, but aren't.",
		href: "https://eght.arsenstorm.com",
	},
];

export function groupByYear(projects: Project[]): [string, Project[]][] {
	const map = new Map<string, Project[]>();
	for (const project of projects) {
		const bucket = map.get(project.year) ?? [];
		bucket.push(project);
		map.set(project.year, bucket);
	}
	return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}
