import React from 'react'
import Link from 'next/link'

/**
 * Parse text containing @mentions and return React elements
 * Converts @handle references into clickable profile links
 */
export function renderWithMentions(text: string): React.ReactNode[] {
  const mentionRegex = /@(\w+)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add the mention as a link
    const handle = match[1]
    parts.push(
      <Link
        key={`mention-${match.index}`}
        href={`/profile/${handle}`}
        className="text-violet-600 font-medium hover:text-violet-700 hover:underline"
      >
        @{handle}
      </Link>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/**
 * Extract @mention handles from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return [...new Set(mentions)]
}
