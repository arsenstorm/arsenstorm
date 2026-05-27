import { Buffer } from "node:buffer";
import { mkdir, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import process, { env, stderr, stdout } from "node:process";
import { fileURLToPath } from "node:url";

const MAP_SNAPSHOT_ENDPOINT =
	"https://snapshot.apple-mapkit.com/api/v1/snapshot";
const MAP_OUTPUT_DIRECTORY = fileURLToPath(
	new URL("../public/map/", import.meta.url)
);
const MAP_SNAPSHOT_PARAMS = {
	center: "51.5074,-0.1278",
	lang: "en-GB",
	poi: "0",
	scale: "2",
	size: "640x640",
	spn: "0.12,0.16",
	t: "mutedStandard",
} as const;
const SNAPSHOT_THEMES = ["light", "dark"] as const;
const BASE64_URL_PADDING_REGEX = /=+$/;
const PEM_PRIVATE_KEY_END_REGEX = /-----END PRIVATE KEY-----/g;
const PEM_PRIVATE_KEY_START_REGEX = /-----BEGIN PRIVATE KEY-----/g;
const WHITESPACE_REGEX = /\s/g;

type MapSnapshotTheme = (typeof SNAPSHOT_THEMES)[number];

interface MapSnapshotCredentials {
	keyId: string;
	privateKey: string;
	teamId: string;
}

function getRequiredEnvironmentVariable(name: string): string {
	const value = env[name];
	if (!value) {
		throw new Error(`${name} is required to generate Apple Maps snapshots.`);
	}

	return value;
}

function getMapSnapshotCredentials(): MapSnapshotCredentials {
	return {
		keyId: getRequiredEnvironmentVariable("MAPKIT_SNAPSHOT_KEY_ID"),
		privateKey: getRequiredEnvironmentVariable("MAPKIT_SNAPSHOT_PRIVATE_KEY"),
		teamId: getRequiredEnvironmentVariable("APPLE_TEAM_ID"),
	};
}

function privateKeyToArrayBuffer(privateKey: string): ArrayBuffer {
	const base64 = privateKey
		.replaceAll("\\n", "\n")
		.replace(PEM_PRIVATE_KEY_START_REGEX, "")
		.replace(PEM_PRIVATE_KEY_END_REGEX, "")
		.replace(WHITESPACE_REGEX, "");
	const bytes = Buffer.from(base64, "base64");

	return Uint8Array.from(bytes).buffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
	return Buffer.from(bytes)
		.toString("base64")
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(BASE64_URL_PADDING_REGEX, "");
}

async function signMapSnapshotPath(
	path: string,
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
		new TextEncoder().encode(path)
	);

	return base64UrlEncode(new Uint8Array(signature));
}

async function getMapSnapshotUrl(
	theme: MapSnapshotTheme,
	credentials: MapSnapshotCredentials
): Promise<string> {
	const params = new URLSearchParams({
		...MAP_SNAPSHOT_PARAMS,
		colorScheme: theme,
		keyId: credentials.keyId,
		teamId: credentials.teamId,
	});
	const path = `/api/v1/snapshot?${params.toString()}`;
	const signature = await signMapSnapshotPath(path, credentials.privateKey);

	return `${MAP_SNAPSHOT_ENDPOINT}?${params.toString()}&signature=${signature}`;
}

function getMapSnapshotOutputPath(theme: MapSnapshotTheme): string {
	return fileURLToPath(new URL(`../public/map/london-${theme}.png`, import.meta.url));
}

async function fetchMapSnapshot(
	theme: MapSnapshotTheme,
	credentials: MapSnapshotCredentials
): Promise<Uint8Array> {
	const snapshotUrl = await getMapSnapshotUrl(theme, credentials);
	const response = await fetch(snapshotUrl, {
		headers: { accept: "image/png" },
	});
	const contentType = response.headers.get("content-type") ?? "";

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`Unable to fetch ${theme} Apple Maps snapshot: ${response.status} ${body}`
		);
	}

	if (!contentType.startsWith("image/png")) {
		throw new Error(
			`Apple Maps returned ${contentType || "an unknown content type"} for ${theme}.`
		);
	}

	return new Uint8Array(await response.arrayBuffer());
}

async function main(): Promise<void> {
	const credentials = getMapSnapshotCredentials();

	await mkdir(MAP_OUTPUT_DIRECTORY, { recursive: true });

	for (const theme of SNAPSHOT_THEMES) {
		const image = await fetchMapSnapshot(theme, credentials);
		const outputPath = getMapSnapshotOutputPath(theme);
		await writeFile(outputPath, image);
		stdout.write(
			`Generated ${relative(process.cwd(), outputPath)} (${image.byteLength} bytes)\n`
		);
	}
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : "Unknown error";
	stderr.write(`${message}\n`);
	process.exitCode = 1;
});
