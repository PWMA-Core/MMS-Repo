import { test, expect } from '@playwright/test'

test('individual registration form renders', async ({ page }) => {
  await page.goto('/register/individual')
  await expect(page.getByLabel('HKID')).toBeVisible()
  await expect(page.getByLabel('Legal name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
})

test('firm admin registration form has two tabs', async ({ page }) => {
  await page.goto('/register/firm-admin')
  await expect(page.getByRole('tab', { name: /Firm details/i })).toBeVisible()
  await expect(page.getByRole('tab', { name: /Your profile/i })).toBeVisible()
})

test('guest registration form renders', async ({ page }) => {
  await page.goto('/register/guest')
  await expect(page.getByLabel('Legal name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
})
