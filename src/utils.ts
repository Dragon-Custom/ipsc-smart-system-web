export async function delay(ms: number) {
	return await new Promise(r => {
		setTimeout(r, ms);
	});
}