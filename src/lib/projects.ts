export interface Project {
	description: string;
	featured?: boolean;
	href?: string;
	status?: "archived" | "decommissioned";
	statusNote?: string;
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
		featured: true,
	},
	{
		year: "2026",
		title: "Automated Web",
		description: "Reliable browser automation for real-world workflows.", // TODO: confirm copy + live link
		href: "/writing/automating-browser-workflows",
		featured: true,
	},
	{
		year: "2026",
		title: "img-to-pdf",
		description:
			"An email-native service that merges emailed images into a single PDF.",
		href: "/writing/using-email-as-an-interface",
		featured: true,
	},
	{
		year: "2026",
		title: "Kayle ID",
		description: "Privacy-first identity verification.",
		href: "https://github.com/kayleai/kayle-id-v1",
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
		featured: true,
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
	},
	{
		year: "2025",
		title: "run-this",
		description:
			"A CLI that explains how to install missing command dependencies.",
		href: "https://github.com/arsenstorm/run-this",
	},
	{
		year: "2025",
		title: "Request Directory",
		description: "A curated directory for discovering useful APIs.",
	},
	{
		year: "2025",
		title: "Arsen Agents",
		description:
			"Parallel AI agents for processing every row of an uploaded CSV.",
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
	{
		year: "2024",
		title: "PLAM",
		description:
			"An AI assistant that could take actions across external services.",
	},
	{
		year: "2023",
		title: "Kayle",
		description:
			"Developer infrastructure for moderating harmful user-generated content.",
	},
	{
		year: "2023",
		title: "Rosel",
		description:
			"A GPT-powered virtual assistant available through web, email, SMS and voice.",
	},
	{
		year: "2023",
		title: "Arsenal Insiders",
		description:
			"AI-curated Arsenal news aggregated and summarised from across the web.",
	},
	{
		year: "2023",
		title: "MentionGPT",
		description: "An Instagram bot that replied to mentions using GPT-4.",
	},
	{
		year: "2022",
		title: "DevRIFT",
		description:
			"Security infrastructure and developer APIs for websites and applications.",
	},
	{
		year: "2022",
		title: "EduRIFT",
		description: "AI-assisted marking software for teachers.",
	},
	{
		year: "2022",
		title: "ANPR",
		description: "Computer vision for checking vehicles against DVLA records.",
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
