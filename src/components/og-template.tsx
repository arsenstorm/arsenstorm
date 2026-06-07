import type { ReactNode } from "react";
import { useEffect, useState } from "react";

const DEFAULT_OG_WIDTH = 1200;
const DEFAULT_OG_HEIGHT = 630;
const OG_QUERY_PARAM = "og";
const PREVIEW_MARGIN = 32;
const MIN_PREVIEW_SCALE = 0.1;

declare global {
	interface Window {
		__OG_READY__?: boolean;
	}
}

interface OGTemplateProps {
	children: ReactNode;
	height?: number;
	ready?: "auto" | "manual";
	width?: number;
}

interface DefaultOGTemplateProps {
	description: string;
	icon?: string | null;
	title: string;
}

export function signalOgReady() {
	if (typeof window !== "undefined") {
		window.__OG_READY__ = true;
	}
}

function useOgPreview() {
	const [isPreview, setIsPreview] = useState(false);

	useEffect(() => {
		const updatePreview = () => {
			setIsPreview(
				new URL(window.location.href).searchParams.has(OG_QUERY_PARAM)
			);
		};

		updatePreview();
		window.addEventListener("popstate", updatePreview);

		return () => {
			window.removeEventListener("popstate", updatePreview);
		};
	}, []);

	return isPreview;
}

function getOgPreviewScale(width: number, height: number) {
	const widthScale = (window.innerWidth - PREVIEW_MARGIN) / width;
	const heightScale = (window.innerHeight - PREVIEW_MARGIN) / height;

	return Math.max(MIN_PREVIEW_SCALE, Math.min(1, widthScale, heightScale));
}

function useOgPreviewScale(width: number, height: number, isPreview: boolean) {
	const [scale, setScale] = useState(1);

	useEffect(() => {
		if (!isPreview) {
			setScale(1);
			return;
		}

		const updateScale = () => {
			setScale(getOgPreviewScale(width, height));
		};

		updateScale();
		window.addEventListener("resize", updateScale);
		window.visualViewport?.addEventListener("resize", updateScale);

		return () => {
			window.removeEventListener("resize", updateScale);
			window.visualViewport?.removeEventListener("resize", updateScale);
		};
	}, [height, isPreview, width]);

	return scale;
}

export function OGTemplate({
	children,
	height = DEFAULT_OG_HEIGHT,
	ready = "auto",
	width = DEFAULT_OG_WIDTH,
}: OGTemplateProps) {
	const isPreview = useOgPreview();
	const previewScale = useOgPreviewScale(width, height, isPreview);
	const style = isPreview
		? {
				height,
				left: "50%",
				overflow: "hidden",
				pointerEvents: "auto" as const,
				position: "fixed" as const,
				top: "50%",
				transform: `translate(-50%, -50%) scale(${previewScale})`,
				transformOrigin: "center",
				width,
				zIndex: 2_147_483_647,
			}
		: {
				height,
				left: -10_000,
				overflow: "hidden",
				pointerEvents: "none" as const,
				position: "fixed" as const,
				top: 0,
				width,
			};

	return (
		<>
			{isPreview ? (
				<div className="fixed inset-0 z-2147483646 h-full w-full bg-neutral-950" />
			) : null}
			<div
				aria-hidden={isPreview ? undefined : "true"}
				className="pointer-events-none select-none"
				data-og-height={height}
				data-og-ready={ready}
				data-og-template=""
				data-og-width={width}
				style={style}
			>
				{children}
			</div>
		</>
	);
}

export function DefaultOGTemplate({
	description,
	title,
	icon = null,
}: DefaultOGTemplateProps) {
	useEffect(() => {
		signalOgReady();
	}, []);

	return (
		<OGTemplate>
			<div className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white px-24 text-center text-neutral-950">
				<div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-neutral-950">
					<img
						alt=""
						className="size-full"
						height={80}
						src={icon || "/apple-touch-icon.png"}
						width={80}
					/>
				</div>
				<h1 className="mt-8 max-w-[920px] text-balance font-medium text-7xl leading-[1.04]">
					{title}
				</h1>
				<p className="mt-6 max-w-[720px] text-3xl text-neutral-500 leading-snug">
					{description}
				</p>
			</div>
		</OGTemplate>
	);
}
