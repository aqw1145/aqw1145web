import type { ImageMetadata } from 'astro';
import { srcDir } from 'astro:config/server';
import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Photo {
	id: string;
	image: ImageMetadata;
	filename: string;
	title: string;
	alt: string;
	date: string;
	category: string | null;
	description?: string;
}

// 原有照片保留入册日期；新照片默认使用文件修改日期，不推断拍摄日期。
const addedDate = '2026-10-21';
export const albumDateNote = null;

// 可选：按相对文件路径覆盖默认信息。只复制图片也会自动入册，无需逐张 import。
// 已配置照片按此处的顺序展示；其余照片按路径排序，日期分组仍由 groupPhotos 处理。
export const photoOverrides: Record<string, Partial<Omit<Photo, 'image' | 'filename'>>> = {
	
};

const imageModules = import.meta.glob<ImageMetadata>(
	'../content/photos/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}',
	{ eager: true, import: 'default' },
);
const photoDirectory = fileURLToPath(new URL('content/photos/', srcDir));
const configuredOrder = new Map(Object.keys(photoOverrides).map((file, index) => [file, index]));
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
});

function fileDate(relativePath: string): string {
	const parts = dateFormatter.formatToParts(statSync(join(photoDirectory, relativePath)).mtime);
	const value = (type: string) => parts.find((part) => part.type === type)!.value;
	return `${value('year')}-${value('month')}-${value('day')}`;
}

export const photos: Photo[] = Object.entries(imageModules)
	.map(([path, image]) => ({ relativePath: path.slice('../content/photos/'.length), image }))
	.sort((first, second) =>
		(configuredOrder.get(first.relativePath) ?? Number.MAX_SAFE_INTEGER) - (configuredOrder.get(second.relativePath) ?? Number.MAX_SAFE_INTEGER)
		|| first.relativePath.localeCompare(second.relativePath, 'zh-CN'),
	)
	.map(({ relativePath, image }) => {
		const segments = relativePath.split('/');
		const filename = segments.at(-1)!;
		const stem = filename.replace(/\.[^.]+$/, '');
		const title = stem.replace(/[_-]+/g, ' ').trim() || '未命名照片';
		const slug = stem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photo';
		// 路径摘要区分同名、不同扩展名的图片，新增其他图片不会改变已有自动地址。
		const suffix = createHash('sha256').update(relativePath).digest('hex').slice(0, 12);
		const overrides = photoOverrides[relativePath];
		return {
			id: `${slug}-${suffix}`,
			image,
			filename,
			title,
			alt: `照片：${overrides?.title ?? title}`,
			date: overrides?.date ?? fileDate(relativePath),
			// 根目录默认无分类，子目录使用直接所在的文件夹名；手动配置可覆盖。
			category: segments.length > 1 ? segments.at(-2)! : null,
			...overrides,
		};
	});
