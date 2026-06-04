import { defineSound, ensureReady } from "@web-kits/audio";
import { useCallback, useSyncExternalStore } from "react";
import { click, hover, toggleOn } from "../../.web-kits/minimal";

const STORAGE_KEY = "interface-sounds-enabled";

const playHoverSound = defineSound(hover);
const playClickSound = defineSound(click);
const playToggleOnSound = defineSound(toggleOn);

let enabled = true;
let primed = false;
let readyPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

type SoundPlayer = () => void;

function readStored(): boolean {
	if (typeof window === "undefined") {
		return true;
	}
	const stored = window.localStorage.getItem(STORAGE_KEY);
	return stored === null ? true : stored === "true";
}

if (typeof window !== "undefined") {
	enabled = readStored();
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot() {
	return enabled;
}

function getServerSnapshot() {
	return true;
}

async function prime() {
	if (primed) {
		return;
	}
	readyPromise ??= ensureReady()
		.then(() => {
			primed = true;
		})
		.catch((error: unknown) => {
			readyPromise = null;
			throw error;
		});
	await readyPromise;
}

async function playWhenReady(sound: SoundPlayer) {
	try {
		await prime();
		sound();
	} catch {
		// Audio startup can be rejected by browser autoplay policy or device state.
	}
}

export function setAudioEnabled(next: boolean) {
	if (enabled === next) {
		return;
	}
	enabled = next;
	if (typeof window !== "undefined") {
		window.localStorage.setItem(STORAGE_KEY, String(next));
	}
	if (next) {
		playWhenReady(playToggleOnSound);
	}
	for (const listener of listeners) {
		listener();
	}
}

export function useAudioEnabled() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useInterfaceSounds() {
	const isEnabled = useAudioEnabled();

	const playHover = useCallback(() => {
		if (!(isEnabled && primed)) {
			return;
		}
		playHoverSound();
	}, [isEnabled]);

	const playClick = useCallback(() => {
		if (!isEnabled) {
			return;
		}
		playWhenReady(playClickSound);
	}, [isEnabled]);

	return { playHover, playClick };
}
