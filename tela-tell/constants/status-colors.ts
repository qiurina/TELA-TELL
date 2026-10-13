import { BrandColors } from '@/constants/brand';

export type StatusTone = 'good' | 'caution' | 'alert' | 'neutral';

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
