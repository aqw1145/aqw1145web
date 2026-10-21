import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const album = readFileSync(path.join(dist, 'photo/index.html'), 'utf8');
const attributes = (markup) => Object.fromEntries([...markup.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map((match) => [match[1], match[2] ?? '']));
const links = (html) => [...html.matchAll(/<a\b([^>]*)>/g)].map((match) => attributes(match[1]));
const cards = links(album).filter((link) => link.class?.split(' ').includes('album-photo-link'));
const outputPath = (href) => {
	const pathname = decodeURIComponent(new URL(href, 'https://example.test').pathname).replace(/^\//, '');
	return path.join(dist, pathname, 'index.html');
};

test('每张照片都链接到可直接访问的独立详情页，普通点击不强制新标签页', () => {
	assert.ok(cards.length > 0, '相册需要有照片供详情页测试');
	assert.equal(new Set(cards.map((card) => card.href)).size, cards.length, '每张照片应有独立地址');
	for (const card of cards) {
		assert.match(card.href, /^\/photo\/[^/]+\/$/);
		assert.equal(card.target, undefined);
		assert.ok(existsSync(outputPath(card.href)), `缺少详情页：${card.href}`);
		const detail = readFileSync(outputPath(card.href), 'utf8');
		assert.match(detail, /<h1[^>]*>[^<]+<\/h1>/);
		const images = [...detail.matchAll(/<img\b([^>]*)>/g)].map((match) => attributes(match[1]));
		const image = images.find((item) => item.class?.split(' ').includes('album-detail-photo'));
		assert.ok(image?.src && image.alt, '详情页需要直接输出图片和替代文本');
		assert.ok(Math.max(Number(image.width), Number(image.height)) <= 1920);
		assert.ok(existsSync(path.join(dist, image.src.replace(/^\//, ''))));
	}
});

test('详情页用真实链接返回相册首页、切换前后照片并打开原图', () => {
	for (const [index, card] of cards.entries()) {
		const detailLinks = links(readFileSync(outputPath(card.href), 'utf8'));
		assert.equal(detailLinks.find((link) => link.class?.split(' ').includes('album-back'))?.href, '/photo/');
		assert.equal(detailLinks.find((link) => link.rel === 'prev')?.href, cards.length > 1 ? cards[(index - 1 + cards.length) % cards.length].href : undefined);
		assert.equal(detailLinks.find((link) => link.rel === 'next')?.href, cards.length > 1 ? cards[(index + 1) % cards.length].href : undefined);
		const original = detailLinks.find((link) => link.class?.split(' ').includes('album-original'));
		assert.ok(original?.href.startsWith('/_astro/'));
		assert.equal(original.target, '_blank');
		assert.ok(existsSync(path.join(dist, original.href.replace(/^\//, ''))));
	}
});
