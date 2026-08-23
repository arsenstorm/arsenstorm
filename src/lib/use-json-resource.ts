import { useEffect, useState } from "react";

export type JsonResource<T> =
	| { data: null; status: "loading" | "unavailable" }
	| { data: T; status: "ready" };

export function useJsonResource<T>(url: string): JsonResource<T> {
	const [resource, setResource] = useState<JsonResource<T>>({
		data: null,
		status: "loading",
	});

	useEffect(() => {
		const controller = new AbortController();

		async function load() {
			const response = await fetch(url, { signal: controller.signal });

			if (!response.ok) {
				setResource({ data: null, status: "unavailable" });
				return;
			}

			const data = (await response.json()) as T;
			setResource({ data, status: "ready" });
		}

		load().catch(() => {
			if (controller.signal.aborted) {
				return;
			}

			setResource({ data: null, status: "unavailable" });
		});

		return () => {
			controller.abort();
		};
	}, [url]);

	return resource;
}
