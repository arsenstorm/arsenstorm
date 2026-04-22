import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

let current: Theme = "light";
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
	current = document.documentElement.classList.contains("dark")
		? "dark"
		: "light";
}

function applyTheme(theme: Theme) {
	if (typeof document === "undefined") {
		return;
	}
	const root = document.documentElement;
	if (theme === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
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
