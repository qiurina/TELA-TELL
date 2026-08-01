import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight, Droplets, Info, Shield } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  getFiberHealthRiskLevel,
  type HealthRiskLevel,
  type SyntheticHealthRisk,
} from '@/data/fabrics/synthetic-health-risk';
import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';

const LEVEL_STYLES: Record<
  HealthRiskLevel,
  { background: string; border: string; accent: string; label: string }
> = {
  low: {
    background: '#F0FDF4',
    border: '#BBF7D0',
    accent: '#15803D',
    label: 'Low',
  },
  moderate: {
    background: '#FFFBEB',
    border: '#FDE68A',
    accent: '#B45309',
    label: 'Moderate',
  },
  high: {
    background: '#FEF2F2',
    border: '#FECACA',
    accent: '#B91C1C',
    label: 'High',
  },
};

type SyntheticMicroplasticGuideProps = {
  risk: SyntheticHealthRisk;
};

/**
 * Compact Eco Tips microplastic strip.
 * Importance stays on-screen; tips and disclaimer open on demand.
 */
export function SyntheticMicroplasticGuide({ risk }: SyntheticMicroplasticGuideProps) {
  const [sheet, setSheet] = useState<'advisory' | 'tips' | null>(null);
  const levelStyle = LEVEL_STYLES[risk.level];

  const tipsMessage = risk.tips.map((tip, index) => `${index + 1}. ${tip}`).join('\n\n');

  return (
    <View style={styles.section}>
      <ScanConfirmSheet
        visible={sheet === 'advisory'}
        variant="info"
        title="About this advisory"
        message={risk.disclaimer}
        confirmLabel="Got it"
        onConfirm={() => setSheet(null)}
        onCancel={() => setSheet(null)}
      />
      <ScanConfirmSheet
        visible={sheet === 'tips'}
        variant="info"
        title="What you can do"
        message={tipsMessage}
        confirmLabel="Got it"
        onConfirm={() => setSheet(null)}
        onCancel={() => setSheet(null)}
      />

      <View style={styles.titleRow}>
        <Text style={styles.sectionLabel}>SYNTHETIC & MICROPLASTIC</Text>
        <Pressable
          style={styles.infoButton}
          onPress={() => setSheet('advisory')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="About this advisory">
          <Info size={14} color={BrandColors.textMuted} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={[styles.panel, faintCardShadow()]}>
        <View style={styles.importanceRow}>
          <View style={[styles.shieldWrap, { backgroundColor: levelStyle.background }]}>
            <Shield size={16} color={levelStyle.accent} strokeWidth={2.25} />
          </View>
          <View style={styles.importanceText}>
            <Text style={styles.importanceTitle}>Why this matters</Text>
            <Text style={styles.importanceBody}>{risk.summary}</Text>
          </View>
        </View>

        <View style={styles.chipRow}>
          <View
            style={[
              styles.levelPill,
              { backgroundColor: levelStyle.background, borderColor: levelStyle.border },
            ]}>
            <Text style={[styles.levelPillText, { color: levelStyle.accent }]}>
              {levelStyle.label} risk
            </Text>
          </View>
          {risk.fibers.map((fiber) => {
            const fiberLevel = getFiberHealthRiskLevel(fiber);
            const accent = LEVEL_STYLES[fiberLevel];

            return (
              <View
                key={fiber}
                style={[
                  styles.fiberChip,
                  { backgroundColor: accent.background, borderColor: accent.border },
                ]}>
                <Text style={[styles.fiberChipText, { color: accent.accent }]}>{fiber}</Text>
              </View>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [styles.careButton, pressed && styles.pressed]}
          onPress={() => setSheet('tips')}
          accessibilityRole="button"
          accessibilityLabel="What you can do">
          <View style={styles.careLeft}>
            <Droplets size={16} color={BrandColors.primary} strokeWidth={2.25} />
            <Text style={styles.careLabel}>Care tips to reduce shedding</Text>
          </View>
          <ChevronRight size={18} color={BrandColors.textMuted} strokeWidth={2.25} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionLabel: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  panel: {
    backgroundColor: BrandColors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 14,
    gap: 12,
  },
  importanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  shieldWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  importanceText: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  importanceTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  importanceBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  levelPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelPillText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  fiberChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  fiberChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  careButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 12,
    backgroundColor: BrandColors.lavenderCard,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  careLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  careLabel: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
  pressed: {
    opacity: 0.88,
  },
});
