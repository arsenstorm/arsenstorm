import { base64UrlEncode, base64UrlEncodeJson } from "./base64";
import type { Env } from "./types";

const PEM_PRIVATE_KEY_END_REGEX = /-----END PRIVATE KEY-----/g;
const PEM_PRIVATE_KEY_START_REGEX = /-----BEGIN PRIVATE KEY-----/g;
const WHITESPACE_REGEX = /\s/g;

interface AppleCredentials {
	keyId: string;
	privateKey: string;
	serviceId: string;
	teamId: string;
}

function getAppleCredentials(env: Env): AppleCredentials {
	return {
		keyId: env.APPLE_KEY_ID,
		privateKey: env.APPLE_PRIVATE_KEY,
		serviceId: env.APPLE_SERVICE_ID,
		teamId: env.APPLE_TEAM_ID,
	};
}

function privateKeyToArrayBuffer(privateKey: string): ArrayBuffer {
	const base64 = privateKey
		.replaceAll("\\n", "\n")
		.replace(PEM_PRIVATE_KEY_START_REGEX, "")
		.replace(PEM_PRIVATE_KEY_END_REGEX, "")
		.replace(WHITESPACE_REGEX, "");
	const bytes = Uint8Array.from(atob(base64), (character) =>
		character.charCodeAt(0)
	);

	return bytes.buffer;
}

function normalizeP256Signature(signature: Uint8Array): Uint8Array {
	if (signature.byteLength === 64) {
		return signature;
	}

	if (signature[0] !== 0x30) {
		throw new Error("Unexpected ECDSA signature format.");
	}

	let offset = 2;
	if (signature[1] === 0x81) {
		offset = 3;
	}

	if (signature[offset] !== 0x02) {
		throw new Error("Unexpected ECDSA signature format.");
	}
	const rLength = signature[offset + 1];
	const rStart = offset + 2;
	const rEnd = rStart + rLength;

	if (signature[rEnd] !== 0x02) {
		throw new Error("Unexpected ECDSA signature format.");
	}
	const sLength = signature[rEnd + 1];
	const sStart = rEnd + 2;
	const sEnd = sStart + sLength;

	const r = signature.slice(rStart, rEnd);
	const s = signature.slice(sStart, sEnd);
	const raw = new Uint8Array(64);
	raw.set(r.slice(-32), 32 - Math.min(r.byteLength, 32));
	raw.set(s.slice(-32), 64 - Math.min(s.byteLength, 32));

	return raw;
}

async function signApplePayload(
	payload: string,
	privateKey: string
): Promise<string> {
	const key = await crypto.subtle.importKey(
		"pkcs8",
		privateKeyToArrayBuffer(privateKey),
		{ name: "ECDSA", namedCurve: "P-256" },
		false,
		["sign"]
	);
	const signature = await crypto.subtle.sign(
		{ hash: "SHA-256", name: "ECDSA" },
		key,
		new TextEncoder().encode(payload)
	);

	return base64UrlEncode(normalizeP256Signature(new Uint8Array(signature)));
}

export async function createWeatherKitToken(env: Env): Promise<string> {
	const credentials = getAppleCredentials(env);
	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + 30 * 60;
	const fullServiceId = `${credentials.teamId}.${credentials.serviceId}`;
	const header = base64UrlEncodeJson({
		alg: "ES256",
		id: fullServiceId,
		kid: credentials.keyId,
	});
	const payload = base64UrlEncodeJson({
		exp: expiresAt,
		iat: issuedAt,
		iss: credentials.teamId,
		sub: credentials.serviceId,
	});
	const unsignedToken = `${header}.${payload}`;
	const signature = await signApplePayload(
		unsignedToken,
		credentials.privateKey
	);

	return `${unsignedToken}.${signature}`;
}
