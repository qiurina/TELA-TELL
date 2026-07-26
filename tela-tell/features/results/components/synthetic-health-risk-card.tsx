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
        <Text style={styles.cardLabel}>SYNTHETIC FIBER HEALTH RISK</Text>
        <Pressable
          style={styles.infoButton}
          onPress={() => setShowDisclaimer(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="About synthetic fiber health risk">
          <Info size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.levelRow}>
        <Shield size={18} color={levelStyle.accent} strokeWidth={2.25} />
        <Text style={[styles.levelValue, { color: levelStyle.accent }]}>{risk.label}</Text>
        <Text style={styles.fiberList} numberOfLines={1}>
          {fiberList}
        </Text>
      </View>

      {risk.factors.length > 0 ? (
        <View style={styles.factorList}>
          {risk.factors.map((factor) => (
            <View key={factor} style={styles.factorRow}>
              <Text style={[styles.factorBullet, { color: levelStyle.accent }]}>•</Text>
              <Text style={styles.factorText}>{factor}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  infoButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  fiberList: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'right',
  },
  factorList: {
    gap: 4,
    marginTop: 2,
  },
  factorRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  factorBullet: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 17,
  },
  factorText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.text,
  },
});
