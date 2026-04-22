import { test, expect } from '@playwright/test'

test('landing page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /PWMA Membership/i })).toBeVisible()
})

test('sign-up page lists three registration paths', async ({ page }) => {
  await page.goto('/sign-up')
  await expect(page.getByRole('link', { name: /Individual member/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Firm admin/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Guest/i })).toBeVisible()
})
