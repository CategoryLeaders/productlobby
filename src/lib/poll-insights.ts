import { prisma } from '@/lib/db'

export interface PollInsight {
  summary: string
  topChoices: Array<{
    option: string
    percentage: number
    conviction: 'neatIdea' | 'probablyBuy' | 'takeMyMoney'
  }>
  consensus: 'strong' | 'moderate' | 'split'
  totalVotes: number
  byIntensity: {
    neatIdea: number
    probablyBuy: number
    takeMyMoney: number
  }
}

export async function generatePollInsights(pollId: string): Promise<PollInsight | null> {
  try {
    const poll = await prisma.creatorPoll.findUnique({
      where: { id: pollId },
      include: {
        campaign: {
          include: {
            lobbies: {
              select: {
                userId: true,
                intensity: true,
              },
            },
          },
        },
        options: {
          include: {
            votes: {
              include: {
                user: true,
              },
            },
          },
        },
        votes: true,
      },
    })

    if (!poll) return null

    const totalVotes = poll.votes.length
    if (totalVotes === 0) {
      return {
        summary: 'No votes yet. Share this poll with your supporters!',
        topChoices: [],
        consensus: 'split',
        totalVotes: 0,
        byIntensity: {
          neatIdea: 0,
          probablyBuy: 0,
          takeMyMoney: 0,
        },
      }
    }

    // Build intensity map
    const intensityMap = new Map(
      poll.campaign.lobbies.map((l) => [l.userId, l.intensity])
    )

    // Calculate results with intensity breakdown
    const results = poll.options
      .map((option) => {
        const voteCount = option.votes.length
        const percentage = Math.round((voteCount / totalVotes) * 100)

        const byIntensity = {
          neatIdea: 0,
          probablyBuy: 0,
          takeMyMoney: 0,
        }

        option.votes.forEach((vote) => {
          const intensity = intensityMap.get(vote.userId)
          if (intensity === 'NEAT_IDEA') byIntensity.neatIdea++
          else if (intensity === 'PROBABLY_BUY') byIntensity.probablyBuy++
          else if (intensity === 'TAKE_MY_MONEY') byIntensity.takeMyMoney++
        })

        // Determine conviction level based on intensity breakdown
        let conviction: 'neatIdea' | 'probablyBuy' | 'takeMyMoney' = 'neatIdea'
        if (byIntensity.takeMyMoney > byIntensity.probablyBuy) {
          conviction = 'takeMyMoney'
        } else if (byIntensity.probablyBuy >= byIntensity.neatIdea) {
          conviction = 'probablyBuy'
        }

        return {
          option: option.text,
          percentage,
          voteCount,
          byIntensity,
          conviction,
        }
      })
      .sort((a, b) => b.percentage - a.percentage)

    // Calculate overall intensity distribution
    const overallByIntensity = {
      neatIdea: 0,
      probablyBuy: 0,
      takeMyMoney: 0,
    }

    poll.votes.forEach((vote) => {
      const intensity = intensityMap.get(vote.userId)
      if (intensity === 'NEAT_IDEA') overallByIntensity.neatIdea++
      else if (intensity === 'PROBABLY_BUY') overallByIntensity.probablyBuy++
      else if (intensity === 'TAKE_MY_MONEY') overallByIntensity.takeMyMoney++
    })

    // Determine consensus level
    const topPercentage = results[0]?.percentage || 0
    let consensus: 'strong' | 'moderate' | 'split'
    if (topPercentage >= 60) {
      consensus = 'strong'
    } else if (topPercentage >= 40) {
      consensus = 'moderate'
    } else {
      consensus = 'split'
    }

    // Generate natural language summary
    const topThreeChoices = results.slice(0, 3)
    const topChoicesText = topThreeChoices
      .map((r) => `${r.option} (${r.percentage}%)`)
      .join(', ')

    let summary = ''

    if (consensus === 'strong' && results[0]) {
      const topIntensity = overallByIntensity.takeMyMoney > overallByIntensity.probablyBuy
        ? 'strong demand'
        : overallByIntensity.probablyBuy > overallByIntensity.neatIdea
        ? 'genuine interest'
        : 'casual interest'

      const percentText =
        overallByIntensity.takeMyMoney > 0
          ? `${Math.round((overallByIntensity.takeMyMoney / totalVotes) * 100)}% would definitely buy`
          : overallByIntensity.probablyBuy > 0
          ? `${Math.round((overallByIntensity.probablyBuy / totalVotes) * 100)}% would probably buy`
          : ''

      summary = `Strong preference for "${results[0].option}" (${results[0].percentage}%). ${percentText ? `${percentText} in ` : ''}${topIntensity}.`
    } else if (consensus === 'moderate') {
      summary = `Moderate preference among: ${topChoicesText}. Your supporters are interested but want options.`
    } else {
      summary = `Split opinions. Top choices include: ${topChoicesText}. Consider testing multiple options.`
    }

    return {
      summary,
      topChoices: topThreeChoices.map((r) => ({
        option: r.option,
        percentage: r.percentage,
        conviction: r.conviction,
      })),
      consensus,
      totalVotes,
      byIntensity: overallByIntensity,
    }
  } catch (error) {
    console.error('Error generating poll insights:', error)
    return null
  }
}

/**
 * Generate a natural language insight string for a single option
 * Example: "87% of supporters would buy this in white, silver or blue"
 */
export function generateOptionSummary(
  option: string,
  percentage: number,
  byIntensity: { neatIdea: number; probablyBuy: number; takeMyMoney: number },
  totalVotes: number
): string {
  if (totalVotes === 0) return `No votes for ${option} yet`

  const takeMyMoneyPercent = Math.round((byIntensity.takeMyMoney / totalVotes) * 100)
  const probablyBuyPercent = Math.round((byIntensity.probablyBuy / totalVotes) * 100)

  if (takeMyMoneyPercent > 0) {
    return `${percentage}% of supporters chose ${option}, with ${takeMyMoneyPercent}% indicating strong purchase intent`
  } else if (probablyBuyPercent > 0) {
    return `${percentage}% of supporters chose ${option}, with ${probablyBuyPercent}% indicating genuine interest`
  } else {
    return `${percentage}% of supporters would consider ${option}`
  }
}

/**
 * Check if poll has enough responses for reliable data
 */
export function isPollStatisticallySignificant(totalVotes: number): boolean {
  return totalVotes >= 10
}
