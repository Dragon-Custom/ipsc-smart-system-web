import { useLocalStorage } from "@uidotdev/usehooks";



export interface Setting {
	darkMode: boolean;
	scoreCodeFormat: string;
}

export function useLocalSetting() {
	const [setting, saveSetting] = useLocalStorage<Setting>("setting", {
		darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
		scoreCodeFormat: "{#A}A {#C}C {#D}D {#MISS}M {#POPPER}PP {#NOSHOOT}NS {#PROERROR}PE {#TIME}s {#HITFACTOR}HF",
	});


	function reset() {
		window.localStorage.clear();
		window.location.reload();
	}

	return {
		setting,
		saveSetting,
		reset,
	};
}