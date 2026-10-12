import { useState, type FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { InfoSheet } from '@/components/ui/info-sheet';
import { Droplets, Leaf, Recycle, type IconProps } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { STATUS_COLORS } from '@/constants/status-colors';
import {
  ECO_GUIDE_HOW_TO_READ,
  ECO_GUIDE_USE_NOTE,
  getExtraReduceTips,
  type FiberEcoGuide,
} from '@/data/fabrics/eco-guide';

function SectionLabel({ title }: { title: string }) {
  return (
    <Text accessibilityRole="header" style={styles.sectionLabel}>
      {title}
    </Text>
  );
}

/** One of the three action cards: icon tile, label, and the guide's text. */
function ActionCard({
  icon: Icon,
  label,
  title,
  text,
}: {
  icon: FC<IconProps>;
  label: string;
  /** Optional bold line above the text (the alternative's name). */
  title?: string;
  text: string;
}) {
  return (
    <View style={[styles.card, styles.actionCard, faintCardShadow()]}>
      <View style={styles.iconTile}>
        <Icon size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />
      </View>
      <View style={styles.actionBody}>
        <SectionLabel title={label} />
        {title ? <Text style={styles.actionTitle}>{title}</Text> : null}
        <Text style={styles.bodyText}>{text}</Text>
      </View>
    </View>
  );
}

/**
 * Eco tips for one fiber, from the Microplastics & Sustainable Choices Guide: what it sheds, how to
 * reduce shedding, a better-fit alternative and reuse ideas, then everyday tips. The guide's
 * sources are listed in About.
 */
export function EcoGuideSection({
  guide,
  isSynthetic,
  showSummary = true,
}: {
  guide: FiberEcoGuide;
  isSynthetic: boolean;
  /** False when the rated shedding card above already covers shedding for this fiber. */
  showSummary?: boolean;
}) {
  const [readOpen, setReadOpen] = useState(false);
  const chip = STATUS_COLORS[isSynthetic ? 'caution' : 'good'];

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

      {showSummary ? (
        <View style={[styles.card, styles.summaryCard, faintCardShadow()]}>
          <View style={styles.summaryHeader}>
            <SectionLabel title="SHEDDING & MICROPLASTICS" />
            <InfoButton onPress={() => setReadOpen(true)} accessibilityLabel="How to read these tips" />
          </View>
          <View style={[styles.chip, { backgroundColor: chip.pill, borderColor: chip.border }]}>
            <View style={[styles.chipDot, { backgroundColor: chip.accent }]} />
            <Text style={[styles.chipText, { color: chip.accent }]}>{guide.classification}</Text>
          </View>
          <Text style={styles.summaryText}>{guide.shedding}</Text>
        </View>
      ) : (
        <View style={styles.summaryHeader}>
          <SectionLabel title="ECO TIPS" />
          <InfoButton onPress={() => setReadOpen(true)} accessibilityLabel="How to read these tips" />
        </View>
      )}

      <View style={[styles.card, styles.actionCard, faintCardShadow()]}>
        <View style={styles.iconTile}>
          <Droplets size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />
        </View>
        <View style={styles.actionBody}>
          <SectionLabel title="REDUCE SHEDDING" />
          <Text style={styles.bodyText}>{guide.reduceShedding}</Text>
          <View style={styles.tipsDivider} />
          {getExtraReduceTips(isSynthetic).map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.bodyText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
      <ActionCard
        icon={Leaf}
        label="BETTER-FIT ALTERNATIVE"
        title={guide.alternative.name}
        text={guide.alternative.reason}
      />
      <ActionCard icon={Recycle} label="REUSE IT" text={guide.reuse} />


    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  summaryCard: {
    padding: 16,
    gap: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipText: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  summaryText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.text,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  actionBody: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 21,
    color: BrandColors.text,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
  },
  bodyText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  tipsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BrandColors.border,
    marginVertical: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    backgroundColor: BrandColors.primary,
  },
});
