// Example Playwright test for the full flow
import { chromium, test, expect } from '@playwright/test';

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Perform authentication
  await page.goto('/auth/signin');
  await page.getByTestId('userName').fill('adminmida');
  await page.getByTestId('password').fill('admin');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for login to complete
  await expect(page.getByText('CONSOLE')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
  await browser.close();


});

test.beforeEach(async () => {

});


test.describe('Customers E2E Tests:', async () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should display customer list page', async ({ page }) => {

    await page.goto('/console/customers');

    await expect(page.getByText('Customer List')).toBeVisible({ timeout: 15000 });

  });

  test('should display new customer dialog', async ({ page }) => {

    await page.goto('/console/customers');
    await page.getByRole('button', { name: 'New Customer' }).click();

    await expect(page.getByText('Create Customer')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/screenshots/login-fail.png' });

  });

});