import { test, expect } from '@playwright/test';

test.describe('Home Page (Front Office)', () => {
  test('renders home page and verifies core DOM elements', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);

    const heading = page.getByRole('heading', { name: /Modern Client Portal/i });
    await expect(heading).toBeVisible();

    const signInButton = page.getByRole('link', { name: /Sign In to Portal/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveAttribute('href', '/login');

    const adminCmsButton = page.getByRole('link', { name: /Open Admin CMS/i });
    await expect(adminCmsButton).toBeVisible();

    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();
    await expect(page.getByText('Next.js 16 App Router')).toBeVisible();
    await expect(page.getByText('BFF API Routes')).toBeVisible();
    await expect(page.getByText('shadcn/ui & Zod')).toBeVisible();

    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('navigates to login page via call-to-action button', async ({ page }) => {
    await page.goto('/');
    const signInButton = page.getByRole('link', { name: /Sign In to Portal/i });
    await signInButton.click();
    await expect(page).toHaveURL(/\/login/);
  });
});

