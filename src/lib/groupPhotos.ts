export interface DatedPhoto {
	date: string;
	category?: string | null;
}

export interface PhotoDay<T> {
	date: string;
	categories: { name: string; photos: T[] }[];
}

export function groupPhotos<T extends DatedPhoto>(photos: readonly T[]): PhotoDay<T>[] {
	const days = new Map<string, Map<string, T[]>>();
	for (const photo of photos) {
		const parsedDate = new Date(`${photo.date}T00:00:00Z`);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(photo.date) || !Number.isFinite(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== photo.date) {
			throw new Error(`无效的相册日期：${photo.date}，请填写真实的 YYYY-MM-DD 日期。`);
		}
		if (!days.has(photo.date)) days.set(photo.date, new Map());
		const categories = days.get(photo.date)!;
		const category = (photo.category ?? '').trim();
		if (!categories.has(category)) categories.set(category, []);
		categories.get(category)!.push(photo);
	}
	return [...days.entries()]
		.sort(([first], [second]) => second.localeCompare(first))
		.map(([date, categories]) => ({
			date,
			categories: [...categories.entries()].map(([name, entries]) => ({ name, photos: entries })),
		}));
}
