import clsx from "clsx";
import type { ComponentPropsWithoutRef, ComponentType, SVGProps } from "react";
import DangerIcon from "#/icons/danger";
import InfoIcon from "#/icons/info";
import Lightbulb from "#/icons/lightbulb";
import SuccessIcon from "#/icons/success";
import WarningIcon from "#/icons/warning";

const calloutContentClass =
	"flex flex-col gap-y-2 text-sm leading-6 [&>ol]:my-0 [&>p]:my-0 [&>ol]:!text-inherit [&>ol]:pl-5 [&>ul]:my-0 [&>ul]:!text-inherit [&>ul]:pl-5 [&_a]:decoration-current/30 [&_li]:!text-inherit [&_li::marker]:!text-current [&_*]:text-inherit";

type CalloutVariant =
	| "caution"
	| "danger"
	| "info"
	| "note"
	| "success"
	| "tip"
	| "warning";

interface CalloutVisual {
	contentClassName: string;
	frameClassName: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	label: string;
	labelClassName: string;
}

type CalloutProps = ComponentPropsWithoutRef<"aside"> & {
	title?: string;
};

const CALLOUT_VISUALS: Record<CalloutVariant, CalloutVisual> = {
	caution: {
		contentClassName:
			"bg-rose-50 text-rose-950 dark:bg-rose-950/25 dark:text-rose-100",
		frameClassName: "bg-rose-200 dark:bg-rose-800/80",
		icon: WarningIcon,
		label: "Caution",
		labelClassName: "text-rose-950 dark:text-rose-100",
	},
	danger: {
		contentClassName:
			"bg-red-50 text-red-950 dark:bg-red-950/25 dark:text-red-100",
		frameClassName: "bg-red-200 dark:bg-red-800/80",
		icon: DangerIcon,
		label: "Danger",
		labelClassName: "text-red-950 dark:text-red-100",
	},
	info: {
		contentClassName:
			"bg-sky-50 text-sky-950 dark:bg-sky-950/25 dark:text-sky-100",
		frameClassName: "bg-sky-200 dark:bg-sky-800/80",
		icon: InfoIcon,
		label: "Info",
		labelClassName: "text-sky-950 dark:text-sky-100",
	},
	note: {
		contentClassName:
			"bg-neutral-100 text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300",
		frameClassName: "bg-neutral-200 dark:bg-neutral-700",
		icon: InfoIcon,
		label: "Note",
		labelClassName: "text-neutral-950 dark:text-neutral-50",
	},
	success: {
		contentClassName:
			"bg-emerald-50 text-emerald-950 dark:bg-emerald-950/25 dark:text-emerald-100",
		frameClassName: "bg-emerald-200 dark:bg-emerald-800/80",
		icon: SuccessIcon,
		label: "Success",
		labelClassName: "text-emerald-950 dark:text-emerald-100",
	},
	tip: {
		contentClassName:
			"bg-teal-50 text-teal-950 dark:bg-teal-950/25 dark:text-teal-100",
		frameClassName: "bg-teal-200 dark:bg-teal-800/80",
		icon: Lightbulb,
		label: "Tip",
		labelClassName: "text-teal-950 dark:text-teal-100",
	},
	warning: {
		contentClassName:
			"bg-amber-50 text-amber-950 dark:bg-amber-950/25 dark:text-amber-100",
		frameClassName: "bg-amber-200 dark:bg-amber-800/80",
		icon: WarningIcon,
		label: "Warning",
		labelClassName: "text-amber-950 dark:text-amber-100",
	},
};

function Callout({
	children,
	className,
	title,
	variant,
	...props
}: CalloutProps & {
	variant: CalloutVariant;
}) {
	const visual = CALLOUT_VISUALS[variant];
	const Icon = visual.icon;

	return (
		<aside
			className={clsx(
				"not-prose -mx-4 my-6 flex flex-col rounded-[14px] p-0.5",
				visual.frameClassName,
				className
			)}
			{...props}
		>
			<div
				className={clsx(
					"my-1 flex items-center gap-1.5 px-3.5 font-medium text-xs tracking-tight",
					visual.labelClassName
				)}
			>
				<Icon
					aria-hidden="true"
					className="size-3.5 shrink-0"
					strokeWidth={2}
				/>
				<p>{title ?? visual.label}</p>
			</div>
			<div className={clsx("rounded-xl p-4", visual.contentClassName)}>
				<div className={calloutContentClass}>{children}</div>
			</div>
		</aside>
	);
}

export function Caution(props: CalloutProps) {
	return <Callout variant="caution" {...props} />;
}

export function Danger(props: CalloutProps) {
	return <Callout variant="danger" {...props} />;
}

export function Info(props: CalloutProps) {
	return <Callout variant="info" {...props} />;
}

export function Note(props: CalloutProps) {
	return <Callout variant="note" {...props} />;
}

export function Success(props: CalloutProps) {
	return <Callout variant="success" {...props} />;
}

export function Tip(props: CalloutProps) {
	return <Callout variant="tip" {...props} />;
}

export function Warning(props: CalloutProps) {
	return <Callout variant="warning" {...props} />;
}
