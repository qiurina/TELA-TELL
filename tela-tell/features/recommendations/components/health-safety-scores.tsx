import { useState, type FC } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { InfoSheet } from '@/components/ui/info-sheet';
import { Heart, type IconProps } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  COMFORT_SHEET_SECTIONS,
  COMFORT_SHEET_TITLE,
} from '@/data/fabrics/assessment-disclaimers';
import {
  type HealthSafetyMetric,
  type HealthSafetyMetricId,
  type HealthSafetyTone,
} from '@/data/fabrics/health-safety-scores';

const TONE_COLORS: Record<
  HealthSafetyTone,
  {
    accent: string;
    gradient: readonly [string, string, ...string[]];
  }
> = {
  good: {
    accent: '#15803D',
    gradient: ['#4ADE80', '#22C55E', '#15803D'],
  },
  caution: {
    accent: '#B45309',
    gradient: ['#FBBF24', '#F59E0B', '#D97706'],
  },
  warn: {
    accent: '#B91C1C',
    gradient: ['#FB7185', '#F87171', '#DC2626'],
  },
};

const METRIC_ICONS: Record<HealthSafetyMetricId, FC<IconProps>> = {
  skinHealth: Heart,
};

type HealthSafetyScoresProps = {
  metrics: HealthSafetyMetric[];
};

function MetricCard({ metric }: { metric: HealthSafetyMetric }) {
  const colors = TONE_COLORS[metric.tone];
  const Icon = METRIC_ICONS[metric.id];
  const fillPercent = Math.max(8, Math.min(100, (metric.score / 10) * 100));

  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Icon size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />
        </View>

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {metric.title}
            </Text>
            <View style={styles.valueBlock}>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreValue, { color: colors.accent }]}>
                  {metric.valueLabel}
                </Text>
                {metric.valueSuffix ? (
                  <Text style={[styles.scoreMax, { color: colors.accent }]}>
                    {metric.valueSuffix}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
          <Text style={styles.note}>{metric.note}</Text>
        </View>
      </View>

      <View style={styles.track}>
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width: `${fillPercent}%` }]}
        />
      </View>
    </View>
  );
}

/** Wearing Comfort card — score + bar color-coded; chrome stays neutral. */
export function HealthSafetyScores({ metrics }: HealthSafetyScoresProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  if (metrics.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <InfoSheet
        visible={showDisclaimer}
        title={COMFORT_SHEET_TITLE}
        sections={COMFORT_SHEET_SECTIONS}
        icon={Heart}
        onClose={() => setShowDisclaimer(false)}
      />

      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>COMFORT</Text>
        <InfoButton
          onPress={() => setShowDisclaimer(true)}
          accessibilityLabel="About this comfort estimate"
        />
      </View>
      <View style={styles.list}>
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BrandColors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  valueBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  scoreMax: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    opacity: 0.75,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  track: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: BrandColors.borderLight,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
