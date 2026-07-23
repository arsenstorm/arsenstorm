const COPY_STATE_MS = 1200;
const copyResetTimers = new WeakMap<Element, number>();

function setExpanded(block: Element, open: boolean) {
	block.toggleAttribute("data-open", open);
	const pre = block.querySelector("pre");
	if (pre instanceof HTMLElement) {
		pre.style.maxHeight = open ? "" : "192px";
		pre.style.overflow = open ? "" : "hidden";
	}
	for (const toggle of block.querySelectorAll('[data-code-action="toggle"]')) {
		toggle.setAttribute("aria-expanded", String(open));
		if (toggle.hasAttribute("aria-label")) {
			toggle.setAttribute("aria-label", open ? "Collapse code" : "Expand code");
		}
	}
}

function markCopied(block: Element) {
	block.setAttribute("data-copied", "");
	for (const button of block.querySelectorAll('[data-code-action="copy"]')) {
		button.setAttribute("aria-label", "Copied code");
	}
	const existing = copyResetTimers.get(block);
	if (existing !== undefined) {
		window.clearTimeout(existing);
	}
	copyResetTimers.set(
		block,
		window.setTimeout(() => {
			copyResetTimers.delete(block);
			block.removeAttribute("data-copied");
			for (const button of block.querySelectorAll(
				'[data-code-action="copy"]'
			)) {
				button.setAttribute("aria-label", "Copy code");
			}
		}, COPY_STATE_MS)
	);
}

// Scroll containers are keyboard-focusable; only keep the tab stop when
// there is actually something to scroll.
const preTabStops = new ResizeObserver((entries) => {
	for (const { target } of entries) {
		if (target instanceof HTMLElement) {
			target.tabIndex = target.scrollWidth > target.clientWidth + 1 ? 0 : -1;
		}
	}
});
for (const pre of document.querySelectorAll("[data-code-block] pre")) {
	preTabStops.observe(pre);
}

for (const block of document.querySelectorAll(
	"[data-code-block]:not([data-open])"
)) {
	const pre = block.querySelector("pre");
	if (!pre) {
		continue;
	}
	if (pre.scrollHeight > pre.clientHeight + 1) {
		block.setAttribute("data-can-expand", "");
	}
}

document.addEventListener("click", (event) => {
	const button =
		event.target instanceof Element
			? event.target.closest("[data-code-action]")
			: null;
	if (!button) {
		return;
	}
	const block = button.closest("[data-code-block]");
	if (!block) {
		return;
	}

	if (button.getAttribute("data-code-action") === "toggle") {
		setExpanded(block, !block.hasAttribute("data-open"));
		return;
	}

	const code = block.querySelector("pre")?.textContent;
	if (!code) {
		return;
	}
	navigator.clipboard.writeText(code).then(() => {
		markCopied(block);
	});
});
