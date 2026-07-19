import { cn } from "cnfast";
import type { LucideProps } from "lucide-react";
import { Loader2, Maximize2, Minimize2, Pause, Play } from "lucide-react";
import type { SVGProps } from "react";

const videoIconClass = "size-5 shrink-0 hidden";

const filledIconProps: Pick<LucideProps, "fill" | "strokeWidth"> = {
	fill: "currentColor",
	strokeWidth: 0,
};

const iconStackClass =
	"inline-grid place-items-center [&_svg]:col-start-1 [&_svg]:row-start-1";

const speakerPath =
	"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z";

const volumeWaveOne = "M16 9a5 5 0 0 1 0 6";
const volumeWaveTwo = "M19.364 18.364a9 9 0 0 0 0-12.728";

type VolumeIconProps = SVGProps<SVGSVGElement> & {
	waves?: 0 | 1 | 2;
	muted?: boolean;
};

function VolumeIcon({ className, muted = false, waves = 2 }: VolumeIconProps) {
	const visibleWaves = muted ? 0 : waves;

	return (
		<svg
			aria-hidden="true"
			className={cn("lucide", "mdx-video-volume-icon", className)}
			fill="none"
			focusable="false"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d={speakerPath} fill="currentColor" />
			{visibleWaves >= 1 ? (
				<path
					d={volumeWaveOne}
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="2"
				/>
			) : null}
			{visibleWaves >= 2 ? (
				<path
					d={volumeWaveTwo}
					fill="none"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="2"
				/>
			) : null}
			{muted ? (
				<>
					<line
						stroke="currentColor"
						strokeLinecap="round"
						strokeWidth="2"
						x1="22"
						x2="16"
						y1="9"
						y2="15"
					/>
					<line
						stroke="currentColor"
						strokeLinecap="round"
						strokeWidth="2"
						x1="16"
						x2="22"
						y1="9"
						y2="15"
					/>
				</>
			) : null}
		</svg>
	);
}

function PipIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={cn("lucide", "mdx-video-pip-icon", className)}
			fill="none"
			focusable="false"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
			<rect fill="currentColor" height="7" rx="2" width="10" x="12" y="13" />
		</svg>
	);
}

function VideoPlayButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<Play
				aria-hidden
				className={cn(
					videoIconClass,
					"mdx-video-filled-icon",
					"mdx-video-play-icon"
				)}
				{...filledIconProps}
			/>
			<Pause
				aria-hidden
				className={cn(
					videoIconClass,
					"mdx-video-filled-icon",
					"mdx-video-pause-icon"
				)}
				{...filledIconProps}
			/>
		</span>
	);
}

function VideoMuteButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<VolumeIcon className={cn(videoIconClass, "mdx-video-mute-off")} muted />
			<VolumeIcon
				className={cn(videoIconClass, "mdx-video-mute-low")}
				waves={1}
			/>
			<VolumeIcon
				className={cn(videoIconClass, "mdx-video-mute-medium")}
				waves={1}
			/>
			<VolumeIcon
				className={cn(videoIconClass, "mdx-video-mute-high")}
				waves={2}
			/>
		</span>
	);
}

function VideoPipButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<PipIcon className={cn(videoIconClass, "mdx-video-pip-enter")} />
			<PipIcon className={cn(videoIconClass, "mdx-video-pip-exit")} />
		</span>
	);
}

function VideoFullscreenButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<Maximize2
				aria-hidden
				className={cn(
					videoIconClass,
					"size-4.5!",
					"mdx-video-stroke-icon",
					"mdx-video-fullscreen-enter"
				)}
			/>
			<Minimize2
				aria-hidden
				className={cn(
					videoIconClass,
					"size-4.5!",
					"mdx-video-stroke-icon",
					"mdx-video-fullscreen-exit"
				)}
			/>
		</span>
	);
}

function VideoLoadingIcon() {
	return (
		<Loader2
			aria-hidden
			className={cn(
				"size-5 shrink-0 animate-spin",
				"mdx-video-stroke-icon",
				"mdx-video-loading-icon"
			)}
			slot="icon"
		/>
	);
}

export {
	VideoFullscreenButtonIcons,
	VideoLoadingIcon,
	VideoMuteButtonIcons,
	VideoPipButtonIcons,
	VideoPlayButtonIcons,
};
