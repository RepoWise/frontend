import { describe, it, expect } from 'vitest'
import { splitTextIntoHighlightNodes } from './remarkSustainabilityHighlight'

const getHighlightNodes = (nodes) => nodes.filter((node) => node?.data?.hProperties)

const getHighlightClasses = (nodes) =>
  getHighlightNodes(nodes).map((node) => node.data.hProperties.className)

describe('splitTextIntoHighlightNodes', () => {
  it('wraps known green phrases with highlight metadata', () => {
    const nodes = splitTextIntoHighlightNodes('The project is sustainably maintained with a vibrant contributor ecosystem.')
    const highlights = getHighlightClasses(nodes)
    const [highlightNode] = getHighlightNodes(nodes)

    expect(highlights.some((classes) => classes.includes('sustainability-green'))).toBe(true)
    expect(highlights.some((classes) => classes.includes('sustainability-highlight'))).toBe(true)
    expect(highlightNode.data.hProperties['aria-label']).toBeDefined()
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

    expect(highlights.some((classes) => classes.includes('sustainability-yellow'))).toBe(true)
    expect(highlights.some((classes) => classes.includes('sustainability-red'))).toBe(true)
  })

  it('adds data attributes for downstream styling and analytics', () => {
    const nodes = splitTextIntoHighlightNodes('High bus factor is reassuring, but license compliance risk exists.')
    const metadataNodes = getHighlightNodes(nodes)

    expect(metadataNodes.some((node) => node.data.hProperties['data-color'] === 'green')).toBe(true)
    expect(metadataNodes.some((node) => node.data.hProperties['data-color'] === 'red')).toBe(true)
  })
})
