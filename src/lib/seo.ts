const SITE_NAME = "Arsen Shkrumelyak";

export function pageMeta(title: string, description: string) {
	return [
		{ title: `${title} | ${SITE_NAME}` },
		{ name: "description", content: description },
	];
}
