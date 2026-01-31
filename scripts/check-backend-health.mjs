const apiBaseEnv = process.env.E2E_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8000'
const apiBase = apiBaseEnv.replace(/\/(api)\/?$/, '')
const healthUrl = new URL('/api/health', apiBase).toString()

const summaryPath = process.env.GITHUB_STEP_SUMMARY

const writeSummary = async (lines) => {
  if (!summaryPath) return
  await import('node:fs/promises').then(({ appendFile }) =>
    appendFile(summaryPath, `${lines.join('\n')}\n`, 'utf8')
  )
}

const abortController = new AbortController()
const timeout = setTimeout(() => abortController.abort(), 10_000)

let ok = false
let errorMessage = ''

try {
  const response = await fetch(healthUrl, { signal: abortController.signal })
  ok = response.ok
  if (!ok) {
    errorMessage = `Backend health check failed with status ${response.status}.`
  }
} catch (error) {
  errorMessage = `Backend health check failed: ${error.message}`
}

clearTimeout(timeout)

if (!ok) {
  const message = `${errorMessage} URL: ${healthUrl}`
  console.error(message)
  console.log(`::error::${message}`)
  await writeSummary([
    '## RepoWise E2E Backend Health Check',
    '',
    `- Status: ❌ Down`,
    `- URL: ${healthUrl}`,
    `- Error: ${errorMessage}`,
  ])
  process.exit(1)
}

await writeSummary([
  '## RepoWise E2E Backend Health Check',
  '',
  `- Status: ✅ Up`,
  `- URL: ${healthUrl}`,
])

console.log(`Backend health check passed: ${healthUrl}`)
