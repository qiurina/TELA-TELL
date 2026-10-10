import { BrandColors } from '@/constants/brand';

export type StatusTone = 'good' | 'caution' | 'alert' | 'neutral';

/**
 * One color set for status cards (shedding tendency, label check) so the same state always looks
 * the same. `accent` is dark enough for text, icons and the solid pill fill; `border` is the thin
 * tint around a white card; `tint` is the light wash behind the card icon.
 */
export const STATUS_COLORS: Record<
  StatusTone,
  { accent: string; border: string; tint: string; pill: string }
> = {
  good: { accent: '#15803D', border: '#BBF7D0', tint: '#F0FDF4', pill: '#DCFCE7' },
  caution: { accent: '#B45309', border: '#FDE68A', tint: '#FFFBEB', pill: '#FEF3C7' },
  alert: { accent: '#B91C1C', border: '#FECACA', tint: '#FEF2F2', pill: '#FEE2E2' },
  neutral: {
    accent: BrandColors.textMuted,
    border: BrandColors.border,
    tint: BrandColors.lavenderCard,
    pill: BrandColors.lavenderCard,
  },
};
