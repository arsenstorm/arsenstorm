import type { AnchorHTMLAttributes, Ref } from "react";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
	ref?: Ref<HTMLAnchorElement>;
};

/**
 * Site link — plain anchor. Auto-sets target="_blank" and
 * rel="noopener noreferrer" for external http(s) hrefs.
 */
export function Anchor({ href, rel, target, ...props }: AnchorProps) {
	const external = href?.startsWith("http");
	return (
		<a
			{...props}
			href={href}
			rel={external ? "noopener noreferrer" : rel}
			target={external ? "_blank" : target}
		/>
	);
}

export const MaybeExternalLink = Anchor;
