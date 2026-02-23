import { test, expect } from '@playwright/test'

const getApiBaseUrl = () => {
  const raw = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8000'
  return raw.replace(/\/(api)\/?$/, '')
}

const getHealthUrl = () => {
  const apiBase = getApiBaseUrl()
  return new URL('/api/health', apiBase).toString()
}

// System failure patterns that indicate infrastructure problems (NOT valid responses)
// These should NEVER appear in a successful response
const SYSTEM_FAILURE_PATTERNS = [
  'no relevant project documents found',
  'error generating response',
  'could not connect to llm',
  'could not connect to ollama',
]

test.describe('RepoWise E2E', () => {
  test('backend health check', async ({ request }) => {
    const response = await request.get(getHealthUrl(), { timeout: 10_000 })
    expect(response.ok(), `Backend health check failed at ${getHealthUrl()}`).toBeTruthy()
  })

  test('add repository and ask a question', async ({ page }) => {
    const repoUrl = process.env.E2E_REPO_URL || 'https://github.com/google/meridian'
    const question = process.env.E2E_QUESTION || 'What license does this project use?'

    await page.goto('/')

    await page.getByTestId('repo-url-input').fill(repoUrl)
    await page.getByTestId('repo-add-button').click()

    // Wait for chat interface to be ready (indicates successful indexing)
    // This handles both new repos (shows success status then transitions) and
    // already-indexed repos (transitions immediately to chat)
    await expect(page.getByTestId('chat-query-input')).toBeVisible({ timeout: 120_000 })
    await page.getByTestId('chat-query-input').fill(question)
    await page.getByTestId('chat-send-button').click()

    const latestAnswer = page.getByTestId('assistant-answer').last()
    await expect(latestAnswer).toBeVisible({ timeout: 180_000 })  // 3 min for slow LLM
    await expect(latestAnswer).toContainText(/\S+/, { timeout: 30_000 })

    // Verify no system failures occurred
    // This checks that the response is not an error message from:
    // - Missing context/documents (crawling/indexing failure)
    // - LLM connection issues (Ollama not running)
    // - LLM generation errors (timeout, crash, etc.)
    const answerText = await latestAnswer.textContent()
    const answerLower = answerText.toLowerCase()

    // Attach the question and response to the HTML report for visibility
    await test.info().attach('Question Asked', {
      body: question,
      contentType: 'text/plain',
    })
    await test.info().attach('LLM Response', {
      body: answerText,
      contentType: 'text/plain',
    })

    for (const pattern of SYSTEM_FAILURE_PATTERNS) {
      expect(
        answerLower.includes(pattern),
        `System failure detected: Response contains "${pattern}"\nFull response: ${answerText.substring(0, 200)}...`
      ).toBeFalsy()
    }
  })
})
