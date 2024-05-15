import { useLocalStorage } from "@uidotdev/usehooks";



export interface Setting {
	darkMode: boolean;
}

export function useLocalSetting() {
	const [setting, saveSetting] = useLocalStorage<Setting>("setting", {
		darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
	});

	return {
		setting,
		saveSetting,
	};
}