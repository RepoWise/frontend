// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Question Verification Tests
 * Tests all "After-Answer Related Questions" from the ChatInterface questionBank
 * to verify which questions RepoWise can successfully answer.
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.E2E_API_BASE_URL || 'http://localhost:8000';
const TEST_REPO = 'https://github.com/facebook/react';

// System failure patterns that indicate RepoWise couldn't answer
const SYSTEM_FAILURE_PATTERNS = [
  'no relevant project documents found',
  'error generating response',
  'could not connect to llm',
  'could not connect to ollama',
  'unable to process',
  'no data available',
  'could not find',
  'i don\'t have access',
  'i cannot access',
  'no commit data',
  'no issue data',
  'failed to retrieve',
];

// All questions from the After-Answer questionBank
const QUESTIONS_TO_TEST = {
  governance: [
    'How can I start contributing?',
    'What is the license of this project?',
    'What are the required steps before submitting a pull request?',
    'How do I report a security vulnerability?'
  ],
  commits: [
    'Who are the three most active committers?',
    'What are the five latest commits?',
    'Which files have the highest total lines added across all commits?'
  ],
  issues: [
    'How many open vs closed issues are there?',
    'What are the three most recently updated issues?',
    'Which issue has the highest comment count?'
  ]
};

// Store test results
const testResults = {
  passed: [],
  failed: [],
  errors: []
};

test.describe('Question Verification Tests', () => {
  test.setTimeout(300000); // 5 minutes total timeout

  test.beforeAll(async ({ request }) => {
    // Check backend health
    try {
      const response = await request.get(`${API_BASE_URL}/api/health`);
      expect(response.ok()).toBeTruthy();
      console.log('✓ Backend is healthy');
    } catch (error) {
      console.error('✗ Backend health check failed:', error.message);
      throw new Error('Backend is not available. Please start the backend server.');
    }
  });

  // Test each category of questions
  for (const [category, questions] of Object.entries(QUESTIONS_TO_TEST)) {
    test.describe(`${category.toUpperCase()} Questions`, () => {
      for (const question of questions) {
        test(`Should answer: "${question}"`, async ({ page }) => {
          test.setTimeout(120000); // 2 minutes per question

          // Navigate to the app with the test repo
          await page.goto(`${BASE_URL}/?repo=${encodeURIComponent(TEST_REPO)}`);

          // Wait for the page to load and repository to be indexed
          await page.waitForLoadState('networkidle');

          // Wait for the chat input to be available
          const chatInput = page.getByTestId('chat-query-input');
          await expect(chatInput).toBeVisible({ timeout: 60000 });

          // Type the question
          await chatInput.fill(question);

          // Click send button
          const sendButton = page.getByTestId('chat-send-button');
          await sendButton.click();

          // Wait for the assistant response
          const assistantMessage = page.getByTestId('assistant-message').last();
          await expect(assistantMessage).toBeVisible({ timeout: 90000 });

          // Get the answer text
          const answerElement = page.getByTestId('assistant-answer').last();
          await expect(answerElement).toBeVisible({ timeout: 10000 });

          const answerText = await answerElement.textContent();
          const answerLower = answerText.toLowerCase();

          // Check for system failures
          let isFailure = false;
          let failureReason = '';

          for (const pattern of SYSTEM_FAILURE_PATTERNS) {
            if (answerLower.includes(pattern.toLowerCase())) {
              isFailure = true;
              failureReason = pattern;
              break;
            }
          }

          // Log result
          const result = {
            category,
            question,
            passed: !isFailure,
            failureReason: isFailure ? failureReason : null,
            answerPreview: answerText.substring(0, 200) + (answerText.length > 200 ? '...' : '')
          };

          if (isFailure) {
            testResults.failed.push(result);
            console.log(`✗ FAILED: "${question}"`);
            console.log(`  Reason: ${failureReason}`);
          } else {
            testResults.passed.push(result);
            console.log(`✓ PASSED: "${question}"`);
          }

          // Attach result to test report
          test.info().attach(`Result: ${question}`, {
            body: JSON.stringify(result, null, 2),
            contentType: 'application/json'
          });

          // Assert the test passed
          expect(isFailure, `Question failed with: ${failureReason}`).toBeFalsy();
        });
      }
    });
  }
});

test.afterAll(async () => {
  // Print summary
  console.log('\n========================================');
  console.log('        QUESTION VERIFICATION SUMMARY');
  console.log('========================================\n');

  console.log(`Total Questions Tested: ${testResults.passed.length + testResults.failed.length}`);
  console.log(`✓ Passed: ${testResults.passed.length}`);
  console.log(`✗ Failed: ${testResults.failed.length}`);

  if (testResults.passed.length > 0) {
    console.log('\n--- PASSED QUESTIONS ---');
    for (const result of testResults.passed) {
      console.log(`  [${result.category}] ${result.question}`);
    }
  }

  if (testResults.failed.length > 0) {
    console.log('\n--- FAILED QUESTIONS ---');
    for (const result of testResults.failed) {
      console.log(`  [${result.category}] ${result.question}`);
      console.log(`    Reason: ${result.failureReason}`);
    }
  }

  console.log('\n========================================\n');
});
