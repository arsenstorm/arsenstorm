import { useSyncExternalStore } from "react";

type DocumentTheme = "light" | "dark";

function subscribe(onChange: () => void) {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "data-theme"],
	});
	return () => observer.disconnect();
}

function getSnapshot(): DocumentTheme {
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useDocumentTheme(): DocumentTheme {
	return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}
