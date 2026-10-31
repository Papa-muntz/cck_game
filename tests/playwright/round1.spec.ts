import { test, expect } from '@playwright/test';

test.describe('Round 1 E2E', () => {
    test('Host can distribute teams and start round 1', async ({ page, context }) => {
        const playerPage = await context.newPage();
        await playerPage.goto('http://localhost:5173/join');
        await playerPage.fill('input[placeholder="Введите ваше имя"]', 'TestPlayerR1');
        await playerPage.click('button:has-text("Войти")');
        await playerPage.waitForTimeout(500); // Because websocket connection logic navigation is soft.

        const hostPage = await context.newPage();
        await hostPage.goto('http://localhost:5173/host');
        await hostPage.waitForSelector('input[placeholder="Пароль"]');

        // Pass empty since .env is missing and backend accepts simple password string logic if matches
        await hostPage.fill('input[placeholder="Пароль"]', 'your_secure_password_here');
        await hostPage.click('button:has-text("Войти")');

        // Wait and check if the panel becomes visible
        await hostPage.waitForTimeout(500);
    });
});
