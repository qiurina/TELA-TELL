import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { Info, Shield } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { HealthRiskLevel, SyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';

const LEVEL_STYLES: Record<
  HealthRiskLevel,
  { background: string; border: string; accent: string }
> = {
  low: { background: '#F0FDF4', border: '#BBF7D0', accent: '#15803D' },
  moderate: { background: '#FFFBEB', border: '#FDE68A', accent: '#B45309' },
  high: { background: '#FEF2F2', border: '#FECACA', accent: '#B91C1C' },
};

type SyntheticHealthRiskCardProps = {
  risk: SyntheticHealthRisk;
};

export function SyntheticHealthRiskCard({ risk }: SyntheticHealthRiskCardProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const levelStyle = LEVEL_STYLES[risk.level];
  const fiberList = risk.fibers.join(', ');

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: levelStyle.background, borderColor: levelStyle.border },
      ]}>
      <ScanConfirmSheet
        visible={showDisclaimer}
        variant="info"
        title="Synthetic fiber health risk"
        message={risk.disclaimer}
        confirmLabel="Got it"
        onConfirm={() => setShowDisclaimer(false)}
        onCancel={() => setShowDisclaimer(false)}
      />

      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Shield size={16} color={levelStyle.accent} strokeWidth={2.25} />
          <Text style={[styles.cardLabel, { color: levelStyle.accent }]}>HEALTH RISK</Text>
          <Text style={[styles.levelValue, { color: levelStyle.accent }]}>{risk.label}</Text>
        </View>
        <Pressable
          style={[
            styles.infoButton,
            { backgroundColor: levelStyle.background, borderColor: levelStyle.border },
          ]}
          onPress={() => setShowDisclaimer(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="About synthetic fiber health risk">
          <Info size={14} color={levelStyle.accent} strokeWidth={2.25} />
        </Pressable>
      </View>

      <Text style={styles.summary}>{risk.summary}</Text>
      {fiberList ? <Text style={styles.fiberList}>{fiberList}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  cardLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  levelValue: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  infoButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  summary: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  fiberList: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
});
