const CODE_FENCE_REGEX = /```[\s\S]*?```/g

const SECTION_HEADINGS = [
  'Summary',
  'Overview',
  'Highlights',
  'What changed',
  'Steps',
  'How to run',
  'Commands',
  'Testing',
  'Requirements',
  'Notes',
  'Details',
  'Resources',
  'Links',
  'Follow-up',
  'Troubleshooting'
]

const COMMAND_KEYWORDS = [
  'npm',
  'yarn',
  'pnpm',
  'pip',
  'pip3',
  'python',
  'python3',
  'git',
  'docker',
  'make',
  'npx',
  'act',
  'uvicorn',
  'cargo',
  'bundle',
  'rails'
]

const applyOutsideCode = (text, pattern, replacer) => {
  if (!text) return text

  let lastIndex = 0
  const parts = []

  text.replace(CODE_FENCE_REGEX, (match, offset) => {
    const preceding = text.slice(lastIndex, offset)
    if (preceding) {
      parts.push(preceding.replace(pattern, replacer))
    }
    parts.push(match)
    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex).replace(pattern, replacer))
  }

  if (parts.length === 0) {
    return text.replace(pattern, replacer)
  }

  return parts.join('')
}

const formatSectionHeadings = (text) => {
  const pattern = new RegExp(`(^|\n)(${SECTION_HEADINGS.join('|')}):`, 'gi')
  return applyOutsideCode(text, pattern, (_match, prefix, title) => `${prefix}### ${title}\n`)
}

const formatLinkBlocks = (text) => {
  const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi
  return applyOutsideCode(
    text,
    markdownLinkPattern,
    (_match, label, url) =>
      `\n<div class="rw-link-block">\n  <div class="rw-link-title">📄 ${label}</div>\n  <div class="rw-link-url">${url}</div>\n</div>\n`
  )
}

const formatCommandBlocks = (text) => {
  const keywords = COMMAND_KEYWORDS.join('|')
  const commandPattern = new RegExp(`(^|\n)(?:-\s+)?(?:\$\s*)?((${keywords})[^\n]*)`, 'gmi')

  return applyOutsideCode(text, commandPattern, (_match, prefix, command) => {
    const cleaned = command.replace(/^\$\s*/, '').trim()
    return `${prefix}\n\n\`\`\`bash\n${cleaned}\n\`\`\`\n\n`
  })
}

const formatInlineCode = (text) => {
  const filePattern = /\b([\w./-]+\.(?:md|markdown|mdx|py|pyi|js|jsx|ts|tsx|cjs|mjs|json|yaml|yml|toml|ini|conf|config|lock|txt|csv|html|css|scss|less|sass|rb|go|rs|java|kt|c|h|hpp|cpp|sh|ps1|bat|sql|mdoc|rst|vue|svelte))\b/gi

  return applyOutsideCode(text, filePattern, (match) => `\`${match}\``)
}

const formatDetailsBlocks = (text) => {
  const detailsPattern = /(^|\n)(More details|Additional context):\s*\n+/gi
  return applyOutsideCode(text, detailsPattern, (_match, prefix, label) => `${prefix}<details>\n<summary>${label}</summary>\n\n`)
}

const closeDetailsBlocks = (text) => {
  if (!text.includes('<details>')) return text
  const lines = text.split('\n')
  const stack = []
  const result = []

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('<details')) {
      stack.push(true)
      result.push(line)
      return
    }

    if (stack.length && /^###\s+/i.test(trimmed)) {
      result.push('</details>\n')
      stack.pop()
    }

    result.push(line)
  })

  while (stack.length) {
    result.push('</details>')
    stack.pop()
  }

  return result.join('\n')
}

const normalizeSpacing = (text) =>
  text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(### [^\n]+)\n(?!\n)/g, '$1\n\n')
    .trim()

export const formatResponseLayout = (text) => {
  if (!text || typeof text !== 'string') return text

  const withHeadings = formatSectionHeadings(text)
  const withCommands = formatCommandBlocks(withHeadings)
  const withLinks = formatLinkBlocks(withCommands)
  const withInlineCode = formatInlineCode(withLinks)
  const withDetails = formatDetailsBlocks(withInlineCode)
  const closedDetails = closeDetailsBlocks(withDetails)

  return normalizeSpacing(closedDetails)
}

