import { test, expect } from '@playwright/test'

test('individual registration form renders', async ({ page }) => {
  await page.goto('/register/individual')
  await expect(page.getByLabel('HKID')).toBeVisible()
  await expect(page.getByLabel('Legal name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
})

test('guest registration form renders', async ({ page }) => {
  await page.goto('/register/guest')
  await expect(page.getByLabel('Legal name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
})
