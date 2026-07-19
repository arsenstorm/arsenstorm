import { cn } from "cnfast";
import HlsVideo from "hls-video-element/react";
import {
	MediaControlBar,
	MediaController,
	MediaDurationDisplay,
	MediaFullscreenButton,
	MediaLoadingIndicator,
	MediaMuteButton,
	MediaPipButton,
	MediaPlayButton,
	MediaTimeDisplay,
	MediaTimeRange,
} from "media-chrome/react";
import { createElement } from "react";
import {
	VideoFullscreenButtonIcons,
	VideoLoadingIcon,
	VideoMuteButtonIcons,
	VideoPipButtonIcons,
	VideoPlayButtonIcons,
} from "@/icons/video";

interface VideoProps {
	poster?: string;
	src: string;
	title?: string;
}

const mediaControllerClass = cn(
	"relative block aspect-video w-full overflow-hidden bg-neutral-950",
	"[--media-font-family:var(--font-sans)]",
	"[--media-font-size:15px]",
	"[--media-font-weight:600]",
	"[--media-primary-color:rgb(255_255_255)]",
	"[--media-secondary-color:transparent]",
	"[--media-control-background:transparent]",
	"[--media-control-hover-background:transparent]",
	"[--media-control-padding:6px]",
	"[--media-control-height:32px]",
	"[--media-button-icon-width:20px]",
	"[--media-button-icon-height:20px]",
	"[--media-loading-indicator-icon-width:20px]",
	"[--media-loading-indicator-icon-height:20px]",
	"[--media-range-bar-color:rgb(255_255_255)]",
	"[--media-range-track-background:rgb(255_255_255/0.3)]",
	"[--media-range-track-height:5px]",
	"[--media-range-track-border-radius:999px]",
	"[--media-range-thumb-opacity:0]",
	"[--media-range-thumb-width:0]",
	"[--media-range-thumb-height:0]",
	"[--media-range-padding:0]",
	"[--media-range-track-pointer-background:transparent]",
	"[--media-range-track-pointer-border-right:2px_solid_rgb(255_255_255/0.88)]",
	"[--media-time-range-buffered-color:rgb(255_255_255/0.38)]",
	"[--media-preview-transition-duration-in:0.12s]",
	"[--media-preview-transition-delay-in:0s]",
	"[--media-preview-transition-duration-out:0.1s]",
	"[--media-preview-transition-delay-out:0s]",
	"[--media-preview-time-background:transparent]",
	"[--media-preview-time-padding:0]",
	"[--media-preview-time-margin:0]",
	"[--media-preview-box-margin:0_0_8px]",
	"[--media-tooltip-background:transparent]",
	"[--media-tooltip-background-color:transparent]",
	"[--media-tooltip-arrow-display:none]",
	"[--media-tooltip-filter:none]",
	"[--media-tooltip-padding:6px_10px]",
	"[--media-tooltip-border-radius:0]",
	"[--media-tooltip-distance:12px]",
	"[&_media-chrome-button::part(tooltip)]:font-medium",
	"[&_media-chrome-button::part(tooltip)]:text-[13px]",
	"[&_media-chrome-button::part(tooltip)]:tracking-tight",
	"[--media-text-content-height:18px]",
	"[&_media-pip-button[mediapipunavailable]]:hidden",
	"[&_media-airplay-button[mediaairplayunavailable]]:hidden",
	"[&_media-chrome-button_svg:not(.lucide)]:hidden",
	"[&_media-loading-indicator_svg:not(.lucide)]:hidden",
	"[&_.mdx-video-filled-icon]:fill-current [&_.mdx-video-filled-icon]:stroke-none",
	"[&_.mdx-video-stroke-icon]:fill-none [&_.mdx-video-stroke-icon]:stroke-current",
	"[&_.mdx-video-volume-icon]:fill-none [&_.mdx-video-volume-icon_path:first-child]:fill-current",
	"[&_.mdx-video-volume-icon_line]:fill-none",
	"[&_.mdx-video-pip-icon]:fill-none [&_.mdx-video-pip-icon_rect]:fill-current",
	"[&_media-play-button[mediapaused]_.mdx-video-play-icon]:block",
	"[&_media-play-button:not([mediapaused])_.mdx-video-pause-icon]:block",
	"[&_media-mute-button[mediavolumelevel=off]_.mdx-video-mute-off]:block",
	"[&_media-mute-button[mediavolumelevel=low]_.mdx-video-mute-low]:block",
	"[&_media-mute-button[mediavolumelevel=medium]_.mdx-video-mute-medium]:block",
	"[&_media-mute-button:not([mediavolumelevel])_.mdx-video-mute-high]:block",
	"[&_media-mute-button[mediavolumelevel=high]_.mdx-video-mute-high]:block",
	"[&_media-pip-button:not([mediaispip])_.mdx-video-pip-enter]:block",
	"[&_media-pip-button[mediaispip]_.mdx-video-pip-exit]:block",
	"[&_media-fullscreen-button:not([mediaisfullscreen])_.mdx-video-fullscreen-enter]:block",
	"[&_media-fullscreen-button[mediaisfullscreen]_.mdx-video-fullscreen-exit]:block",
	"[&_media-loading-indicator[medialoading]:not([mediapaused])_.mdx-video-loading-icon]:opacity-100"
);

const controlBarClass = cn(
	"absolute inset-x-0 bottom-0 z-1 flex w-full items-center gap-4",
	"bg-[linear-gradient(to_top,rgb(0_0_0/0.58)_0%,rgb(0_0_0/0.4)_22%,rgb(0_0_0/0.24)_45%,rgb(0_0_0/0.12)_68%,rgb(0_0_0/0.04)_86%,transparent_100%)]",
	"px-4 pt-20 pb-4"
);

const scrubberClass = cn(
	"flex min-w-0 flex-1 items-center gap-4",
	"[&_media-time-display]:!tabular-nums",
	"[&_media-duration-display]:!tabular-nums",
	"[&_media-preview-time-display]:!tabular-nums"
);

const scrubTimeClass = "min-w-[3ch] shrink-0 tracking-wide";

const scrubRangeClass = cn(
	"min-w-0 flex-1",
	"[&[dragging]]:[--media-range-track-height:6px]",
	"active:[--media-range-track-height:6px]"
);

const previewBoxClass =
	"flex flex-col items-center gap-1.5 bg-transparent px-2";

const previewTimeRowClass = cn(
	"flex flex-row items-baseline gap-0 whitespace-nowrap",
	"[&_media-preview-time-display]:!tabular-nums",
	"[&_media-preview-time-display]:font-semibold [&_media-preview-time-display]:text-[15px]"
);

const previewScrubLineClass =
	"my-0.5 h-4 w-px shrink-0 bg-white/88 supports-[width:0.5px]:w-[0.5px]";

const previewMutedClass = "text-[15px] font-medium opacity-55 !tabular-nums";

function Video({ poster, src, title }: VideoProps) {
	return (
		<div className="not-prose relative -mx-4 my-4 flex flex-col rounded-[20px] bg-neutral-200/50 p-2 dark:bg-neutral-800/50">
			{title ? (
				<p className="order-last mt-2 ml-4 font-medium text-neutral-600 text-xs tracking-tight dark:text-neutral-400">
					{title}
				</p>
			) : null}
			<div className="overflow-hidden rounded-xl bg-neutral-950">
				<MediaController className={mediaControllerClass}>
					<HlsVideo
						className="h-full w-full bg-neutral-950 object-contain"
						crossOrigin=""
						playsInline
						poster={poster}
						preload="metadata"
						slot="media"
						src={src}
					/>
					<MediaLoadingIndicator slot="centered-chrome">
						<VideoLoadingIcon />
					</MediaLoadingIndicator>
					<MediaControlBar className={controlBarClass}>
						<MediaPlayButton>
							<VideoPlayButtonIcons />
						</MediaPlayButton>
						<MediaMuteButton>
							<VideoMuteButtonIcons />
						</MediaMuteButton>
						<div className={scrubberClass}>
							<MediaTimeDisplay className={scrubTimeClass} />
							<MediaTimeRange className={scrubRangeClass}>
								<div
									className={previewBoxClass}
									part="box preview-box"
									slot="preview"
								>
									<div className={previewTimeRowClass}>
										{createElement("media-preview-time-display")}
										<span className={previewMutedClass}> / </span>
										<MediaDurationDisplay className={previewMutedClass} />
									</div>
									<div aria-hidden className={previewScrubLineClass} />
								</div>
							</MediaTimeRange>
							<MediaDurationDisplay className={scrubTimeClass} />
						</div>
						<MediaPipButton>
							<VideoPipButtonIcons />
						</MediaPipButton>
						<MediaFullscreenButton>
							<VideoFullscreenButtonIcons />
						</MediaFullscreenButton>
					</MediaControlBar>
				</MediaController>
			</div>
		</div>
	);
}

export { Video };
