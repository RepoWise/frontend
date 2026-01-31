import { test, expect } from '@playwright/test'

const getApiBaseUrl = () => {
  const raw = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8000'
  return raw.replace(/\/(api)\/?$/, '')
}

const getHealthUrl = () => {
  const apiBase = getApiBaseUrl()
  return new URL('/api/health', apiBase).toString()
}

test.describe('RepoWise E2E', () => {
  test('backend health check', async ({ request }) => {
    const response = await request.get(getHealthUrl(), { timeout: 10_000 })
    expect(response.ok(), `Backend health check failed at ${getHealthUrl()}`).toBeTruthy()
  })

  test('add repository and ask a question', async ({ page }) => {
    const repoUrl = process.env.E2E_REPO_URL || 'https://github.com/microsoft/TypeScript'
    const question = process.env.E2E_QUESTION || 'What license does this project use?'

    await page.goto('/')

    await page.getByTestId('repo-url-input').fill(repoUrl)
    await page.getByTestId('repo-add-button').click()

    const status = page.getByTestId('repo-indexing-status')
    await expect(status).toHaveAttribute('data-status', 'success', { timeout: 120_000 })

    await expect(page.getByTestId('chat-query-input')).toBeVisible({ timeout: 30_000 })
    await page.getByTestId('chat-query-input').fill(question)
    await page.getByTestId('chat-send-button').click()

    const latestAnswer = page.getByTestId('assistant-answer').last()
    await expect(latestAnswer).toBeVisible({ timeout: 120_000 })
    await expect(latestAnswer).toContainText(/\S+/, { timeout: 120_000 })
  })
})
