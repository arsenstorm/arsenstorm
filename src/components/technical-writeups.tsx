import { HapticLink } from "#/components/haptic-link";
import { ItemGroup } from "#/components/item-group.tsx";
import { hasTechnicalWriteups, TECHNICAL_WRITEUPS } from "#/writeups";

export function TechnicalWriteups() {
	const showTechnicalWriteups = hasTechnicalWriteups();

	if (!showTechnicalWriteups) {
		return null;
	}

	return (
		<section>
			<div className="mb-4 flex flex-row items-center justify-between">
				<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
					Technical Writeups
				</h2>
				{TECHNICAL_WRITEUPS.length > 3 ? (
					<HapticLink
						className="text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
						to="/technical-writeups"
					>
						View all
					</HapticLink>
				) : null}
			</div>
			<ItemGroup
				groupBy="month"
				id="writeups-list"
				items={TECHNICAL_WRITEUPS}
				showAll={false}
			/>
		</section>
	);
}
