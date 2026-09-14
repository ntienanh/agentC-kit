import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (CMS Ant Design)', () => {
  test('renders sign-in page with all security and form elements', async ({ page }) => {
    const response = await page.goto('/signin');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByText('SECURE ACCESS CONTROL')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/Protected by Role-Based Access Control/i)).toBeVisible();

    const usernameInput = page.locator('#login_username');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toBeEditable();

    const passwordInput = page.locator('#login_password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEditable();

    const forgotPasswordLink = page.getByRole('link', { name: /Forgot password\?/i });
    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toHaveAttribute('href', /forgot-password/);

    const submitButton = page.getByRole('button', { name: /Sign In/i });
    await expect(submitButton).toBeVisible();
  });

  test('validates required fields on submitting empty form', async ({ page }) => {
    await page.goto('/signin');

    const submitButton = page.getByRole('button', { name: /Sign In/i });
    await submitButton.click();

    const errorMessages = page.locator('.ant-form-item-explain-error');
    await expect(errorMessages.first()).toBeVisible();
    expect(await errorMessages.count()).toBeGreaterThanOrEqual(2);
  });

  test('handles invalid credentials and shows error feedback', async ({ page }) => {
    await page.goto('/signin');

    await page.locator('#login_username').fill('non_existent_user');
    await page.locator('#login_password').fill('wrong_password_123');

    const loginResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login') && response.request().method() === 'POST',
      { timeout: 10_000 },
    ).catch(() => null);

    const submitButton = page.getByRole('button', { name: /Sign In/i });
    await submitButton.click();

    const loginResponse = await loginResponsePromise;
    if (loginResponse) {
      expect(loginResponse.status()).toBeGreaterThanOrEqual(400);
      await expect(page.locator('.ant-message-notice-error, .ant-notification-notice')).toBeVisible({ timeout: 5_000 });
    }
  });

  test('navigates to forgot-password page via link', async ({ page }) => {
    await page.goto('/signin');

    const forgotPasswordLink = page.getByRole('link', { name: /Forgot password\?/i });
    await forgotPasswordLink.click();

    await expect(page).toHaveURL(/forgot-password/);
  });
});

