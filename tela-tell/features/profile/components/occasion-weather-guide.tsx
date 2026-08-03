import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  OCCASION_CONTEXT_OPTIONS,
  WEATHER_CONTEXT_OPTIONS,
  type DressingContext,
  type DressingContextOption,
} from '@/data/preferences/occasion-weather';
import { DRESSING_CONTEXT_ICONS } from '@/features/profile/dressing-context-icons';

type OccasionWeatherGuideProps = {
  selected: DressingContext[];
  onToggle: (context: DressingContext) => void;
  disabled?: boolean;
  compact?: boolean;
  category?: 'weather' | 'occasion' | 'both';
};

function OptionPill({
  option,
  active,
  onToggle,
  disabled,
}: {
  option: DressingContextOption;
  active: boolean;
  onToggle: (context: DressingContext) => void;
  disabled?: boolean;
}) {
  const Icon = DRESSING_CONTEXT_ICONS[option.id];
  const iconColor = active ? BrandColors.primaryDark : BrandColors.textMuted;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={() => onToggle(option.id)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ selected: active }}
      accessibilityLabel={option.label}>
      <Icon size={14} color={iconColor} strokeWidth={2.25} />
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{option.label}</Text>
    </Pressable>
  );
}

function OptionSection({
  title,
  options,
  selected,
  onToggle,
  disabled,
}: {
  title: string;
  options: DressingContextOption[];
  selected: DressingContext[];
  onToggle: (context: DressingContext) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.pillRow}>
        {options.map((option) => (
          <OptionPill
            key={option.id}
            option={option}
            active={selected.includes(option.id)}
            onToggle={onToggle}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

export function OccasionWeatherGuide({
  selected = [],
  onToggle,
  disabled,
  category = 'both',
}: OccasionWeatherGuideProps) {
  const showWeather = category === 'both' || category === 'weather';
  const showOccasion = category === 'both' || category === 'occasion';

  return (
    <View style={styles.root}>
      {category === 'both' ? (
        <Text style={styles.title}>What are you dressing for?</Text>
      ) : null}

      {showWeather ? (
        <OptionSection
          title="Weather"
          options={WEATHER_CONTEXT_OPTIONS}
          selected={selected}
          onToggle={onToggle}
          disabled={disabled}
        />
      ) : null}
      {showOccasion ? (
        <OptionSection
          title="Occasion"
          options={OCCASION_CONTEXT_OPTIONS}
          selected={selected}
          onToggle={onToggle}
          disabled={disabled}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
    marginTop: -4,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: BrandColors.textMuted,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
  },
  pillActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.lavenderCard,
  },
  pillText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  pillTextActive: {
    color: BrandColors.primaryDark,
    fontFamily: Fonts.semiBold,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.6,
  },
});
