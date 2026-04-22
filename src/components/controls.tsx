import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import {
	setAudioEnabled,
	useAudioEnabled,
	useInterfaceSounds,
} from "#/lib/interface-sounds";
import { setTheme, useTheme } from "#/lib/theme";

const ICON_BUTTON =
	"relative text-zinc-400 transition-colors after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50";

export function AudioToggle() {
	const enabled = useAudioEnabled();
	const { playHover } = useInterfaceSounds();
	const Icon = enabled ? Volume2 : VolumeX;

	return (
		<button
			aria-label={
				enabled ? "Disable interface sounds" : "Enable interface sounds"
			}
			aria-pressed={enabled}
			className={ICON_BUTTON}
			onClick={() => setAudioEnabled(!enabled)}
			onPointerEnter={() => playHover()}
			type="button"
		>
			<Icon className="size-4" />
		</button>
	);
}

export function ThemeSwitch() {
	const theme = useTheme();
	const { playHover, playClick } = useInterfaceSounds();
	const Icon = theme === "dark" ? Sun : Moon;

	return (
		<button
			aria-label="Toggle theme"
			className={ICON_BUTTON}
			onClick={() => {
				playClick();
				setTheme(theme === "dark" ? "light" : "dark");
			}}
			onPointerEnter={() => playHover()}
			type="button"
		>
			<Icon className="size-4" />
		</button>
	);
}

export function Controls() {
	return (
		<div className="flex items-center gap-4">
			<AudioToggle />
			<ThemeSwitch />
		</div>
	);
}
