import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardLink } from '@/components/ui/card-link';
import { InfoSheet } from '@/components/ui/info-sheet';
import { CircleCheck, Tag, TriangleAlert } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import type { StatusTone } from '@/constants/status-colors';
import { Type } from '@/constants/typography';
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
      <StatusCard icon={Tag} tone="neutral" title="Compare stated label">
        <Text style={Type.body}>Add what the seller claimed to compare it with the prediction.</Text>
        {onAddLabel ? <CardLink icon={Tag} label="Add stated label" onPress={onAddLabel} /> : null}
      </StatusCard>
    );
  }

  const statusKey = check.status === 'none' ? 'unreadable' : check.status;
  const heading =
    check.status === 'mismatch'
      ? 'Differs'
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
        title="Seller's label"
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
  compareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compareCol: {
    flex: 1,
    gap: 4,
  },
  compareLabel: {
    ...Type.sectionLabel,
  },
  compareValue: {
    ...Type.cardTitle,
  },
  message: {
    ...Type.secondary,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  pressed: {
    opacity: 0.88,
  },
});
