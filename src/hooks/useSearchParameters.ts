import { useRouter, useSearchParams } from "next/navigation";




export function useSearchParameters(key: string): [string | undefined, (value: string | undefined) => void] {
	const params = useSearchParams();
	const router = useRouter();
	const searchParams = Object.fromEntries(params);
	function setParam(value: string | undefined) {
		const current = new URLSearchParams(Array.from(params));
		if (value) 
			current.set(key, value);
		else 
			current.delete(key);

		// cast to string
		const search = current.toString();
		// or const query = `${'?'.repeat(search.length && 1)}${search}`;
		const query = search ? `?${search}` : "";

		router.push(`${location.pathname}${query}`);
	}

	return [searchParams[key], setParam];
}