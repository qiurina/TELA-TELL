import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OccasionWeatherGuide } from '@/features/profile/components/occasion-weather-guide';
import { Check, CircleCheck, Plus, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { SUPPORTED_FABRICS, type SupportedFabric } from '@/data/fabrics/fabrics';
import { Fonts } from '@/constants/fonts';
import { getScanMode, setScanMode, type ScanMode } from '@/features/scan/lib/scan-session';
import {
  getUserPreferences,
  setUserPreference,
  togglePreferredFabric,
  toggleSensitiveFabric,
  toggleDressingContext,
  type SkinTone,
  type SkinUndertone,
} from '@/features/profile/lib/user-preferences';

const SKIN_TONE_SWATCHES: Record<SkinTone, string> = {
  Fair: '#F5D0B5',
  Light: '#E8C4A0',
  'Light-Medium': '#DDB88A',
  Medium: '#C99B6E',
  Tan: '#A67B4E',
  'Deep Dark': '#4A3228',
};

const SKIN_TONE_OPTIONS: { value: SkinTone; label: string }[] = [
  { value: 'Fair', label: 'Fair' },
  { value: 'Light', label: 'Light' },
  { value: 'Light-Medium', label: 'Light-Medium' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Tan', label: 'Tan' },
  { value: 'Deep Dark', label: 'Deep / Dark' },
];

const UNDERTONE_SWATCHES: Record<SkinUndertone, string> = {
  Cool: '#C4B5D8',
  Warm: '#E8A87C',
  Neutral: '#D4B896',
  Olive: '#9A8B5C',
};

const UNDERTONE_OPTIONS: { value: SkinUndertone; label: string }[] = [
  { value: 'Cool', label: 'Cool' },
  { value: 'Warm', label: 'Warm' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Olive', label: 'Olive' },
];

const SCAN_MODE_OPTIONS: { value: ScanMode; label: string }[] = [
  { value: 'single', label: 'Single fabric' },
  { value: 'dual', label: 'Two swatches' },
];

const ALLERGY_COLORS = {
  border: '#f87171',
  background: '#fef2f2',
  text: '#dc2626',
};

const PREFERRED_COLORS = {
  border: '#4ade80',
  background: '#f0fdf4',
  text: '#15803d',
};

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

function HorizontalSwatchPicker<T extends string>({
  title,
  hint,
  options,
  swatches,
  selected,
  onSelect,
  disabled,
}: {
  title: string;
  hint?: string;
  options: { value: T; label: string }[];
  swatches: Record<T, string>;
  selected: T | null;
  onSelect: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} hint={hint} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalPickerContent}>
        {options.map((option) => {
          const active = selected === option.value;

          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.swatchCard,
                active && styles.swatchCardActive,
                pressed && styles.pressed,
                disabled && styles.disabled,
              ]}
              onPress={() => onSelect(option.value)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}>
              <View
                style={[
                  styles.swatchCircle,
                  { backgroundColor: swatches[option.value] },
                  active && styles.swatchCircleActive,
                ]}
              />
              <Text style={[styles.swatchLabel, active && styles.swatchLabelActive]} numberOfLines={2}>
                {option.label}
              </Text>
              {active ? (
                <CircleCheck size={16} color={BrandColors.primary} strokeWidth={2.25} />
              ) : (
                <View style={styles.swatchCheckPlaceholder} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function FabricTogglePill({
  label,
  active,
  variant,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  variant: 'allergy' | 'preferred';
  onPress: () => void;
  disabled?: boolean;
}) {
  const palette = variant === 'allergy' ? ALLERGY_COLORS : PREFERRED_COLORS;
  const iconColor = active ? palette.text : BrandColors.textMuted;
  const iconSize = 12;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fabricPill,
        active && {
          borderColor: palette.border,
          backgroundColor: palette.background,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}>
      {active ? (
        variant === 'allergy' ? (
          <View style={styles.pillContent}>
            <Text style={[styles.fabricPillText, { color: palette.text }]}>{label}</Text>
            <X size={iconSize} color={iconColor} strokeWidth={2.5} />
          </View>
        ) : (
          <View style={styles.pillContent}>
            <Text style={[styles.fabricPillText, { color: palette.text }]}>{label}</Text>
            <Check size={iconSize} color={iconColor} strokeWidth={2.5} />
          </View>
        )
      ) : (
        <View style={styles.pillContent}>
          <Plus size={iconSize} color={iconColor} strokeWidth={2.5} />
          <Text style={styles.fabricPillTextMuted}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function FabricToggleSection({
  title,
  hint,
  fabrics,
  selected,
  variant,
  onToggle,
  disabled,
}: {
  title: string;
  hint?: string;
  fabrics: SupportedFabric[];
  selected: SupportedFabric[];
  variant: 'allergy' | 'preferred';
  onToggle: (fabric: SupportedFabric) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} hint={hint} />
      <View style={styles.fabricPillRow}>
        {fabrics.map((fabric) => (
          <FabricTogglePill
            key={fabric}
            label={fabric}
            active={selected.includes(fabric)}
            variant={variant}
            onPress={() => onToggle(fabric)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

function ScanModeRow({
  selected,
  onSelect,
  disabled,
}: {
  selected: ScanMode;
  onSelect: (value: ScanMode) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.scanModeRow}>
      {SCAN_MODE_OPTIONS.map((option) => {
        const active = selected === option.value;

        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.scanModeChip,
              active && styles.scanModeChipActive,
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}
            onPress={() => onSelect(option.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}>
            <Text style={[styles.scanModeText, active && styles.scanModeTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type UserPreferencesPanelProps = {
  disabled?: boolean;
  embedded?: boolean;
  onChange?: () => void;
};

export function UserPreferencesPanel({
  disabled,
  embedded = false,
  onChange,
}: UserPreferencesPanelProps) {
  const [prefs, setPrefs] = useState(getUserPreferences);
  const [mode, setMode] = useState(getScanMode);

  useFocusEffect(
    useCallback(() => {
      setPrefs(getUserPreferences());
      setMode(getScanMode());
    }, []),
  );

  const refresh = () => {
    setPrefs(getUserPreferences());
    onChange?.();
  };

  const updatePref = <K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) => {
    setUserPreference(key, value);
    refresh();
  };

  const updateMode = (next: ScanMode) => {
    setScanMode(next);
    setMode(next);
    onChange?.();
  };

  const fabricNames: SupportedFabric[] = [...SUPPORTED_FABRICS];

  return (
    <View style={[styles.panel, embedded && styles.panelEmbedded]}>
      {!embedded ? (
        <>
          <Text style={styles.panelTitle}>Your profile</Text>
          <Text style={styles.panelHint}>
            Set once — personalizes color tips, allergy alerts, and fabric guidance across scans.
          </Text>
        </>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan settings</Text>
        <SectionHeader title="Scan mode" />
        <ScanModeRow selected={mode} onSelect={updateMode} disabled={disabled} />
        {mode === 'dual' ? (
          <Text style={styles.dualHint}>
            Place two fabric swatches on a flat surface, then draw a box around each one before
            analyzing.
          </Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      <HorizontalSwatchPicker
        title="Skin tone"
        options={SKIN_TONE_OPTIONS}
        swatches={SKIN_TONE_SWATCHES}
        selected={prefs.skinTone}
        onSelect={(value) => updatePref('skinTone', value)}
        disabled={disabled}
      />

      <HorizontalSwatchPicker
        title="Skin undertone"
        hint="Important for color recommendations"
        options={UNDERTONE_OPTIONS}
        swatches={UNDERTONE_SWATCHES}
        selected={prefs.skinUndertone}
        onSelect={(value) => updatePref('skinUndertone', value)}
        disabled={disabled}
      />

      <FabricToggleSection
        title="Fabric allergies"
        hint="Select fabrics you are sensitive to"
        fabrics={fabricNames}
        selected={prefs.sensitiveFabrics}
        variant="allergy"
        onToggle={(fabric) => {
          toggleSensitiveFabric(fabric);
          refresh();
        }}
        disabled={disabled}
      />

      <FabricToggleSection
        title="Preferred fabrics"
        hint="Fabrics you like or prefer"
        fabrics={fabricNames}
        selected={prefs.preferredFabrics}
        variant="preferred"
        onToggle={(fabric) => {
          togglePreferredFabric(fabric);
          refresh();
        }}
        disabled={disabled}
      />

      <View style={styles.divider} />

      <OccasionWeatherGuide
        selected={prefs.dressingContexts ?? []}
        onToggle={(context) => {
          toggleDressingContext(context);
          refresh();
        }}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 28,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  panelEmbedded: {
    borderWidth: 0,
    padding: 0,
    borderRadius: 0,
    gap: 28,
  },
  panelTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  panelHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    marginTop: -20,
    lineHeight: 17,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  sectionHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
    marginBottom: -4,
  },
  horizontalPickerContent: {
    gap: 10,
    paddingRight: 4,
  },
  swatchCard: {
    width: 88,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
  },
  swatchCardActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.lavenderCard,
  },
  swatchCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  swatchCircleActive: {
    borderColor: BrandColors.primary,
  },
  swatchLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    color: BrandColors.textMuted,
    minHeight: 28,
  },
  swatchLabelActive: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
  swatchCheckPlaceholder: {
    width: 16,
    height: 16,
  },
  fabricPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fabricPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fabricPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  fabricPillTextMuted: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  scanModeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scanModeChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
  },
  scanModeChipActive: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.lavenderCard,
  },
  scanModeText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  scanModeTextActive: {
    color: BrandColors.primaryDark,
    fontFamily: Fonts.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.borderLight,
  },
  dualHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.primaryDark,
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 10,
    padding: 10,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.6,
  },
});
