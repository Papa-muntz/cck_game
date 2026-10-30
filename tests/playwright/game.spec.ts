import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page).toHaveTitle(/ПРОТОКОЛ: ПЕРЕЗАПУСК/);
});

test('join route renders', async ({ page }) => {
  await page.goto('http://localhost:5173/join');
  await expect(page.locator('h2')).toContainText('Регистрация');
});
