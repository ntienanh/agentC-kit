import { test, expect } from '@playwright/test';

test.describe('Front Office Authentication Flow (shadcn/ui)', () => {
  test('renders login page with security highlights and form inputs', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(400);

    // Verify security highlights
    await expect(page.getByText('Secure enterprise authentication')).toBeVisible();

    // Verify form controls
    const emailInput = page.locator('input[name="identifier"], input[type="email"], #identifier');
    await expect(emailInput.first()).toBeVisible();

    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    await expect(passwordInput.first()).toBeVisible();

    // Verify submit button
    const submitBtn = page.getByRole('button', { name: /Sign In|Log In/i });
    await expect(submitBtn).toBeVisible();

    // Verify links to register and forgot-password
    const registerLink = page.getByRole('link', { name: /Create an account|Sign up|Register/i });
    if (await registerLink.count() > 0) {
      await expect(registerLink.first()).toHaveAttribute('href', /register/);
    }

    const forgotPasswordLink = page.getByRole('link', { name: /Forgot password\?/i });
    if (await forgotPasswordLink.count() > 0) {
      await expect(forgotPasswordLink.first()).toHaveAttribute('href', /forgot-password/);
    }
  });

  test('validates required fields on submitting empty login form', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.getByRole('button', { name: /Sign In|Log In/i });
    await submitBtn.click();

    // Zod / React Hook Form validation errors appear
    const errorText = page.locator('.text-destructive, [role="alert"], p.text-sm');
    await expect(errorText.first()).toBeVisible({ timeout: 3_000 });
  });

  test('renders registration page with form inputs and navigation back to login', async ({ page }) => {
    const response = await page.goto('/register');
    expect(response?.status()).toBeLessThan(400);

    const emailInput = page.locator('input[name="email"], input[name="identifier"], input[type="email"]');
    await expect(emailInput.first()).toBeVisible();

    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    await expect(passwordInput.first()).toBeVisible();

    const signInLink = page.getByRole('link', { name: /Sign in|Log in/i });
    await expect(signInLink.first()).toBeVisible();
  });

  test('redirects unauthenticated users attempting to access /profile to /login', async ({ page }) => {
    await page.goto('/profile');
    // FO gate redirects unauthenticated visitors to login
    await expect(page).toHaveURL(/login/);
  });
});
