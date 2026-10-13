import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { CircleCheck, Droplets, Leaf, Recycle, TriangleAlert } from '@/components/ui/lucide-icons';
import { SectionLabel } from '@/components/ui/section-label';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { STATUS_COLORS } from '@/constants/status-colors';
import { Type } from '@/constants/typography';
import {
  ALTERNATIVE_OPTIONS,
  ECO_GUIDE_HOW_TO_READ,
  ECO_GUIDE_USE_NOTE,
  getReduceSteps,
  type FiberEcoGuide,
} from '@/data/fabrics/eco-guide';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import {
  SUSTAINABLE_CHOICES_CLAIMS,
  SUSTAINABLE_CHOICES_KEEP_IN_MIND,
  WHY_REUSE_HELPS_TITLE,
} from '@/data/fabrics/sustainable-choices';

/**
 * Eco tips for one fiber, from the Microplastics & Sustainable Choices Guide: how to reduce
 * shedding, a better-fit alternative and reuse ideas. The fiber's microplastic status is in the
 * Health risk advisory above it; the guide's sources are listed in About.
 */
export function EcoGuideSection({
  fiber,
  guide,
  isSynthetic,
}: {
  fiber: SupportedFabric;
  guide: FiberEcoGuide;
  isSynthetic: boolean;
}) {
  const [readOpen, setReadOpen] = useState(false);

  return (
    <View style={styles.root}>
      <InfoSheet
        visible={readOpen}
        title="About these tips"
        sections={[
          { heading: "What the scan can't tell", body: ECO_GUIDE_HOW_TO_READ },
          { heading: 'Good to know', body: ECO_GUIDE_USE_NOTE },
        ]}
        onClose={() => setReadOpen(false)}
      />

      <SectionLabel title="ECO TIPS" onInfoPress={() => setReadOpen(true)} infoAccessibilityLabel="About these tips" />

      <StatusCard icon={Droplets} tone="neutral" title="Reduce shedding">
        <View style={styles.steps}>
          {getReduceSteps(guide, isSynthetic).map((step) => (
            <View key={step} style={styles.stepRow}>
              <CircleCheck size={16} color={STATUS_COLORS.good.accent} strokeWidth={2.25} />
              <Text style={[Type.body, styles.stepText]}>{step}</Text>
            </View>
          ))}
        </View>
      </StatusCard>

      <StatusCard icon={Leaf} tone="neutral" title="Better-fit alternative">
        <View style={styles.chips}>
          {ALTERNATIVE_OPTIONS[fiber].map((option) => (
            <View key={option} style={styles.chip}>
              <Text style={styles.chipText}>{option}</Text>
            </View>
          ))}
        </View>
        <Text style={Type.body}>{guide.alternative.reason}</Text>
      </StatusCard>

      <StatusCard icon={Recycle} tone="neutral" title="Reuse it">
        <Text style={Type.body}>{guide.reuse}</Text>
        <View style={styles.divider} />
        <Text style={Type.lead}>{WHY_REUSE_HELPS_TITLE}</Text>
        <View style={styles.steps}>
          {SUSTAINABLE_CHOICES_CLAIMS.map((claim) => (
            <View key={claim.text} style={styles.stepRow}>
              <CircleCheck size={16} color={STATUS_COLORS.good.accent} strokeWidth={2.25} />
              <Text style={[Type.body, styles.stepText]}>
                <Text style={styles.claimAspect}>{claim.aspect}: </Text>
                {claim.text}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.keepBox}>
          <TriangleAlert size={14} color={STATUS_COLORS.caution.accent} strokeWidth={2.25} />
          <Text style={[Type.secondary, styles.stepText]}>{SUSTAINABLE_CHOICES_KEEP_IN_MIND}</Text>
        </View>
      </StatusCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  steps: {
    gap: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BrandColors.border,
  },
  claimAspect: {
    fontFamily: Type.cardTitle.fontFamily,
    color: BrandColors.text,
  },
  keepBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: STATUS_COLORS.caution.border,
    backgroundColor: STATUS_COLORS.caution.tint,
    padding: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepText: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  chipText: {
    ...Type.lead,
    fontSize: 13,
    lineHeight: 18,
  },
});
