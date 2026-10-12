import type { TextStyle } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

/**
 * One type scale for the Scan results and Eco tips cards, so every card reads the same:
 * a small caps label above each section, a 15 pt card title, 14 pt body text, 13 pt secondary
 * text, and 14 pt links.
 */
export const Type = {
  /** "HEALTH RISK ADVISORY", "SUSTAINABILITY"… above a group of cards. */
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 21,
    color: BrandColors.text,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  /** A heading inside a card ("Why it matters") or a bold lead-in ("About this estimate:"). */
  lead: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.primaryDark,
  },
  secondary: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
  link: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.primaryDark,
  },
} satisfies Record<string, TextStyle>;
