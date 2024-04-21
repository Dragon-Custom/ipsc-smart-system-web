export async function delay(ms: number) {
	return await new Promise(r => {
		setTimeout(r, ms);
	});
}

export async function shuffle(array: any[], onSwap?:(srcIndex: number, destIndex: number) => void) {
	let current_index = array.length;

	// While there remain elements to shuffle...
	while (current_index != 0) {

		// Pick a remaining element...
		const randomIndex = Math.floor(Math.random() * current_index);
		current_index--;

		// And swap it with the current element.
		await onSwap?.(current_index, randomIndex);
		[array[current_index], array[randomIndex]] = [
			array[randomIndex], array[current_index]];
	}
	return array;
}
