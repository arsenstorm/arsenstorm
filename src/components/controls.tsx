import { clsx } from "clsx";
import { HomeIcon, Moon, Sun, Volume2, VolumeX } from "lucide-react";

const ICON_BUTTON =
	"-m-1 relative rounded-md p-1 text-neutral-400 transition-colors after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-neutral-950 focus-visible:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 dark:text-neutral-500 dark:hover:text-neutral-50 dark:focus-visible:text-neutral-50 dark:focus-visible:ring-white/30";

export function AudioToggle() {
	return (
		<button
			aria-label="Disable interface sounds"
			aria-pressed="true"
			className={ICON_BUTTON}
			data-action="toggle-audio"
			type="button"
		>
			<Volume2 className="sound-on-icon size-4" />
			<VolumeX className="sound-off-icon size-4" />
		</button>
	);
}

export function ThemeSwitch() {
	return (
		<button
			aria-label="Toggle theme"
			className={ICON_BUTTON}
			data-action="toggle-theme"
			type="button"
		>
			<Sun className="hidden size-4 dark:block" />
			<Moon className="size-4 dark:hidden" />
		</button>
	);
}

export function Controls({
	noHomeLink = false,
	className,
}: {
	noHomeLink?: boolean;
	className?: string;
}) {
	return (
		<div className={clsx("flex items-center gap-4 pt-0.5", className)}>
			{noHomeLink ? null : (
				<a aria-label="Home" className={ICON_BUTTON} href="/">
					<HomeIcon className="size-4" />
				</a>
			)}
			<AudioToggle />
			<ThemeSwitch />
		</div>
	);
}
