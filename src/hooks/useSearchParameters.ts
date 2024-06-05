import { useRouter, useSearchParams } from "next/navigation";




export function useSearchParameters<T>(key: string, defaultValue?: T): [T | undefined, (value: T | undefined) => void] {
	const params = useSearchParams();
	const router = useRouter();
	const searchParams = Object.fromEntries(params);
	function setParam(value: T | undefined) {
		const current = new URLSearchParams(Array.from(params));
		if (value) 
			current.set(key, JSON.stringify(value));
		else 
			current.delete(key);

		// cast to string
		const search = current.toString();
		// or const query = `${'?'.repeat(search.length && 1)}${search}`;
		const query = search ? `?${search}` : "";

		router.push(`${location.pathname}${query}`);
	}

	const parsedValue = searchParams[key] ? JSON.parse(searchParams[key]) : defaultValue;

	return [parsedValue, setParam];
}