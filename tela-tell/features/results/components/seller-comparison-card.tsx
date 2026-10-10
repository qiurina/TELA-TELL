import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { CircleCheck, Tag, TriangleAlert } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import type { StatusTone } from '@/constants/status-colors';
import {
  LABEL_CHECK_SHEET_SECTIONS,
  LABEL_CHECK_SHEET_TITLE,
} from '@/data/fabrics/assessment-disclaimers';
import type { DeclaredLabelCheck } from '@/features/scan/lib/declared-label';

type SellerComparisonCardProps = {
  sellerLabel: string | null;
  detectedLabel: string;
  check: DeclaredLabelCheck;
  onAddLabel?: () => void;
};

const STATUS_TONE: Record<'mismatch' | 'weak' | 'unsure' | 'unreadable' | 'match', StatusTone> = {
  mismatch: 'alert',
  weak: 'caution',
  unsure: 'neutral',
  unreadable: 'neutral',
  match: 'good',
};

const STATUS_ICON = {
  mismatch: TriangleAlert,
  weak: TriangleAlert,
  unsure: Tag,
  unreadable: Tag,
  match: CircleCheck,
} as const;

export function SellerComparisonCard({
  sellerLabel,
  detectedLabel,
  check,
  onAddLabel,
}: SellerComparisonCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const trimmedLabel = sellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;

  if (!hasSellerLabel) {
    return (
      <Pressable
        style={({ pressed }) => [styles.ctaRow, faintCardShadow(), pressed && styles.pressed]}
        onPress={onAddLabel}
        disabled={!onAddLabel}
        accessibilityRole="button"
        accessibilityLabel="Add stated label to compare">
        <View style={styles.ctaIcon}>
          <Tag size={16} color={BrandColors.primary} strokeWidth={2.25} />
        </View>
        <View style={styles.ctaText}>
          <Text style={styles.ctaTitle}>Compare stated label</Text>
          <Text style={styles.ctaBody}>Add what the seller claimed to check for mislabeling</Text>
        </View>
      </Pressable>
    );
  }

  const statusKey = check.status === 'none' ? 'unreadable' : check.status;
  const heading =
    check.status === 'mismatch'
      ? 'Mismatch'
      : check.status === 'weak'
        ? 'Partial'
        : check.status === 'match'
          ? 'Match'
          : check.status === 'unsure'
            ? 'Unsure'
            : "Can't check";
  const detail = check.message.trim();

  return (
    <Pressable
      onPress={onAddLabel}
      disabled={!onAddLabel}
      accessibilityRole="button"
      accessibilityLabel={`${heading}. Edit stated label`}
      style={({ pressed }) => pressed && styles.pressed}>
      <InfoSheet
        visible={showInfo}
        title={LABEL_CHECK_SHEET_TITLE}
        sections={LABEL_CHECK_SHEET_SECTIONS}
        icon={STATUS_ICON[statusKey]}
        tone={STATUS_TONE[statusKey]}
        onClose={() => setShowInfo(false)}
      />

      <StatusCard
        icon={STATUS_ICON[statusKey]}
        tone={STATUS_TONE[statusKey]}
        title="Label check"
        pillLabel={heading}
        onInfoPress={() => setShowInfo(true)}
        infoAccessibilityLabel="About this label check">
        <View style={styles.compareRow}>
          <View style={styles.compareCol}>
            <Text style={styles.compareLabel}>SELLER SAID</Text>
            <Text style={styles.compareValue}>{trimmedLabel}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.compareCol}>
            <Text style={styles.compareLabel}>SCAN FOUND</Text>
            <Text style={styles.compareValue}>{detectedLabel}</Text>
          </View>
        </View>

        {detail ? <Text style={styles.message}>{detail}</Text> : null}
      </StatusCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  ctaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  ctaText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  ctaTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  ctaBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  compareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compareCol: {
    flex: 1,
    gap: 4,
  },
  compareLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
  },
  compareValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: BrandColors.text,
    lineHeight: 20,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  pressed: {
    opacity: 0.88,
  },
});
