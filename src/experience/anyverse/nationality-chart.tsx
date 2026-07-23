import { BarList, type BarListItem } from "#/components/dither-kit/bar-list";

// Self-reported nationalities from the production database, cleaned: the "BGD"
// ISO-code rows are merged into Bangladesh, and the 506 students who didn't
// specify are excluded rather than plotted. 97 nationalities total; the 88
// beyond the top nine are grouped into the grey bucket.
const NATIONALITIES: BarListItem[] = [
	{ label: "United Kingdom", value: 1592 },
	{ label: "Bangladesh", value: 892 },
	{ label: "India", value: 284 },
	{ label: "Pakistan", value: 98 },
	{ label: "Nigeria", value: 69 },
	{ label: "Malaysia", value: 58 },
	{ label: "Singapore", value: 47 },
	{ label: "United States", value: 40 },
	{ label: "Hong Kong", value: 35 },
	{ label: "Everywhere else", value: 802, color: "grey" },
];

export function NationalityChart() {
	return (
		<figure className="my-8 flex flex-col gap-4">
			<BarList interactive={false} items={NATIONALITIES} />
			<figcaption className="text-neutral-500 text-xs dark:text-neutral-400">
				Students by self-reported nationality — the top nine, with 88 more
				nationalities grouped under “everywhere else” (506 students didn’t say).
				Session data puts visitors at 104 countries. Our outreach targeted
				international applicants, but the social ads reached plenty of UK
				students too — we’d support them too, and point them to our partner
				World Class Education for paid reviews or expert tutoring.
			</figcaption>
		</figure>
	);
}
