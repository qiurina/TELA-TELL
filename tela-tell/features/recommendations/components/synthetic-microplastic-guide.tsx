import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { InfoSheet } from '@/components/ui/info-sheet';
import { ChevronRight, Droplets, Shield } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { StatusTone } from '@/constants/status-colors';
import { SHEDDING_SHEET_TITLE } from '@/data/fabrics/assessment-disclaimers';
import {
  SHEDDING_TIPS_FOOTNOTE,
  type HealthRiskLevel,
  type SyntheticHealthRisk,
} from '@/data/fabrics/synthetic-health-risk';

const LEVEL_TONE: Record<HealthRiskLevel, StatusTone> = {
  low: 'good',
  moderate: 'caution',
  high: 'alert',
};

type SyntheticMicroplasticGuideProps = {
  risk: SyntheticHealthRisk;
};

/**
 * Eco Tips microplastic section: the section label carries the (i); the card below uses the same
 * header, frame and pastel pill as the Results status cards. Tips open on demand.
 */
export function SyntheticMicroplasticGuide({ risk }: SyntheticMicroplasticGuideProps) {
  const [sheet, setSheet] = useState<'advisory' | 'tips' | null>(null);
  const tone = LEVEL_TONE[risk.level];

  const tipsMessage = `${risk.tips.map((tip, index) => `${index + 1}. ${tip}`).join('\n\n')}\n\n${SHEDDING_TIPS_FOOTNOTE}`;

  return (
    <View style={styles.section}>
      <InfoSheet
        visible={sheet === 'advisory'}
        title={SHEDDING_SHEET_TITLE}
        sections={risk.disclaimer}
        icon={Shield}
        tone={tone}
        onClose={() => setSheet(null)}
      />
      <InfoSheet
        visible={sheet === 'tips'}
        title="What you can do"
        message={tipsMessage}
        icon={Droplets}
        onClose={() => setSheet(null)}
      />

      <View style={styles.titleRow}>
        <Text style={styles.sectionLabel}>SYNTHETIC & MICROPLASTIC</Text>
        <InfoButton
          onPress={() => setSheet('advisory')}
          accessibilityLabel="About this shedding estimate"
        />
      </View>

      <StatusCard icon={Shield} tone={tone} title="Fiber shedding" pillLabel={risk.label}>
        <View style={styles.copy}>
          <Text style={styles.summary}>
            <Text style={styles.lead}>Why {risk.label}: </Text>
            {risk.reason}
          </Text>
          <Text style={styles.note}>{risk.note}</Text>
        </View>

        {risk.fibers.length > 0 ? (
          <View style={styles.fibers}>
            <Text style={styles.fibersLabel}>Predicted fibers</Text>
            <View style={styles.chipRow}>
              {risk.fibers.map((fiber) => (
                <View key={fiber} style={styles.fiberChip}>
                  <Text style={styles.fiberChipText}>{fiber}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

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
      </StatusCard>
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
  copy: {
    gap: 8,
  },
  summary: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  lead: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
  fibers: {
    gap: 6,
  },
  fibersLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fiberChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavender,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  fiberChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.text,
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
