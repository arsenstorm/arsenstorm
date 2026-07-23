import type { AnchorHTMLAttributes, Ref } from "react";

export const textLinkClass =
	"rounded-md text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 outline-neutral-950/30 outline-offset-2 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 focus-visible:text-neutral-950 focus-visible:decoration-neutral-950 focus-visible:outline-2 dark:text-neutral-400 dark:decoration-neutral-800 dark:outline-white/30 dark:focus-visible:text-neutral-50 dark:focus-visible:decoration-neutral-50 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50";

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
