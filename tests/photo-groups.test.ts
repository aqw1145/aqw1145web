import assert from 'node:assert/strict';
import test from 'node:test';
import { groupPhotos } from '../src/lib/groupPhotos.ts';

test('日期倒序，同一天内归类，不跨日期合并同名分类，也不改变原始数据', () => {
	const photos = Object.freeze([
		Object.freeze({ id: 'old-life', date: '2025-12-31', category: '生活' }),
		Object.freeze({ id: 'new-life', date: '2026-10-18', category: '生活' }),
		Object.freeze({ id: 'middle-trip', date: '2026-09-08', category: '旅行' }),
		Object.freeze({ id: 'new-trip', date: '2026-10-18', category: '旅行' }),
		Object.freeze({ id: 'new-life-2', date: '2026-10-18', category: '生活' }),
	]);
	assert.deepEqual(groupPhotos(photos), [
		{ date: '2026-10-18', categories: [
			{ name: '生活', photos: [photos[1], photos[4]] },
			{ name: '旅行', photos: [photos[3]] },
		] },
		{ date: '2026-09-08', categories: [{ name: '旅行', photos: [photos[2]] }] },
		{ date: '2025-12-31', categories: [{ name: '生活', photos: [photos[0]] }] },
	]);
});

test('分类去掉首尾空格，空分类、null 或省略分类时不设置分类名称', () => {
	const first = { date: '2026-10-18', category: '  旅行  ' };
	const second = { date: '2026-10-18', category: '旅行' };
	const third = { date: '2026-10-18', category: ' ' };
	const fourth = { date: '2026-10-18', category: null };
	const fifth = { date: '2026-10-18' };
	assert.deepEqual(groupPhotos([first, second, third, fourth, fifth]), [{ date: '2026-10-18', categories: [
		{ name: '旅行', photos: [first, second] },
		{ name: '', photos: [third, fourth, fifth] },
	] }]);
});

test('拒绝不规范或不存在的日期，避免静默排错顺序', () => {
	for (const date of ['2026-2-01', '2026-02-30', '2026-13-01', 'not-a-date']) {
		assert.throws(() => groupPhotos([{ date, category: '随拍' }]), /无效的相册日期/);
	}
});

test('空相册返回空日期列表', () => {
	assert.deepEqual(groupPhotos([]), []);
});
