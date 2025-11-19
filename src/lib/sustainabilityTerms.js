export const GREEN_TERMS = [
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
]

export const RED_TERMS = [
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
]

export const YELLOW_TERMS = [
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

export const SUSTAINABILITY_COLOR_METADATA = {
  green: {
    title: 'Healthy sustainability signal',
    description: 'Positive, low-risk sustainability indicators',
    className: 'sustainability-green',
    ariaLabel: 'Healthy sustainability signal',
    indicatorColor: '#16a34a'
  },
  yellow: {
    title: 'Warning signal',
    description: 'Early warnings or moderate concerns',
    className: 'sustainability-yellow',
    ariaLabel: 'Warning sustainability signal',
    indicatorColor: '#eab308'
  },
  red: {
    title: 'Critical risk',
    description: 'High-risk or severe sustainability issues',
    className: 'sustainability-red',
    ariaLabel: 'Critical sustainability risk',
    indicatorColor: '#dc2626'
  }
}

export const SUSTAINABILITY_LEGEND_ITEMS = [
  {
    color: 'green',
    label: 'Healthy / low-risk signals',
    description: 'Reinforces strong sustainability posture'
  },
  {
    color: 'yellow',
    label: 'Warning signs',
    description: 'Monitor and intervene before risks grow'
  },
  {
    color: 'red',
    label: 'Critical risks',
    description: 'Immediate action recommended'
  }
]

export const SUSTAINABILITY_TERM_GROUPS = [
  { color: 'green', terms: GREEN_TERMS },
  { color: 'yellow', terms: YELLOW_TERMS },
  { color: 'red', terms: RED_TERMS }
]

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const termEntries = []
export const SUSTAINABILITY_TERM_LOOKUP = new Map()

SUSTAINABILITY_TERM_GROUPS.forEach(({ color, terms }) => {
  terms.forEach((term) => {
    const normalized = term.toLowerCase()
    const entry = { term, color, normalized }
    termEntries.push(entry)
    SUSTAINABILITY_TERM_LOOKUP.set(normalized, entry)
  })
})

const regexPattern = termEntries
  .map((entry) => escapeRegExp(entry.term))
  .sort((a, b) => b.length - a.length)
  .join('|')

const regexSource = regexPattern ? `\\b(${regexPattern})\\b` : ''

export const createHighlightRegex = () =>
  regexSource ? new RegExp(regexSource, 'gi') : null

export const SUSTAINABILITY_HIGHLIGHT_REGEX = createHighlightRegex()

export const SUSTAINABILITY_TERM_ENTRIES = termEntries
