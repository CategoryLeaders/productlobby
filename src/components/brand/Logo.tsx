'use client';

/**
 * ProductLobby Logo Component — E1-B
 *
 * Usage:
 *   <Logo />                          — Full wordmark, default 40px
 *   <Logo size={32} />                — Smaller
 *   <Logo variant="icon" />           — Icon only (no text)
 *   <Logo variant="wordmark" />       — Text only (no icon)
 *   <Logo theme="dark" />             — White text for dark backgrounds
 *   <Logo theme="mono" />             — Monochrome dark
 *
 * Brand values locked:
 *   Font: Baloo 2
 *   Spacing: Tight (-0.06em)
 *   Primary: #7C3AED (Violet)
 *   Accent: #84CC16 (Lime)
 *   Text: #1a1a2e (Dark)
 */

const VIOLET = '#7C3AED';
const LIME = '#84CC16';
const DARK = '#1a1a2e';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'wordmark';
  theme?: 'colour' | 'dark' | 'mono';
  className?: string;
}

function LogoIcon({
  size = 48,
  iconColor = VIOLET,
  accent = LIME,
  peopleOpacity = [0.6, 0.85],
  bubbleFill = 'white',
}: {
  size?: number;
  iconColor?: string;
  accent?: string;
  peopleOpacity?: [number, number];
  bubbleFill?: string;
}) {
  const [o1, o2] = peopleOpacity;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* People */}
      <circle cx="12" cy="28" r="4.5" fill={iconColor} opacity={o1} />
      <path d="M5 40C5 35.58 8.13 32 12 32C15.87 32 19 35.58 19 40" stroke={iconColor} strokeWidth="2.5" opacity={o1} strokeLinecap="round" />
      <circle cx="24" cy="26" r="5.5" fill={iconColor} opacity={o2} />
      <path d="M16 40C16 34.48 19.58 30 24 30C28.42 30 32 34.48 32 40" stroke={iconColor} strokeWidth="2.5" opacity={o2} strokeLinecap="round" />
      <circle cx="36" cy="28" r="4.5" fill={iconColor} opacity={o1} />
      <path d="M29 40C29 35.58 32.13 32 36 32C39.87 32 43 35.58 43 40" stroke={iconColor} strokeWidth="2.5" opacity={o1} strokeLinecap="round" />
      {/* Speech bubble */}
      <path
        d="M12 1C11.45 1 11 1.45 11 2V14C11 14.55 11.45 15 12 15H15.5L12 20.5L24 17L36 20.5L32.5 15H36C36.55 15 37 14.55 37 14V2C37 1.45 36.55 1 36 1H12Z"
        fill={bubbleFill}
        stroke={iconColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Upvote arrow */}
      <path d="M24 13V5" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M19 8.5L24 3L29 8.5" stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = 40, variant = 'full', theme = 'colour', className = '' }: LogoProps) {
  const isMono = theme === 'mono';
  const isDark = theme === 'dark';

  const iconColor = isMono ? DARK : isDark ? 'white' : VIOLET;
  const accent = isMono ? DARK : LIME;
  const bubbleFill = isDark ? 'transparent' : 'white';
  const textColor = isDark ? 'white' : DARK;
  const lobbyColor = isMono ? DARK : VIOLET;
  const peopleOpacity: [number, number] = isMono ? [0.5, 0.75] : [0.6, 0.85];

  const iconSize = Math.round(size * 1.15);
  const gap = Math.max(size * 0.08, 3);

  if (variant === 'icon') {
    return <LogoIcon size={iconSize} iconColor={iconColor} accent={accent} peopleOpacity={peopleOpacity} bubbleFill={bubbleFill} />;
  }

  if (variant === 'wordmark') {
    return (
      <div className={className} style={{ fontSize: size, fontFamily: "'Baloo 2', cursive, system-ui, sans-serif", letterSpacing: '-0.06em', lineHeight: 1.1 }}>
        <span style={{ fontWeight: 700, color: textColor }}>product</span>
        <span style={{ fontWeight: 800, color: lobbyColor }}>lobby</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      <LogoIcon size={iconSize} iconColor={iconColor} accent={accent} peopleOpacity={peopleOpacity} bubbleFill={bubbleFill} />
      <div style={{ fontSize: size, fontFamily: "'Baloo 2', cursive, system-ui, sans-serif", letterSpacing: '-0.06em', lineHeight: 1.1 }}>
        <span style={{ fontWeight: 700, color: textColor }}>product</span>
        <span style={{ fontWeight: 800, color: lobbyColor }}>lobby</span>
      </div>
    </div>
  );
}

// Re-export icon standalone for use in favicons, loading screens, etc.
export { LogoIcon };
