import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Common stop words to filter
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'can',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'what',
  'which',
  'who',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'as',
  'if',
  'there',
  'about',
  'by',
  'from',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'up',
  'down',
  'out',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'am',
]);

// Positive sentiment words
const POSITIVE_WORDS = new Set([
  'good',
  'great',
  'excellent',
  'amazing',
  'wonderful',
  'fantastic',
  'awesome',
  'love',
  'best',
  'perfect',
  'nice',
  'beautiful',
  'brilliant',
  'outstanding',
  'superb',
  'impressive',
  'pleased',
  'happy',
  'delighted',
  'glad',
  'thrilled',
  'excited',
  'wonderful',
  'fantastic',
  'brilliant',
  'superb',
  'perfect',
  'great',
  'good',
  'excellent',
  'positive',
  'improve',
  'improvement',
  'better',
  'best',
  'like',
  'awesome',
  'fantastic',
  'worth',
  'recommend',
  'recommended',
  'helpful',
  'useful',
  'effective',
  'efficient',
  'easy',
  'simple',
  'smart',
  'clever',
  'innovative',
  'unique',
  'special',
  'remarkable',
]);

// Negative sentiment words
const NEGATIVE_WORDS = new Set([
  'bad',
  'terrible',
  'awful',
  'horrible',
  'poor',
  'worst',
  'hate',
  'dislike',
  'disappointing',
  'disappointed',
  'disappointed',
  'upset',
  'angry',
  'frustrated',
  'annoyed',
  'sad',
  'useless',
  'broken',
  'bug',
  'bugs',
  'problem',
  'problems',
  'issue',
  'issues',
  'fail',
  'failure',
  'error',
  'errors',
  'crash',
  'slow',
  'sluggish',
  'laggy',
  'confusing',
  'complicated',
  'difficult',
  'hard',
  'impossible',
  'waste',
  'wasted',
  'bad',
  'negative',
  'unpleasant',
  'unhappy',
  'disgruntled',
  'regret',
  'regrets',
  'worry',
  'worried',
  'concern',
  'concerns',
  'lacking',
  'missing',
  'incomplete',
  'poor',
  'inferior',
  'weak',
  'unreliable',
  'unstable',
  'dangerous',
  'risky',
  'avoid',
]);

const getSentiment = (word: string): 'positive' | 'negative' | 'neutral' => {
  const lowerWord = word.toLowerCase();
  if (POSITIVE_WORDS.has(lowerWord)) return 'positive';
  if (NEGATIVE_WORDS.has(lowerWord)) return 'negative';
  return 'neutral';
};

const extractWords = (text: string): string[] => {
  // Simple word extraction: split by non-alphanumeric characters, filter stop words
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter(
      (word) =>
        word.length > 2 && // Only words with 3+ characters
        !STOP_WORDS.has(word) &&
        !/^\d+$/.test(word) // No pure numbers
    );
  return words;
};

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    // Fetch all comments for this campaign
    const comments = await prisma.comment.findMany({
      where: { campaignId: id },
      select: { content: true },
    });

    if (comments.length === 0) {
      return NextResponse.json({ words: [] });
    }

    // Extract and count words
    const wordFrequency = new Map<string, number>();

    for (const comment of comments) {
      const words = extractWords(comment.content);
      for (const word of words) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    }

    // Convert to array, sort by frequency, take top 30
    const topWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, frequency]) => ({
        word,
        frequency,
        sentiment: getSentiment(word),
      }));

    return NextResponse.json({ words: topWords });
  } catch (error) {
    console.error('Error generating word cloud:', error);
    return NextResponse.json(
      { error: 'Failed to generate word cloud' },
      { status: 500 }
    );
  }
}
