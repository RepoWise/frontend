import { describe, it, expect } from 'vitest'
import { splitTextIntoHighlightNodes } from './remarkSustainabilityHighlight'

const getHighlightClasses = (nodes) =>
  nodes
    .filter((node) => node?.data?.hProperties?.className)
    .map((node) => node.data.hProperties.className)

describe('splitTextIntoHighlightNodes', () => {
  it('wraps known green phrases with highlight metadata', () => {
    const nodes = splitTextIntoHighlightNodes('The project is sustainably maintained with a vibrant contributor ecosystem.')
    const highlights = getHighlightClasses(nodes)

    expect(highlights).toContain('sustainability-green')
    expect(nodes.map((n) => n.value).join('')).toContain('sustainably maintained')
  })

  it('leaves text unchanged when no terms match', () => {
    const text = 'Nothing to see here.'
    const nodes = splitTextIntoHighlightNodes(text)

    expect(nodes).toHaveLength(1)
    expect(nodes[0].value).toBe(text)
    expect(nodes[0].data).toBeUndefined()
  })

  it('detects multiple risk levels in a single sentence', () => {
    const text = 'There is declining contributor activity and the project faces a bus factor 1 situation.'
    const nodes = splitTextIntoHighlightNodes(text)
    const highlights = getHighlightClasses(nodes)

    expect(highlights).toContain('sustainability-yellow')
    expect(highlights).toContain('sustainability-red')
  })
})
