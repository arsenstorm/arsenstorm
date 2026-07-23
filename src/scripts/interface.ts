import { defineSound, ensureReady } from "@web-kits/audio";
import { click, hover, toggleOn } from "../../.web-kits/minimal";

const SOUND_STORAGE_KEY = "interface-sounds-enabled";
const THEME_STORAGE_KEY = "theme";
const INTERACTIVE_SELECTOR = "a[href], button";

const playHoverSound = defineSound(hover);
const playClickSound = defineSound(click);
const playToggleOnSound = defineSound(toggleOn);

const root = document.documentElement;

let primed = false;
let readyPromise: Promise<void> | null = null;

function soundsEnabled() {
	return root.dataset.sounds !== "off";
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

async function playWhenReady(sound: () => void) {
	try {
		await prime();
		sound();
	} catch {
		// Audio startup can be rejected by browser autoplay policy or device state.
	}
}

function closestInteractive(target: EventTarget | null) {
	return target instanceof Element
		? target.closest(INTERACTIVE_SELECTOR)
		: null;
}

document.addEventListener("pointerover", (event) => {
	const target = closestInteractive(event.target);
	if (!target) {
		return;
	}
	// pointerenter doesn't bubble; emulate it by ignoring moves within the target.
	if (
		event.relatedTarget instanceof Node &&
		target.contains(event.relatedTarget)
	) {
		return;
	}
	if (soundsEnabled() && primed) {
		playHoverSound();
	}
});

document.addEventListener("pointerdown", (event) => {
	if (!closestInteractive(event.target)) {
		return;
	}
	if (soundsEnabled()) {
		playWhenReady(playClickSound);
	}
});

// Prime eagerly on load: Chrome allows audio once the user has interacted with
// the domain this session, so hover sounds keep working after a full-page
// navigation without needing a fresh click on every page. On a truly fresh
// visit the attempt is rejected and the pointerdown listener above primes
// instead. Speculation-Rules-prerendered pages defer until activation, when
// the audio APIs become available.
function primeEagerly() {
	prime().catch(() => {
		// Blocked by autoplay policy — first pointerdown will prime.
	});
}

// Prerendered pages snapshot theme/sounds at prerender time, so a toggle made
// before the user navigates here is stale on activation. BFCache restores have
// the same problem. Re-read storage at both points.
function syncStoredPreferences() {
	const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
	const dark =
		stored === "dark" ||
		(stored !== "light" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);
	const next: Theme = dark ? "dark" : "light";
	if (root.dataset.theme !== next) {
		disableTransitionsDuring(() => applyTheme(next));
	}
	root.dataset.sounds =
		window.localStorage.getItem(SOUND_STORAGE_KEY) === "false" ? "off" : "on";
	syncAudioButtons();
}

const prerenderingDocument = document as Document & { prerendering?: boolean };
if (prerenderingDocument.prerendering) {
	document.addEventListener(
		"prerenderingchange",
		() => {
			primeEagerly();
			syncStoredPreferences();
		},
		{ once: true }
	);
} else {
	primeEagerly();
}

window.addEventListener("pageshow", (event) => {
	if (event.persisted) {
		syncStoredPreferences();
	}
});

type Theme = "light" | "dark";

// applyTheme and disableTransitionsDuring: ported VERBATIM from src/lib/theme.ts,
// dropping only the `typeof document === "undefined"` guards (this module is
// browser-only).

function applyTheme(theme: Theme) {
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
	const style = document.createElement("style");
	style.appendChild(
		document.createTextNode("*,*::before,*::after{transition:none!important}")
	);
	document.head.appendChild(style);
	change();
	// Force style recalc so the disable-styles apply before we remove them.
	window.getComputedStyle(document.body);
	requestAnimationFrame(() => {
		document.head.removeChild(style);
	});
}

function setTheme(next: Theme) {
	window.localStorage.setItem(THEME_STORAGE_KEY, next);
	disableTransitionsDuring(() => applyTheme(next));
}

function syncAudioButtons() {
	const enabled = soundsEnabled();
	for (const button of document.querySelectorAll(
		'[data-action="toggle-audio"]'
	)) {
		button.setAttribute("aria-pressed", String(enabled));
		button.setAttribute(
			"aria-label",
			enabled ? "Disable interface sounds" : "Enable interface sounds"
		);
	}
}

function setSoundsEnabled(next: boolean) {
	root.dataset.sounds = next ? "on" : "off";
	window.localStorage.setItem(SOUND_STORAGE_KEY, String(next));
	if (next) {
		playWhenReady(playToggleOnSound);
	}
	syncAudioButtons();
}

document.addEventListener("click", (event) => {
	const action =
		event.target instanceof Element
			? event.target.closest("[data-action]")
			: null;
	if (!action) {
		return;
	}
	switch (action.getAttribute("data-action")) {
		case "toggle-theme":
			setTheme(root.classList.contains("dark") ? "light" : "dark");
			break;
		case "toggle-audio":
			setSoundsEnabled(root.dataset.sounds === "off");
			break;
		default:
	}
});

syncAudioButtons();
