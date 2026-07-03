import type { FC } from 'react';
import { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CircleCheck,
  History,
  Scissors,
  Sparkles,
  X,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import {
  GARMENT_CONDITION_OPTIONS,
  type GarmentCondition,
} from '@/data/scans/garment-condition';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type GarmentConditionPickerProps = {
  value: GarmentCondition;
  onChange: (value: GarmentCondition) => void;
  disabled?: boolean;
  embedded?: boolean;
};

const CONDITION_ICONS: Record<GarmentCondition, FC<IconProps>> = {
  New: Sparkles,
  Good: CircleCheck,
  Worn: History,
  Damaged: Scissors,
};

const CONDITION_ACCENT: Record<GarmentCondition, string> = {
  New: '#15803d',
  Good: BrandColors.primary,
  Worn: '#b45309',
  Damaged: '#dc2626',
};

export function getGarmentConditionLabel(value: GarmentCondition): string {
  return GARMENT_CONDITION_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function GarmentConditionIcon({
  condition,
  size = 16,
  selected,
}: {
  condition: GarmentCondition;
  size?: number;
  selected?: boolean;
}) {
  const Icon = CONDITION_ICONS[condition];
  const color = selected ? CONDITION_ACCENT[condition] : BrandColors.primary;
  return <Icon size={size} color={color} strokeWidth={2.25} />;
}

export function GarmentConditionSheet({
  visible,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  value: GarmentCondition;
  onChange: (value: GarmentCondition) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <View style={sheetStyles.root}>
        <Pressable
          style={sheetStyles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={[sheetStyles.sheet, faintCardShadow(), { paddingBottom: insets.bottom + 16 }]}>
          <View style={sheetStyles.handle} />

          <View style={sheetStyles.headerRow}>
            <View style={sheetStyles.headerText}>
              <Text style={sheetStyles.title}>How worn is it?</Text>
              <Text style={sheetStyles.subtitle}>Helps tailor reuse tips</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <X size={20} color={BrandColors.textMuted} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={sheetStyles.optionsBlock}>
            {GARMENT_CONDITION_OPTIONS.map((option, index) => {
              const selected = value === option.value;
              const Icon = CONDITION_ICONS[option.value];
              const accent = CONDITION_ACCENT[option.value];
              const isLast = index === GARMENT_CONDITION_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    sheetStyles.optionRow,
                    isLast && sheetStyles.optionRowLast,
                    selected && sheetStyles.optionRowSelected,
                    pressed && sheetStyles.pressed,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.label}, ${option.subtitle}`}>
                  <View style={sheetStyles.optionIcon}>
                    <Icon
                      size={18}
                      color={selected ? accent : BrandColors.textMuted}
                      strokeWidth={2.25}
                    />
                  </View>
                  <View style={sheetStyles.optionText}>
                    <Text style={[sheetStyles.optionLabel, selected && { color: accent }]}>
                      {option.label}
                    </Text>
                    <Text style={sheetStyles.optionSubtitle}>{option.subtitle}</Text>
                  </View>
                  {selected ? <CircleCheck size={18} color={accent} strokeWidth={2.25} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function GarmentConditionPicker({
  value,
  onChange,
  disabled = false,
  embedded = false,
}: GarmentConditionPickerProps) {
  return (
    <View style={[styles.block, embedded && styles.blockEmbedded]}>
      {!embedded ? (
        <>
          <Text style={styles.title}>How is this garment?</Text>
          <Text style={styles.subtitle}>This helps us give better reuse recommendations.</Text>
        </>
      ) : (
        <Text style={styles.embeddedHint}>Garment condition for reuse tips</Text>
      )}

      <View style={styles.grid}>
        {GARMENT_CONDITION_OPTIONS.map((option) => {
          const selected = value === option.value;
          const accent = CONDITION_ACCENT[option.value];
          const Icon = CONDITION_ICONS[option.value];

          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.card,
                embedded && styles.cardEmbedded,
                selected && {
                  borderColor: accent,
                  backgroundColor: `${accent}12`,
                },
                pressed && styles.pressed,
                disabled && styles.disabled,
              ]}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option.label}, ${option.subtitle}`}>
              <Icon
                size={embedded ? 15 : 18}
                color={selected ? accent : BrandColors.textMuted}
                strokeWidth={2.25}
              />
              <Text style={[styles.cardLabel, embedded && styles.cardLabelEmbedded, selected && { color: accent }]}>
                {option.label}
              </Text>
              {!embedded ? <Text style={styles.cardSubtitle}>{option.subtitle}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.borderLight,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.primaryDark,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  optionsBlock: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionRowSelected: {
    backgroundColor: BrandColors.lavenderCard,
  },
  optionIcon: {
    width: 24,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  optionSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: BrandColors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  blockEmbedded: {
    width: '100%',
    gap: 6,
  },
  embeddedHint: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  card: {
    width: '48%',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
  },
  cardEmbedded: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  cardLabelEmbedded: {
    fontSize: 12,
  },
  cardSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.7,
  },
});
