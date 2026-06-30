import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Controls } from "#/components/controls.tsx";
import { Anchor, Link } from "#/components/link";
import { pageLinks, pageMeta } from "#/lib/seo";
import { TECHNICAL_WRITEUPS } from "#/writeups";

const TITLE = "CV";
const DESCRIPTION = "Arsen Shkrumelyak — Software Engineer.";

export const Route = createFileRoute("/cv")({
	head: () => ({
		links: pageLinks("/cv"),
		meta: pageMeta(TITLE, DESCRIPTION, "/cv"),
	}),
	component: CV,
});

const CONTACT = [
	{ label: "arsen@shkrumelyak.com", href: "mailto:arsen@shkrumelyak.com" },
	{ label: "arsenstorm.com", href: "https://arsenstorm.com" },
	{ label: "github.com/arsenstorm", href: "https://github.com/arsenstorm" },
	{
		label: "linkedin.com/in/arsenstorm",
		href: "https://linkedin.com/in/arsenstorm",
	},
];

const PROFILE =
	"Software engineer focused on TypeScript, Cloudflare infrastructure, protocol design, identity systems, and product engineering. I build end-to-end systems — including low-latency object-storage-backed streaming, email-native SaaS workflows, identity verification, and education platforms.";

const SELECTED_PROJECTS: {
	title: string;
	href?: string;
	links?: { href: string; label: string }[];
	year: string;
	summary: string;
	tech: string;
	bullets: string[];
}[] = [
	{
		title: "Open Live Object Streaming (OLOS)",
		href: "/technical-writeups/open-live-object-streaming",
		year: "2026",
		summary:
			"A draft protocol for low-latency live streaming on top of commodity object storage.",
		tech: "TypeScript, Cloudflare Workers, R2, HLS/CMAF",
		bullets: [
			"Built a working prototype that streams live video through object storage to browser playback at roughly 4s end-to-end latency.",
			"Designed a protocol that models a live stream as an ordered sequence of immutable objects, with a trusted coordinator — not the bucket — owning all live state.",
			"Implemented a forward-only cursor with compare-and-set persistence and contiguous-prefix commits — enabling parallel part uploads and windowed retention.",
		],
	},
	{
		title: "img-to-pdf",
		href: "/technical-writeups/using-email-as-an-interface",
		year: "2026",
		summary: "An email-native SaaS product where the address is the interface.",
		tech: "Cloudflare Workers, Email Routing, MIME parsing, PDF generation",
		bullets: [
			"Built an email-native service on Cloudflare Email Routing and Workers: parses incoming MIME, extracts images, merges them into a single PDF, and replies with it attached.",
			"Handled sender-to-user mapping, entitlement checks, and abuse prevention with no account, upload screen, or web app.",
		],
	},
	{
		title: "Kayle ID",
		href: "https://kayle.id",
		year: "2026",
		summary: "Privacy-first identity verification and developer platform.",
		tech: "TypeScript, Cloudflare Workers, webhooks, NFC document reading",
		bullets: [
			"Built an identity verification product and developer API designed to minimise retained identity data across verification and API workflows.",
			"Integrated NFC document reading (see iOS ID Reader / MRTDReader) into end-to-end verification flows.",
		],
	},
	{
		title: "iOS ID Reader & MRTDReader",
		href: "https://github.com/arsenstorm/MRTDReader",
		links: [
			{
				href: "https://apps.apple.com/us/app/id-reader/id6757679372",
				label: "App Store",
			},
		],
		year: "2026",
		summary: "Reading NFC-enabled passports and ID cards.",
		tech: "Swift, iOS, Core NFC, ICAO 9303, PACE, CA-v2",
		bullets: [
			"Published an iOS app on the App Store for reading ICAO 9303 NFC travel documents.",
			"Forked AndyQ/NFCPassportReader into MRTDReader, rebranding it for broader MRTD support and adding PACE IM/CAM, CAN-based PACE, and CA-v2 transcript export.",
		],
	},
];

const EDUCATION = [
	{
		period: "2023—2026",
		institution: "BSc Computer Science, University of Greenwich",
		detail: "Graduated · Classification pending · London, UK",
	},
];

const PRINT_STYLES = `
	@page { size: A4; margin: 0; }
	@media print {
		html, body { background: #fff !important; }
		.cv-no-print { display: none !important; }
		.cv-backdrop { padding: 0 !important; background: #fff !important; }
		.cv-sheet { box-shadow: none !important; width: auto !important; min-height: auto !important; margin: 0 !important; padding: 16mm !important; border-radius: 0 !important; outline: none !important; }
	}
`;

function SheetHeading({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="mb-2 border-neutral-200 border-b pb-1 font-medium text-[11px] text-neutral-900 uppercase tracking-wider">
			{children}
		</h2>
	);
}

function CV() {
	return (
		<div className="cv-backdrop min-h-dvh px-4 pt-10 pb-24">
			{/** biome-ignore lint/security/noDangerouslySetInnerHtml: scoped print/@page rules can't be expressed with utility classes */}
			<style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

			<article className="cv-sheet mx-auto w-full max-w-[210mm] space-y-5 rounded-xl bg-white p-6 text-neutral-800 shadow-lg outline outline-neutral-100 sm:p-10 md:min-h-[297mm] md:p-[16mm] dark:outline-neutral-900">
				<header>
					<h1 className="font-semibold text-2xl text-neutral-950 tracking-tight">
						Arsen Shkrumelyak
					</h1>
					<p className="mt-0.5 text-neutral-600 text-sm">
						Software Engineer · London, UK
					</p>
					<div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-neutral-600 text-xs">
						{CONTACT.map((item) => (
							<Anchor
								className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-950"
								href={item.href}
								key={item.label}
							>
								{item.label}
							</Anchor>
						))}
					</div>
				</header>

				<section>
					<SheetHeading>Profile</SheetHeading>
					<p className="text-pretty text-[13px] text-neutral-700 leading-relaxed">
						{PROFILE}
					</p>
				</section>

				<section>
					<SheetHeading>Recent Engineering Work</SheetHeading>
					<ul className="flex flex-col gap-3">
						{SELECTED_PROJECTS.map((project) => (
							<li key={project.title}>
								<div className="flex items-baseline justify-between gap-4">
									<p className="font-medium text-[13px] text-neutral-900">
										{project.href ? (
											<Anchor
												className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-950"
												href={project.href}
											>
												{project.title}
											</Anchor>
										) : (
											project.title
										)}
									</p>
									<span className="shrink-0 text-[12px] text-neutral-400 tabular-nums">
										{project.year}
									</span>
								</div>
								<p className="text-[12px] text-neutral-600 italic leading-snug">
									{project.summary}
									{project.links?.map((link) => (
										<Anchor
											className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-950"
											href={link.href}
											key={link.href}
										>
											{" "}
											{link.label}
										</Anchor>
									))}
								</p>
								<ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4 text-[12px] text-neutral-700 leading-snug marker:text-neutral-300">
									{project.bullets.map((bullet) => (
										<li key={bullet}>{bullet}</li>
									))}
									<li className="text-neutral-500">
										Built with {project.tech}
									</li>
								</ul>
							</li>
						))}
					</ul>
				</section>

				<section>
					<SheetHeading>Technical Writing</SheetHeading>
					<ul className="flex flex-col gap-1">
						{TECHNICAL_WRITEUPS.sort((a, b) =>
							b.publishedAt.localeCompare(a.publishedAt)
						)
							.slice(0, 3)
							.map((writeup) => (
								<li
									className="flex items-baseline justify-between gap-4"
									key={writeup.slug}
								>
									<Link
										className="text-[13px] text-neutral-800 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-950"
										params={writeup.params}
										to={writeup.to}
									>
										{writeup.title}
									</Link>
									<span className="shrink-0 text-[12px] text-neutral-400 tabular-nums">
										{writeup.publishedAt.slice(0, 4)}
									</span>
								</li>
							))}
					</ul>
				</section>

				<section>
					<SheetHeading>Education</SheetHeading>
					<ul className="flex flex-col gap-2">
						{EDUCATION.map((entry) => (
							<li
								className="flex items-baseline justify-between gap-4"
								key={entry.institution}
							>
								<div>
									<p className="font-medium text-[13px] text-neutral-900">
										{entry.institution}
									</p>
									<p className="text-[12px] text-neutral-600">{entry.detail}</p>
								</div>
								<span className="shrink-0 text-[12px] text-neutral-400 tabular-nums">
									{entry.period}
								</span>
							</li>
						))}
					</ul>
				</section>
			</article>

			<div className="cv-no-print fixed right-0 bottom-0 left-0">
				<div className="mx-auto mb-6 flex max-w-sm items-center justify-between rounded-xl bg-white p-2 shadow-lg outline outline-neutral-100 dark:bg-neutral-950 dark:outline-neutral-900">
					<div className="ml-2">
						<Controls />
					</div>
					<Anchor
						className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
						download
						href="/cv.pdf"
					>
						<Download className="size-4" />
						Download PDF
					</Anchor>
				</div>
			</div>
		</div>
	);
}
