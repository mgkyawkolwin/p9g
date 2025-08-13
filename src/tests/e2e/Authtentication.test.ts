// Example Playwright test for the full flow
import { test, expect } from '@playwright/test';

test('should failed sign in', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByTestId('userName').fill('invaliduser');
    await page.getByTestId('password').fill('invalid password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.locator('[data-sonner-toast]')).toContainText('Invalid username and password');
});

test('should pass sign in', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByTestId('userName').fill('testuser');
    await page.getByTestId('password').fill('testpwd');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('CONSOLE')).toBeVisible({timeout: 15000});
});