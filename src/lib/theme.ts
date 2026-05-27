import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

let current: Theme = "light";
const listeners = new Set<() => void>();

function getStoredTheme(): Theme | null {
	if (typeof window === "undefined") {
		return null;
	}

	const stored = window.localStorage.getItem(STORAGE_KEY);
	return stored === "dark" || stored === "light" ? stored : null;
}

function getSystemTheme(): Theme {
	if (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	) {
		return "dark";
	}

	return "light";
}

function getInitialTheme(): Theme {
	return getStoredTheme() ?? getSystemTheme();
}

if (typeof window !== "undefined") {
	current = getInitialTheme();
}

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") {
		return;
	}
	const root = document.documentElement;
	root.dataset.theme = theme;
	root.style.setProperty(
		"--map-surface",
		theme === "dark" ? "#0f0f0f" : "#f5f5f5"
	);
	if (theme === "dark") {
		root.classList.add("dark");
		root.style.background = "rgb(9 9 11)";
		root.style.colorScheme = "dark";
	} else {
		root.classList.remove("dark");
		root.style.background = "";
		root.style.colorScheme = "";
	}
}

function disableTransitionsDuring(change: () => void) {
	if (typeof document === "undefined") {
		change();
		return;
	}
	const style = document.createElement("style");
	style.appendChild(
		document.createTextNode(
			"*,*::before,*::after{transition:none!important;animation:none!important}"
		)
	);
	document.head.appendChild(style);
	change();
	// Force style recalc so the disable-styles apply before we remove them.
	window.getComputedStyle(document.body);
	requestAnimationFrame(() => {
		document.head.removeChild(style);
	});
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot() {
	return current;
}

function getServerSnapshot(): Theme {
	return "light";
}

export function setTheme(next: Theme) {
	if (current === next) {
		return;
	}
	current = next;
	if (typeof window !== "undefined") {
		window.localStorage.setItem(STORAGE_KEY, next);
	}
	disableTransitionsDuring(() => applyTheme(next));
	for (const listener of listeners) {
		listener();
	}
}

export function useTheme() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
