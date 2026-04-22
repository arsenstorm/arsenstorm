import { createLink, type LinkComponent } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, PointerEvent, Ref } from "react";
import { useWebHaptics } from "web-haptics/react";
import { useInterfaceSounds } from "#/lib/interface-sounds";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
	ref?: Ref<HTMLAnchorElement>;
};

function useHapticHandlers(
	onPointerDown?: AnchorProps["onPointerDown"],
	onPointerEnter?: AnchorProps["onPointerEnter"]
) {
	const { trigger } = useWebHaptics();
	const { playHover, playClick } = useInterfaceSounds();
	return {
		onPointerDown: (e: PointerEvent<HTMLAnchorElement>) => {
			trigger("success");
			playClick();
			onPointerDown?.(e);
		},
		onPointerEnter: (e: PointerEvent<HTMLAnchorElement>) => {
			trigger(8);
			playHover();
			onPointerEnter?.(e);
		},
	};
}

/**
 * External link — plain anchor with haptic + sound feedback.
 * Auto-sets target="_blank" and rel="noopener noreferrer" for http(s) hrefs.
 */
export function HapticAnchor({
	href,
	onPointerDown,
	onPointerEnter,
	rel,
	target,
	ref,
	...props
}: AnchorProps) {
	const handlers = useHapticHandlers(onPointerDown, onPointerEnter);
	const external = href?.startsWith("http");
	return (
		<a
			{...props}
			{...handlers}
			href={href}
			ref={ref}
			rel={external ? "noopener noreferrer" : rel}
			target={external ? "_blank" : target}
		/>
	);
}

/**
 * Internal link — TanStack Router Link with haptic + sound feedback.
 * `to` is type-checked against the route tree.
 */
function HapticLinkInner({
	onPointerDown,
	onPointerEnter,
	ref,
	...props
}: AnchorProps) {
	const handlers = useHapticHandlers(onPointerDown, onPointerEnter);
	return <a ref={ref} {...props} {...handlers} />;
}

const CreatedHapticLink = createLink(HapticLinkInner);

export const HapticLink: LinkComponent<typeof HapticLinkInner> = (props) => (
	<CreatedHapticLink preload="intent" {...props} />
);
