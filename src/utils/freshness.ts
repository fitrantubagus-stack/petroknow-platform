import { KnowledgeEntry, FreshnessScore, FreshnessState } from '../types';

export const SIMULATED_CURRENT_DATE = '2026-08-23';

/**
 * Calculates real-time freshness score and decay status for a knowledge entry
 */
export function calculateFreshness(entry: KnowledgeEntry, currentDateStr: string = SIMULATED_CURRENT_DATE): FreshnessScore {
  const verifiedDate = new Date(entry.lastVerifiedDate || entry.submitDate);
  const now = new Date(currentDateStr);
  
  const diffTime = Math.max(0, now.getTime() - verifiedDate.getTime());
  const daysSinceVerification = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const maxFreshDays = entry.decayDaysThreshold || 180;
  const daysRemaining = Math.max(0, maxFreshDays - daysSinceVerification);
  
  // Exponential / linear decay score: 100% when 0 days, 0% when exceeds threshold
  let score = Math.round(Math.max(0, Math.min(100, (1 - (daysSinceVerification / maxFreshDays)) * 100)));
  
  let state: FreshnessState = 'fresh';
  if (daysSinceVerification > maxFreshDays) {
    state = 'stale';
  } else if (daysSinceVerification > maxFreshDays * 0.5) {
    state = 'aging';
  } else {
    state = 'fresh';
  }

  return {
    score,
    state,
    daysSinceVerification,
    maxFreshDays,
    daysRemaining
  };
}

/**
 * Returns color classes corresponding to freshness state
 */
export function getFreshnessBadge(state: FreshnessState): {
  label: string;
  badgeClass: string;
  borderClass: string;
  dotClass: string;
  textClass: string;
} {
  switch (state) {
    case 'fresh':
      return {
        label: 'Fresh & Verified',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        borderClass: 'border-emerald-500',
        dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
        textClass: 'text-emerald-400'
      };
    case 'aging':
      return {
        label: 'Aging (Review Soon)',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        borderClass: 'border-amber-500',
        dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        textClass: 'text-amber-400'
      };
    case 'stale':
      return {
        label: 'Stale (Needs Re-Verification)',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        borderClass: 'border-rose-500',
        dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
        textClass: 'text-rose-400'
      };
  }
}
