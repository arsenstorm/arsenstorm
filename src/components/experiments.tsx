import { BentoAppBlock, BentoGrid, EmptyBentoBlock } from "#/components/bento";
import { BentoGithub } from "#/components/bento/github.tsx";
import { BentoMap } from "#/components/bento/map";
import { BentoWeather } from "#/components/bento/weather";

export function Experiments() {
	return (
		<section>
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
	);
}
