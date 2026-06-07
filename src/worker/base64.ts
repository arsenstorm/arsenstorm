import type { JsonRecord } from "./types";

const BASE64_URL_PADDING_REGEX = /=+$/;

export function base64UrlEncode(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(BASE64_URL_PADDING_REGEX, "");
}

export function base64UrlEncodeJson(value: JsonRecord): string {
	return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
}
