import { BentoAppBlock, BentoBlock, BentoGrid } from "#/components/bento";
import { BentoGithub } from "#/components/bento/github.tsx";
import { BentoMap } from "#/components/bento/map";
import { BentoWeather } from "#/components/bento/weather";
import { Section } from "#/components/section.tsx";

export function Experiments() {
	return (
		<Section title="Experiments">
			<BentoGrid className="relative -mx-4">
				<BentoMap className="order-1" />
				<BentoBlock
					className="order-2 hidden bg-transparent md:block dark:bg-transparent"
					size="small"
				/>
				<BentoBlock
					className="order-2 hidden bg-transparent md:block dark:bg-transparent"
					size="small"
				/>
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
		</Section>
	);
}
