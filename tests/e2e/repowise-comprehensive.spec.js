import { test, expect } from '@playwright/test'

// ============================================================================
// CONFIGURATION
// ============================================================================

const TEST_REPOS = [
  'https://github.com/aws/aws-pgsql-odbc',
  'https://github.com/netflix/hollow',
  'https://github.com/microsoft/lisa',
  'https://github.com/apple/pkl',
  'https://github.com/google/meridian',
]

const TEST_QUESTIONS = [
  // PROJECT_DOC_BASED (8 questions)
  { number: 1, question: 'How do I contribute to this project?', category: 'PROJECT_DOC_BASED' },
  { number: 2, question: 'What is the code of conduct?', category: 'PROJECT_DOC_BASED' },
  { number: 3, question: 'How do I report a security vulnerability?', category: 'PROJECT_DOC_BASED' },
  { number: 4, question: 'What steps should I follow before opening a pull request?', category: 'PROJECT_DOC_BASED' },
  { number: 5, question: 'How are major decisions made in this project?', category: 'PROJECT_DOC_BASED' },
  { number: 6, question: 'What skills or tools do I need to contribute?', category: 'PROJECT_DOC_BASED' },
  { number: 7, question: 'How do I find a good first issue to work on?', category: 'PROJECT_DOC_BASED' },
  { number: 8, question: 'Are there any contribution guidelines?', category: 'PROJECT_DOC_BASED' },

  // COMMITS (6 questions)
  { number: 9, question: 'Who are the top 5 contributors by commit count?', category: 'COMMITS' },
  { number: 10, question: 'Who are the top 10 contributors in the past 6 months?', category: 'COMMITS' },
  { number: 11, question: 'Rank top five files have been modified the most?', category: 'COMMITS' },
  { number: 12, question: 'How many unique contributors are there?', category: 'COMMITS' },
  { number: 13, question: 'Who are the most active contributors?', category: 'COMMITS' },
  { number: 14, question: 'Who contributed to the documentation?', category: 'COMMITS' },

  // ISSUES (4 questions)
  { number: 15, question: 'What are the most commented issues?', category: 'ISSUES' },
  { number: 16, question: 'Who are the most active issue reporters?', category: 'ISSUES' },
  { number: 17, question: 'What are the oldest open issues?', category: 'ISSUES', expectNoResult: true },
  { number: 18, question: 'How quickly are issues being closed?', category: 'ISSUES' },
]

// Questions where NO_RESULT is expected behavior (not a failure)
// Q17: "What are the oldest open issues?" - Many repos don't have open issues matching this query
const EXPECTED_NO_RESULT_QUESTIONS = [17]

// ============================================================================
// FAILURE PATTERNS
// ============================================================================

// SYSTEM_FAILURE: Infrastructure is broken - test should FAIL
// Applies to ALL categories (PROJECT_DOC_BASED, COMMITS, ISSUES)
const SYSTEM_FAILURE_PATTERNS = [
  // PROJECT_DOC_BASED failures (RAG pipeline)
  'no relevant project documents found',

  // LLM failures (Ollama/Mistral)
  'error generating response',
  'could not connect to llm',
  'could not connect to ollama',

  // COMMITS/ISSUES failures (CSV pipeline - infrastructure)
  'could not be fetched for this project',  // API fetch failed
  'llm query generation not available',     // LLM client missing
  'failed safety validation',               // Generated code unsafe
  'query execution failed',                 // Pandas execution error
  'produced unsupported type',              // LLM generated bad code
]

// NO_RESULT: System worked but no data found
// Only applies to COMMITS/ISSUES categories
const NO_RESULT_PATTERNS = [
  'no commits data available',
  'no issues data available',
  'no commits data found matching',
  'no issues data found matching',
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRepoName(repoUrl) {
  const parts = repoUrl.replace('https://github.com/', '').split('/')
  return `${parts[0]}-${parts[1]}`
}

function checkSystemFailure(answerText) {
  const answerLower = answerText.toLowerCase()
  for (const pattern of SYSTEM_FAILURE_PATTERNS) {
    if (answerLower.includes(pattern.toLowerCase())) {
      return { failed: true, pattern }
    }
  }
  return { failed: false, pattern: null }
}

function checkNoResult(answerText) {
  const answerLower = answerText.toLowerCase()
  for (const pattern of NO_RESULT_PATTERNS) {
    if (answerLower.includes(pattern.toLowerCase())) {
      return { noResult: true, pattern }
    }
  }
  return { noResult: false, pattern: null }
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('RepoWise Comprehensive Test Suite', () => {
  // Increase timeout for LLM responses
  test.setTimeout(300_000) // 5 minutes per test

  for (const repoUrl of TEST_REPOS) {
    const repoName = getRepoName(repoUrl)

    test.describe(`Repo: ${repoName}`, () => {

      // ========================================
      // PROJECT_DOC_BASED Tests (8 questions)
      // SYSTEM_FAILURE → FAIL
      // Anti-hallucination responses → PASS (valid)
      // ========================================
      test.describe('PROJECT_DOC_BASED', () => {
        const docQuestions = TEST_QUESTIONS.filter(q => q.category === 'PROJECT_DOC_BASED')

        for (const { number, question } of docQuestions) {
          test(`Q${number}: ${question.substring(0, 40)}...`, async ({ page }) => {
            // Navigate to app
            await page.goto('/')

            // Add repository
            await page.getByTestId('repo-url-input').fill(repoUrl)
            await page.getByTestId('repo-add-button').click()

            // Wait for chat interface (indexing complete)
            await expect(page.getByTestId('chat-query-input')).toBeVisible({ timeout: 180_000 })

            // Ask question
            await page.getByTestId('chat-query-input').fill(question)
            await page.getByTestId('chat-send-button').click()

            // Wait for response
            const latestAnswer = page.getByTestId('assistant-answer').last()
            await expect(latestAnswer).toBeVisible({ timeout: 180_000 })
            await expect(latestAnswer).toContainText(/\S+/, { timeout: 30_000 })

            // Get answer text
            const answerText = await latestAnswer.textContent()

            // Attach metadata to report
            await test.info().attach('Repository', { body: repoUrl, contentType: 'text/plain' })
            await test.info().attach('Question Number', { body: String(number), contentType: 'text/plain' })
            await test.info().attach('Category', { body: 'PROJECT_DOC_BASED', contentType: 'text/plain' })
            await test.info().attach('Question', { body: question, contentType: 'text/plain' })
            await test.info().attach('LLM Response', { body: answerText, contentType: 'text/plain' })

            // Check for SYSTEM_FAILURE (FAIL if detected)
            const systemFailure = checkSystemFailure(answerText)

            await test.info().attach('Result Status', {
              body: systemFailure.failed ? `SYSTEM_FAILURE: ${systemFailure.pattern}` : 'PASS',
              contentType: 'text/plain',
            })

            expect(
              systemFailure.failed,
              `SYSTEM_FAILURE detected: "${systemFailure.pattern}"\nResponse: ${answerText.substring(0, 300)}...`
            ).toBeFalsy()

            // Note: Anti-hallucination responses like "do not contain information" are VALID for PROJECT_DOC_BASED
            // They indicate the system is working correctly but the info isn't in the docs
          })
        }
      })

      // ========================================
      // COMMITS Tests (6 questions)
      // SYSTEM_FAILURE → FAIL
      // NO_RESULT → FAIL (we expect results for these specific questions)
      // HAS_RESULT → PASS
      // ========================================
      test.describe('COMMITS', () => {
        const commitsQuestions = TEST_QUESTIONS.filter(q => q.category === 'COMMITS')

        for (const { number, question } of commitsQuestions) {
          test(`Q${number}: ${question.substring(0, 40)}...`, async ({ page }) => {
            // Navigate to app
            await page.goto('/')

            // Add repository
            await page.getByTestId('repo-url-input').fill(repoUrl)
            await page.getByTestId('repo-add-button').click()

            // Wait for chat interface (indexing complete)
            await expect(page.getByTestId('chat-query-input')).toBeVisible({ timeout: 180_000 })

            // Ask question
            await page.getByTestId('chat-query-input').fill(question)
            await page.getByTestId('chat-send-button').click()

            // Wait for response
            const latestAnswer = page.getByTestId('assistant-answer').last()
            await expect(latestAnswer).toBeVisible({ timeout: 180_000 })
            await expect(latestAnswer).toContainText(/\S+/, { timeout: 30_000 })

            // Get answer text
            const answerText = await latestAnswer.textContent()

            // Attach metadata to report
            await test.info().attach('Repository', { body: repoUrl, contentType: 'text/plain' })
            await test.info().attach('Question Number', { body: String(number), contentType: 'text/plain' })
            await test.info().attach('Category', { body: 'COMMITS', contentType: 'text/plain' })
            await test.info().attach('Question', { body: question, contentType: 'text/plain' })
            await test.info().attach('LLM Response', { body: answerText, contentType: 'text/plain' })

            // Check for SYSTEM_FAILURE (FAIL if detected)
            const systemFailure = checkSystemFailure(answerText)
            if (systemFailure.failed) {
              await test.info().attach('Result Status', {
                body: `SYSTEM_FAILURE: ${systemFailure.pattern}`,
                contentType: 'text/plain',
              })
              expect(
                false,
                `SYSTEM_FAILURE detected: "${systemFailure.pattern}"\nResponse: ${answerText.substring(0, 300)}...`
              ).toBeTruthy()
              return
            }

            // Check for NO_RESULT (FAIL if detected - we expect results for these questions)
            const noResult = checkNoResult(answerText)

            await test.info().attach('Result Status', {
              body: noResult.noResult ? `NO_RESULT: ${noResult.pattern}` : 'HAS_RESULT',
              contentType: 'text/plain',
            })

            expect(
              noResult.noResult,
              `NO_RESULT detected for expected COMMITS question Q${number}: "${noResult.pattern}"\nResponse: ${answerText.substring(0, 300)}...`
            ).toBeFalsy()
          })
        }
      })

      // ========================================
      // ISSUES Tests (4 questions)
      // SYSTEM_FAILURE → FAIL
      // NO_RESULT → FAIL (except for Q17 where NO_RESULT is expected)
      // HAS_RESULT → PASS
      // ========================================
      test.describe('ISSUES', () => {
        const issuesQuestions = TEST_QUESTIONS.filter(q => q.category === 'ISSUES')

        for (const { number, question } of issuesQuestions) {
          test(`Q${number}: ${question.substring(0, 40)}...`, async ({ page }) => {
            // Navigate to app
            await page.goto('/')

            // Add repository
            await page.getByTestId('repo-url-input').fill(repoUrl)
            await page.getByTestId('repo-add-button').click()

            // Wait for chat interface (indexing complete)
            await expect(page.getByTestId('chat-query-input')).toBeVisible({ timeout: 180_000 })

            // Ask question
            await page.getByTestId('chat-query-input').fill(question)
            await page.getByTestId('chat-send-button').click()

            // Wait for response
            const latestAnswer = page.getByTestId('assistant-answer').last()
            await expect(latestAnswer).toBeVisible({ timeout: 180_000 })
            await expect(latestAnswer).toContainText(/\S+/, { timeout: 30_000 })

            // Get answer text
            const answerText = await latestAnswer.textContent()

            // Check if this question expects NO_RESULT as valid
            const expectsNoResult = EXPECTED_NO_RESULT_QUESTIONS.includes(number)

            // Attach metadata to report
            await test.info().attach('Repository', { body: repoUrl, contentType: 'text/plain' })
            await test.info().attach('Question Number', { body: String(number), contentType: 'text/plain' })
            await test.info().attach('Category', { body: 'ISSUES', contentType: 'text/plain' })
            await test.info().attach('Question', { body: question, contentType: 'text/plain' })
            await test.info().attach('LLM Response', { body: answerText, contentType: 'text/plain' })
            await test.info().attach('Expects NO_RESULT', { body: String(expectsNoResult), contentType: 'text/plain' })

            // Check for SYSTEM_FAILURE (FAIL if detected)
            const systemFailure = checkSystemFailure(answerText)
            if (systemFailure.failed) {
              await test.info().attach('Result Status', {
                body: `SYSTEM_FAILURE: ${systemFailure.pattern}`,
                contentType: 'text/plain',
              })
              expect(
                false,
                `SYSTEM_FAILURE detected: "${systemFailure.pattern}"\nResponse: ${answerText.substring(0, 300)}...`
              ).toBeTruthy()
              return
            }

            // Check for NO_RESULT
            const noResult = checkNoResult(answerText)

            if (expectsNoResult) {
              // For Q17: NO_RESULT is expected and valid
              await test.info().attach('Result Status', {
                body: noResult.noResult ? 'EXPECTED_NO_RESULT (PASS)' : 'HAS_RESULT (PASS)',
                contentType: 'text/plain',
              })
              // Both NO_RESULT and HAS_RESULT are acceptable for this question
              // Test passes as long as no SYSTEM_FAILURE occurred
            } else {
              // For other questions: NO_RESULT means FAIL
              await test.info().attach('Result Status', {
                body: noResult.noResult ? `NO_RESULT: ${noResult.pattern}` : 'HAS_RESULT',
                contentType: 'text/plain',
              })

              expect(
                noResult.noResult,
                `NO_RESULT detected for expected ISSUES question Q${number}: "${noResult.pattern}"\nResponse: ${answerText.substring(0, 300)}...`
              ).toBeFalsy()
            }
          })
        }
      })
    })
  }
})
