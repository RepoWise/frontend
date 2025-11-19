import { describe, expect, it } from 'vitest'
import { highlightSustainabilityTerms } from './sustainabilityHighlights'

describe('highlightSustainabilityTerms', () => {
  it('wraps known green terms with sustainability span', () => {
    const text = 'The project has a stable release cadence and proactive security practices.'
    const highlighted = highlightSustainabilityTerms(text)

    expect(highlighted).toContain('<span class="sustainability-green">stable release cadence</span>')
    expect(highlighted).toContain('<span class="sustainability-green">proactive security practices</span>')
  })

  it('does not alter content without sustainability terms', () => {
    const text = 'This sentence has no sustainability keywords.'
    expect(highlightSustainabilityTerms(text)).toBe(text)
  })

  it('avoids highlighting inside fenced code blocks', () => {
    const text = 'Outside code we see declining contributor activity.```\nconst note = "declining contributor activity"\n```'
    const highlighted = highlightSustainabilityTerms(text)

    expect(highlighted).toContain('<span class="sustainability-yellow">declining contributor activity</span>')
    expect(highlighted).toContain('```\nconst note = "declining contributor activity"\n```')
  })
})
