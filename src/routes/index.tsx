import { createFileRoute } from "@tanstack/react-router";
import { BentoAppBlock, BentoGrid, EmptyBentoBlock } from "#/components/bento";
import { BentoGithub } from "#/components/bento/github.tsx";
import { BentoMap } from "#/components/bento/map";
import { BentoWeather } from "#/components/bento/weather";
import { Controls } from "#/components/controls";
import { HapticAnchor, HapticLink } from "#/components/haptic-link";
import { ItemGroup } from "#/components/item-group.tsx";
import { PROJECTS } from "#/lib/projects.ts";
import { hasTechnicalWriteups, TECHNICAL_WRITEUPS } from "#/writeups";

export const Route = createFileRoute("/")({ component: Home });

const ELSEWHERE = [
	{ label: "GitHub", href: "https://github.com/arsenstorm" },
	{ label: "Twitter", href: "https://x.com/arsenstorm" },
	{ label: "Email", href: "mailto:arsen@shkrumelyak.com" },
];

function Home() {
	const showTechnicalWriteups = hasTechnicalWriteups();

	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<header className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-medium text-base text-neutral-950 dark:text-neutral-50">
						Arsen Shkrumelyak
					</h1>
					<p className="mt-1 max-w-[56ch] text-pretty text-base text-neutral-500 dark:text-neutral-400">
						I build things worth building.
					</p>
				</div>
				<Controls noHomeLink />
			</header>

			<section>
				<div className="mb-4 flex flex-row items-center justify-between">
					<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
						Work
					</h2>
					<HapticLink
						className="text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
						to="/work"
					>
						View all
					</HapticLink>
				</div>
				<ItemGroup id="projects-list" items={PROJECTS} showAll={false} />
			</section>

			{showTechnicalWriteups && (
				<section>
					<div className="mb-4 flex flex-row items-center justify-between">
						<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
							Technical Writeups
						</h2>
						<HapticLink
							className="text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
							to="/technical-writeups"
						>
							View all
						</HapticLink>
					</div>
					<ItemGroup
						groupBy="month"
						id="writeups-list"
						items={TECHNICAL_WRITEUPS}
						showAll={false}
					/>
				</section>
			)}

			{/* I'll add these back later */}
			<section className="hidden">
				<div className="mb-4 flex flex-row items-center justify-between">
					<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
						Experiments
					</h2>
				</div>
				<BentoGrid className="relative -mx-4">
					<BentoMap className="order-1" />
					<EmptyBentoBlock className="order-2 hidden md:block" size="small" />
					<EmptyBentoBlock className="order-2 hidden md:block" size="small" />
					<BentoAppBlock
						app={{
							name: "ID Reader",
							href: "https://apps.apple.com/us/app/id-reader/id6757679372",
							image: "/apps/id-reader-icon.png",
						}}
						className="order-last md:order-2"
					/>
					<BentoWeather className="order-2" />
					<BentoGithub className="order-3" />
				</BentoGrid>
			</section>

			<section>
				<h2 className="mb-4 font-medium text-neutral-950 text-sm dark:text-neutral-50">
					Elsewhere
				</h2>
				<ul className="flex flex-col gap-2">
					{ELSEWHERE.map((item) => (
						<li className="text-sm" key={item.label}>
							<HapticAnchor
								className="text-neutral-500 underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
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
