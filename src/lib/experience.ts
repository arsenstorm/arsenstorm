import { getCollection } from "astro:content";

export interface ExperienceSummary {
	company: string;
	end: string | null;
	highlights: string[];
	href: string;
	kind: "experience" | "earlier";
	logo?: string;
	period: string;
	role: string;
	slug: string;
	start: string;
	summary: string;
}

const ONGOING_SORT_KEY = "9999";

export function formatPeriod(start: string, end: string | null): string {
	const startYear = start.slice(0, 4);
	const endYear = end ? end.slice(0, 4) : "Present";
	return startYear === endYear ? startYear : `${startYear}–${endYear}`;
}

export async function getExperience() {
	const entries = await getCollection("experience");
	return entries
		.map((entry) => ({
			entry,
			slug: entry.id,
			href: `/experience/${entry.id}`,
			period: formatPeriod(entry.data.start, entry.data.end),
			...entry.data,
		}))
		.sort(
			(a, b) =>
				(b.end ?? ONGOING_SORT_KEY).localeCompare(a.end ?? ONGOING_SORT_KEY) ||
				b.start.localeCompare(a.start)
		);
}
