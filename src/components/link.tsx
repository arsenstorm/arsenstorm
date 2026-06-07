import { createLink, type LinkComponent } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, PointerEvent, Ref } from "react";
import { useInterfaceSounds } from "#/lib/interface-sounds";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
	ref?: Ref<HTMLAnchorElement>;
};

function useSoundHandlers(
	onPointerDown?: AnchorProps["onPointerDown"],
	onPointerEnter?: AnchorProps["onPointerEnter"]
) {
	const { playHover, playClick } = useInterfaceSounds();
	return {
		onPointerDown: (e: PointerEvent<HTMLAnchorElement>) => {
			playClick();
			onPointerDown?.(e);
		},
		onPointerEnter: (e: PointerEvent<HTMLAnchorElement>) => {
			playHover();
			onPointerEnter?.(e);
		},
	};
}

/**
 * External link — plain anchor with sound feedback.
 * Auto-sets target="_blank" and rel="noopener noreferrer" for http(s) hrefs.
 */
export function Anchor({
	href,
	onPointerDown,
	onPointerEnter,
	rel,
	target,
	ref,
	...props
}: AnchorProps) {
	const handlers = useSoundHandlers(onPointerDown, onPointerEnter);
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
 * Internal link — TanStack Router Link with sound feedback.
 * `to` is type-checked against the route tree.
 */
function LinkInner({
	onPointerDown,
	onPointerEnter,
	ref,
	...props
}: AnchorProps) {
	const handlers = useSoundHandlers(onPointerDown, onPointerEnter);
	return <a ref={ref} {...props} {...handlers} />;
}

const CreatedLink = createLink(LinkInner);

export const Link: LinkComponent<typeof LinkInner> = (props) => (
	<CreatedLink preload="intent" {...props} />
);
