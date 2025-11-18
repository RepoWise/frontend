import { visit } from 'unist-util-visit'
import {
  createHighlightRegex,
  SUSTAINABILITY_COLOR_METADATA,
  SUSTAINABILITY_TERM_LOOKUP
} from './sustainabilityTerms'

const createTextNode = (value) => ({ type: 'text', value })

const createHighlightNode = (value, color) => {
  const metadata = SUSTAINABILITY_COLOR_METADATA[color] || {}
  return {
    type: 'text',
    value,
    data: {
      hName: 'span',
      hProperties: {
        className: metadata.className,
        title: metadata.title,
      }
    }
  }
}

export const splitTextIntoHighlightNodes = (value) => {
  if (typeof value !== 'string' || !value.length) {
    return [createTextNode(value || '')]
  }

  const regex = createHighlightRegex()
  if (!regex) {
    return [createTextNode(value)]
  }

  const nodes = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(value)) !== null) {
    const start = match.index
    const end = start + match[0].length

    if (start > lastIndex) {
      nodes.push(createTextNode(value.slice(lastIndex, start)))
    }

    const normalized = match[0].toLowerCase()
    const termEntry = SUSTAINABILITY_TERM_LOOKUP.get(normalized)

    if (termEntry) {
      nodes.push(createHighlightNode(match[0], termEntry.color))
    } else {
      nodes.push(createTextNode(value.slice(start, end)))
    }

    lastIndex = end
  }

  if (lastIndex < value.length) {
    nodes.push(createTextNode(value.slice(lastIndex)))
  }

  return nodes.length ? nodes : [createTextNode(value)]
}

export function remarkSustainabilityHighlight() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof node.value !== 'string' || !node.value.length) {
        return
      }

      const replacements = splitTextIntoHighlightNodes(node.value)
      const isUnchanged =
        replacements.length === 1 &&
        replacements[0].value === node.value &&
        !replacements[0].data

      if (isUnchanged) {
        return
      }

      parent.children.splice(index, 1, ...replacements)
    })
  }
}
