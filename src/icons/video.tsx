import { cn } from "cnfast";
import ArrowsExpandDiagonal from "#/icons/arrows-expand-diagonal.tsx";
import ArrowsReduceDiagonal from "#/icons/arrows-reduce-diagonal.tsx";
import Loader from "#/icons/loader.tsx";
import MaximizeWindow from "#/icons/maximize-window.tsx";
import MediaPause from "#/icons/media-pause.tsx";
import MediaPlay from "#/icons/media-play.tsx";
import MinimizeWindow from "#/icons/minimize-window.tsx";
import Volume from "#/icons/volume.tsx";
import VolumeDown from "#/icons/volume-down.tsx";
import VolumeUp from "#/icons/volume-up.tsx";
import VolumeXmark from "#/icons/volume-xmark.tsx";

// media-chrome renders its own default icons inside every button; the player
// hides any svg without this class so only these show.
const videoIconClass = "mdx-video-icon size-5 shrink-0 hidden";

const iconStackClass =
	"inline-grid place-items-center [&_svg]:col-start-1 [&_svg]:row-start-1";

function VideoPlayButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<MediaPlay
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-play-icon")}
			/>
			<MediaPause
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-pause-icon")}
			/>
		</span>
	);
}

function VideoMuteButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<VolumeXmark
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-mute-off")}
			/>
			<VolumeDown
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-mute-low")}
			/>
			<Volume
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-mute-medium")}
			/>
			<VolumeUp
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-mute-high")}
			/>
		</span>
	);
}

function VideoPipButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<MinimizeWindow
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-pip-enter")}
			/>
			<MaximizeWindow
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-pip-exit")}
			/>
		</span>
	);
}

function VideoFullscreenButtonIcons() {
	return (
		<span className={iconStackClass} slot="icon">
			<ArrowsExpandDiagonal
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-fullscreen-enter")}
			/>
			<ArrowsReduceDiagonal
				aria-hidden="true"
				className={cn(videoIconClass, "mdx-video-fullscreen-exit")}
			/>
		</span>
	);
}

function VideoLoadingIcon() {
	return (
		<Loader
			aria-hidden="true"
			className="mdx-video-icon mdx-video-loading-icon size-5 shrink-0 animate-spin"
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
