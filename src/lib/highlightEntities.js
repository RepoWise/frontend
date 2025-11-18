const CODE_SEGMENT_REGEX = /```[\s\S]*?```|`[^`]*`/g

const ENTITY_REGEX = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(@[A-Za-z0-9_-]+)|(\b[\w./-]+\.(?:md|markdown|mdx|py|pyi|js|jsx|ts|tsx|cjs|mjs|json|yaml|yml|toml|ini|conf|config|lock|txt|csv|html|css|scss|less|sass|rb|go|rs|java|kt|c|h|hpp|cpp|sh|ps1|bat|sql|mdoc|rst|vue|svelte)\b)/gi

const wrapUsername = (value) => `<span class="entity-username">${value}</span>`
const wrapDocument = (value) => `<span class="entity-doc">${value}</span>`

const processSegment = (segment) => {
  if (!segment) return segment

  return segment.replace(ENTITY_REGEX, (match, email, username) => {
    if (email || username) {
      return wrapUsername(match)
    }
    return wrapDocument(match)
  })
}

export const highlightEntities = (text) => {
  if (!text || typeof text !== 'string') {
    return text
  }

  let lastIndex = 0
  const parts = []

  text.replace(CODE_SEGMENT_REGEX, (match, offset) => {
    const preceding = text.slice(lastIndex, offset)
    if (preceding) {
      parts.push(processSegment(preceding))
    }
    parts.push(match)
    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < text.length) {
    parts.push(processSegment(text.slice(lastIndex)))
  }

  if (parts.length === 0) {
    return processSegment(text)
  }

  return parts.join('')
}
