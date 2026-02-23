'use client';

import { useEffect, useState } from 'react';

interface WordData {
  word: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface WordPosition extends WordData {
  x: number;
  y: number;
  size: number;
}

const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive':
      return '#10b981'; // green
    case 'negative':
      return '#ef4444'; // red
    default:
      return '#9ca3af'; // gray
  }
};

const calculateFontSize = (frequency: number, maxFreq: number): number => {
  // Scale from 14px to 48px based on frequency
  const minSize = 14;
  const maxSize = 48;
  return minSize + (frequency / maxFreq) * (maxSize - minSize);
};

const generatePositions = (words: WordData[]): WordPosition[] => {
  if (words.length === 0) return [];

  const maxFreq = Math.max(...words.map((w) => w.frequency));
  const width = 800;
  const height = 400;
  const positions: WordPosition[] = [];
  const usedAreas: Array<{ x: number; y: number; width: number; height: number }> = [];

  const doesOverlap = (x: number, y: number, w: number, h: number): boolean => {
    const padding = 10;
    return usedAreas.some(
      (area) =>
        !(
          x + w + padding < area.x ||
          x > area.x + area.width + padding ||
          y + h + padding < area.y ||
          y > area.y + area.height + padding
        )
    );
  };

  for (const word of words) {
    const fontSize = calculateFontSize(word.frequency, maxFreq);
    const estimatedWidth = word.word.length * (fontSize * 0.6);
    const estimatedHeight = fontSize * 1.2;

    let placed = false;
    let attempts = 0;
    const maxAttempts = 50;

    while (!placed && attempts < maxAttempts) {
      const x = Math.random() * (width - estimatedWidth);
      const y = Math.random() * (height - estimatedHeight);

      if (!doesOverlap(x, y, estimatedWidth, estimatedHeight)) {
        positions.push({
          ...word,
          x,
          y,
          size: fontSize,
        });
        usedAreas.push({
          x,
          y,
          width: estimatedWidth,
          height: estimatedHeight,
        });
        placed = true;
      }
      attempts++;
    }

    // If placement fails after max attempts, add it anyway
    if (!placed) {
      const x = Math.random() * (width - estimatedWidth);
      const y = Math.random() * (height - estimatedHeight);
      positions.push({
        ...word,
        x,
        y,
        size: fontSize,
      });
    }
  }

  return positions;
};

export function SentimentWordCloud({ campaignId }: { campaignId: string }) {
  const [words, setWords] = useState<WordPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordCloud = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}/word-cloud`);

        if (!response.ok) {
          throw new Error(`Failed to fetch word cloud: ${response.statusText}`);
        }

        const data = await response.json();
        const positioned = generatePositions(data.words);
        setWords(positioned);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load word cloud');
        setWords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWordCloud();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">Loading word cloud...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-red-200 bg-red-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">No comments available for word cloud</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4">
      <div className="relative" style={{ width: '800px', height: '400px' }}>
        {words.map((word, idx) => (
          <div
            key={idx}
            className="absolute whitespace-nowrap font-semibold"
            style={{
              left: `${word.x}px`,
              top: `${word.y}px`,
              fontSize: `${word.size}px`,
              color: getSentimentColor(word.sentiment),
              opacity: 0.85,
            }}
            title={`${word.word} (${word.frequency} times)`}
          >
            {word.word}
          </div>
        ))}
      </div>
    </div>
  );
}
