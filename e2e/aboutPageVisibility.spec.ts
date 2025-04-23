import { test, expect } from '@playwright/test';

test('about page visibility', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page.getByRole('heading', { name: 'This is an about page' })).toBeVisible();
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: 'This is an about page' })).toBeHidden();
});
