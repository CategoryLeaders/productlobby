'use client'

import React, { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  swingAmount: number
}

/**
 * CSS-only confetti celebration animation component
 * Automatically dismisses after animation completes
 */
export function ConfettiCelebration() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    // Generate confetti pieces
    const confetti: ConfettiPiece[] = []
    for (let i = 0; i < 50; i++) {
      confetti.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1.5,
        swingAmount: 10 + Math.random() * 20,
      })
    }
    setPieces(confetti)

    // Auto-dismiss after animation completes
    const timer = setTimeout(() => {
      setPieces([])
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (pieces.length === 0) {
    return null
  }

  return (
    <>
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }

        @keyframes swing {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(var(--swing-amount));
          }
          50% {
            transform: translateX(0);
          }
          75% {
            transform: translateX(calc(var(--swing-amount) * -1));
          }
          100% {
            transform: translateX(0);
          }
        }

        .confetti-piece {
          position: fixed;
          top: -10px;
          pointer-events: none;
          z-index: 50;
          animation: fall linear forwards, swing ease-in-out infinite;
        }

        .confetti-piece.gold {
          --color: #fbbf24;
        }

        .confetti-piece.violet {
          --color: #7c3aed;
        }

        .confetti-piece.lime {
          --color: #84cc16;
        }

        .confetti-piece.pink {
          --color: #ec4899;
        }

        .confetti-piece.blue {
          --color: #3b82f6;
        }
      `}</style>

      {pieces.map((piece) => {
        const colors = ['gold', 'violet', 'lime', 'pink', 'blue']
        const color = colors[piece.id % colors.length]

        return (
          <div
            key={piece.id}
            className={`confetti-piece ${color}`}
            style={{
              left: `${piece.left}%`,
              '--swing-amount': `${piece.swingAmount}px`,
              animation: `fall ${piece.duration}s linear ${piece.delay}s forwards, swing ${0.5 + piece.duration / 4}s ease-in-out ${piece.delay}s infinite`,
            } as React.CSSProperties}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--color)]"></div>
          </div>
        )
      })}
    </>
  )
}

export default ConfettiCelebration
