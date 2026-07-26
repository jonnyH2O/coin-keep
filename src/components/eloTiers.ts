export interface EloTier {
  name: string;
  max: number;
  icon: string;
  glow: string;
}

/**
 * Six Elo tiers, each with its own name, badge icon (public/icons/StreamerUiIconN.png),
 * and a placeholder glow color matched to that icon's own dominant hue —
 * see docs/THEME.md §4. Bands are intentionally uneven: narrow through the
 * middle where most ratings actually land (a cutoff right at the Elo
 * starting value of 50), wide at the two extremes. Shared between
 * LeaderboardRow (per-player badge) and RankInfoModal (the tier guide).
 */
export const ELO_TIERS: EloTier[] = [
  { name: 'Stone', max: 34, icon: 'StreamerUiIcon1.png', glow: 'var(--tier-stone-glow)' },
  { name: 'Bronze', max: 44, icon: 'StreamerUiIcon2.png', glow: 'var(--tier-bronze-glow)' },
  { name: 'Gold', max: 49, icon: 'StreamerUiIcon3.png', glow: 'var(--tier-gold-glow)' },
  { name: 'Platinum', max: 54, icon: 'StreamerUiIcon4.png', glow: 'var(--tier-platinum-glow)' },
  { name: 'Diamond', max: 64, icon: 'StreamerUiIcon5.png', glow: 'var(--tier-diamond-glow)' },
  { name: 'Master', max: Infinity, icon: 'StreamerUiIcon6.png', glow: 'var(--tier-master-glow)' },
];

export function eloTier(elo: number): EloTier {
  return ELO_TIERS.find((tier) => elo <= tier.max) ?? ELO_TIERS[ELO_TIERS.length - 1];
}

/** The Elo range shown to players, e.g. "1–34" or "65–100". */
export function eloTierRange(tier: EloTier, index: number): string {
  const min = index === 0 ? 1 : ELO_TIERS[index - 1].max + 1;
  const max = tier.max === Infinity ? 100 : tier.max;
  return `${min}–${max}`;
}

export function iconUrl(icon: string): string {
  return `${import.meta.env.BASE_URL}icons/${icon}`;
}
