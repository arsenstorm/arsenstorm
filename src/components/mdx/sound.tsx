import type { ComponentPropsWithoutRef, PointerEvent } from "react";
import { useInterfaceSounds } from "#/lib/interface-sounds";

type SoundButtonProps = ComponentPropsWithoutRef<"button">;

function SoundButton({
	onPointerDown,
	onPointerEnter,
	...props
}: SoundButtonProps) {
	const { playClick, playHover } = useInterfaceSounds();

	return (
		<button
			onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
				playClick();
				onPointerDown?.(event);
			}}
			onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
				playHover();
				onPointerEnter?.(event);
			}}
			{...props}
		/>
	);
}

export { SoundButton };
