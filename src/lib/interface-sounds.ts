import { defineSound, ensureReady } from "@web-kits/audio";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "interface-sounds-enabled";

const hover = defineSound({
	source: { type: "sine", frequency: { start: 520, end: 620 } },
	envelope: { attack: 0.004, decay: 0.07, sustain: 0, release: 0.04 },
	gain: 0.06,
});

const click = defineSound({
	source: { type: "triangle", frequency: { start: 880, end: 440 } },
	envelope: { attack: 0.002, decay: 0.09, sustain: 0, release: 0.05 },
	gain: 0.12,
});

let enabled = true;
let primed = false;
const listeners = new Set<() => void>();

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
	await ensureReady();
	primed = true;
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
		prime().then(() => click());
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
		hover();
	}, [isEnabled]);

	const playClick = useCallback(() => {
		if (!isEnabled) {
			return;
		}
		prime().then(() => click());
	}, [isEnabled]);

	return { playHover, playClick };
}
