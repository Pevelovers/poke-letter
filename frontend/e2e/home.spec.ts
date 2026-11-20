import { expect, test } from '@playwright/test'

test('랜딩 화면이 열린다', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /크리스마스 메시지/ })).toBeVisible()
})
