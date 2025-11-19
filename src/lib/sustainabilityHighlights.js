const CODE_SEGMENT_REGEX = /```[\s\S]*?```|`[^`]*`/g

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const SUSTAINABILITY_TERMS = {
  green: [
    'sustainably maintained',
    'active and healthy community',
    'vibrant contributor ecosystem',
    'diverse contributor base',
    'distributed maintainer team',
    'long-term maintainer engagement',
    'stable release cadence',
    'predictable release cycle',
    'regular maintenance releases',
    'high bus factor',
    'well-defined governance model',
    'transparent governance',
    'active technical steering committee',
    'responsive maintainers',
    'high issue response rate',
    'high pull request response rate',
    'healthy code review culture',
    'clear contribution guidelines',
    'well-maintained documentation',
    'onboarding-friendly documentation',
    'active onboarding of new contributors',
    'growing contributor base',
    'backed by multiple organizations',
    'diversified funding sources',
    'long-term institutional support',
    'strong community governance',
    'good issue hygiene',
    'low open issue backlog',
    'timely security patching',
    'proactive security practices',
    'mature release engineering'
  ],
  red: [
    'single maintainer dependency',
    'bus factor 1',
    'critical single point of failure',
    'project is effectively unmaintained',
    'abandoned project',
    'no active maintainers',
    'no recent commits',
    'stagnant repository',
    'long-term inactivity',
    'critical maintainer burnout risk',
    'maintainer burnout',
    'unaddressed critical issues',
    'security issues are not being addressed',
    'unpatched security vulnerabilities',
    'known CVEs without fixes',
    'no security response process',
    'no active governance',
    'governance vacuum',
    'no documented governance model',
    'severe decline in core contributor activity',
    'abrupt decline in core contributor activity',
    'toxic community interactions',
    'hostile community dynamics',
    'license compliance risk',
    'no clear license',
    'license mismatch with dependencies',
    'no long-term funding',
    'funding cliff',
    'organizational withdrawal',
    'critical dependency risk',
    'orphaned dependency'
  ],
  yellow: [
    'declining contributor activity',
    'slowly shrinking contributor base',
    'emerging contributor fatigue',
    'infrequent releases',
    'slowing release cadence',
    'aging open pull requests',
    'aging open issues',
    'increasing issue backlog',
    'growing maintenance backlog',
    'limited maintainer pool',
    'over-reliance on a small maintainer group',
    'over-reliance on a single organization',
    'low responsiveness to pull requests',
    'slow issue triage',
    'ad hoc governance',
    'informal decision-making',
    'no clear succession plan',
    'unclear roadmap',
    'unpredictable roadmap delivery',
    'fragmented community',
    'community engagement is plateauing',
    'declining stars and forks',
    'usage growing faster than maintainer capacity',
    'early signs of maintainer overload',
    'emerging sustainability concerns'
  ]
}

export const SUSTAINABILITY_COLORS = {
  green: '#16a34a',
  yellow: '#eab308',
  red: '#dc2626'
}

export const SUSTAINABILITY_LEGEND = [
  {
    color: 'green',
    label: 'Healthy signals',
    description: 'Low-risk sustainability posture'
  },
  {
    color: 'yellow',
    label: 'Needs attention',
    description: 'Emerging or moderate concerns'
  },
  {
    color: 'red',
    label: 'High risk',
    description: 'Critical sustainability issues'
  }
]

const buildRegex = (terms) => {
  const uniqueTerms = Array.from(new Set(terms.map((term) => term.trim()).filter(Boolean)))
  if (uniqueTerms.length === 0) return null
  const sorted = uniqueTerms.sort((a, b) => b.length - a.length)
  const pattern = sorted.map(escapeRegex).join('|')
  return new RegExp(`\\b(${pattern})\\b`, 'gi')
}

const TERM_PATTERNS = Object.entries(SUSTAINABILITY_TERMS)
  .map(([color, terms]) => ({ color, regex: buildRegex(terms) }))
  .filter((entry) => entry.regex)

const isInsideHtmlTag = (text, index) => {
  const lastOpen = text.lastIndexOf('<', index)
  if (lastOpen === -1) return false
  const lastClose = text.lastIndexOf('>', index)
  return lastClose < lastOpen
}

const applyHighlights = (segment) => {
  if (!segment) return segment

  return TERM_PATTERNS.reduce((result, { color, regex }) => {
    return result.replace(regex, (match, _group, offset, str) => {
      if (isInsideHtmlTag(str, offset)) {
        return match
      }
      return `<span class="sustainability-${color}">${match}</span>`
    })
  }, segment)
}

export const highlightSustainabilityTerms = (text) => {
  if (!text || typeof text !== 'string') {
    return text
  }

  let lastIndex = 0
  const parts = []

  text.replace(CODE_SEGMENT_REGEX, (match, offset) => {
    const preceding = text.slice(lastIndex, offset)
    if (preceding) {
      parts.push(applyHighlights(preceding))
    }
    parts.push(match)
    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < text.length) {
    parts.push(applyHighlights(text.slice(lastIndex)))
  }

  if (parts.length === 0) {
    return applyHighlights(text)
  }

  return parts.join('')
}
