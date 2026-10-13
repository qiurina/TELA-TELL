import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { OccasionWeatherGuide } from '@/features/profile/components/occasion-weather-guide';
import { Check, Plus, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { SUPPORTED_FABRICS, type SupportedFabric } from '@/data/fabrics/fabrics';
import { Fonts } from '@/constants/fonts';
import {
  getUserPreferencesSnapshot,
  hydrateUserPreferences,
  moveFabricToPreferred,
  moveFabricToSensitive,
  persistUserPreferences,
  setUserPreferences,
  subscribeUserPreferences,
  toggleDressingContext,
  togglePreferredFabric,
  toggleSensitiveFabric,
} from '@/features/profile/lib/user-preferences';

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

const BLOCKED_COLORS = {
  border: BrandColors.borderLight,
  background: '#F2F4F5',
  text: '#9CA3AF',
};

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{title}</Text>
    </View>
  );
}

function FabricTogglePill({
  label,
  active,
  blocked,
  variant,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  blocked?: boolean;
  variant: 'allergy' | 'preferred';
  onPress: () => void;
  disabled?: boolean;
}) {
  const palette = variant === 'allergy' ? ALLERGY_COLORS : PREFERRED_COLORS;
  const iconColor = active ? palette.text : blocked ? BLOCKED_COLORS.text : BrandColors.textMuted;
  const iconSize = 12;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fabricPill,
        active && {
          borderColor: palette.border,
          backgroundColor: palette.background,
        },
        !active && blocked && styles.fabricPillBlocked,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled: blocked && !active }}>
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
          <Text
            style={[
              blocked ? styles.fabricPillTextBlocked : styles.fabricPillTextMuted,
            ]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function FabricToggleSection({
  title,
  fabrics,
  selected,
  blockedFabrics,
  variant,
  onToggle,
  disabled,
}: {
  title: string;
  fabrics: SupportedFabric[];
  selected: SupportedFabric[];
  blockedFabrics: SupportedFabric[];
  variant: 'allergy' | 'preferred';
  onToggle: (fabric: SupportedFabric) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <View style={styles.fabricPillRow}>
        {fabrics.map((fabric) => {
          const active = selected.includes(fabric);
          const blocked = !active && blockedFabrics.includes(fabric);

          return (
            <FabricTogglePill
              key={fabric}
              label={fabric}
              active={active}
              blocked={blocked}
              variant={variant}
              onPress={() => onToggle(fabric)}
              disabled={disabled}
            />
          );
        })}
      </View>
    </View>
  );
}

type UserPreferencesPanelProps = {
  disabled?: boolean;
  embedded?: boolean;
  onChange?: () => void;
  scope?:
    | 'full'
    | 'personalization'
    | 'allergies'
    | 'preferred'
    | 'weather'
    | 'occasion';
  hideAutoSaveHint?: boolean;
};

type PendingFabricMove = {
  fabric: SupportedFabric;
  target: 'sensitive' | 'preferred';
};

function getFabricMoveMessage(pending: PendingFabricMove): string {
  const otherList = pending.target === 'sensitive' ? 'preferred fibers' : 'sensitivities';
  const targetList = pending.target === 'sensitive' ? 'sensitivities' : 'preferred fibers';
  return `${pending.fabric} is in your ${otherList}. Move it to ${targetList} instead?`;
}

export function UserPreferencesPanel({
  disabled,
  embedded = false,
  onChange,
  scope = 'full',
  hideAutoSaveHint = false,
}: UserPreferencesPanelProps) {
  const prefs = useSyncExternalStore(
    subscribeUserPreferences,
    getUserPreferencesSnapshot,
    getUserPreferencesSnapshot,
  );
  const [pendingMove, setPendingMove] = useState<PendingFabricMove | null>(null);
  const hasEditedRef = useRef(false);

  useEffect(() => {
    let active = true;
    hasEditedRef.current = false;

    void (async () => {
      const loaded = await hydrateUserPreferences({ apply: false });
      if (!active || hasEditedRef.current) {
        return;
      }
      setUserPreferences(loaded);
    })();

    return () => {
      active = false;
    };
  }, []);

  const applyPrefsUpdate = (mutate: () => void) => {
    hasEditedRef.current = true;
    mutate();
    void persistUserPreferences();
    onChange?.();
  };

  const handleSensitiveToggle = (fabric: SupportedFabric) => {
    if (prefs.sensitiveFabrics.includes(fabric)) {
      applyPrefsUpdate(() => toggleSensitiveFabric(fabric));
      return;
    }

    if (prefs.preferredFabrics.includes(fabric)) {
      setPendingMove({ fabric, target: 'sensitive' });
      return;
    }

    applyPrefsUpdate(() => toggleSensitiveFabric(fabric));
  };

  const handlePreferredToggle = (fabric: SupportedFabric) => {
    if (prefs.preferredFabrics.includes(fabric)) {
      applyPrefsUpdate(() => togglePreferredFabric(fabric));
      return;
    }

    if (prefs.sensitiveFabrics.includes(fabric)) {
      setPendingMove({ fabric, target: 'preferred' });
      return;
    }

    applyPrefsUpdate(() => togglePreferredFabric(fabric));
  };

  const handleConfirmMove = () => {
    if (!pendingMove) {
      return;
    }
    const { fabric, target } = pendingMove;
    setPendingMove(null);
    if (target === 'sensitive') {
      applyPrefsUpdate(() => moveFabricToSensitive(fabric));
    } else {
      applyPrefsUpdate(() => moveFabricToPreferred(fabric));
    }
  };

  const handleDressingToggle = (context: (typeof prefs.dressingContexts)[number]) => {
    applyPrefsUpdate(() => toggleDressingContext(context));
  };

  const fabricNames: SupportedFabric[] = [...SUPPORTED_FABRICS];
  const showPersonalization = scope === 'full' || scope === 'personalization';
  const showAllergies = showPersonalization || scope === 'allergies';
  const showPreferred = showPersonalization || scope === 'preferred';
  const showWeather = showPersonalization || scope === 'weather';
  const showOccasion = showPersonalization || scope === 'occasion';
  const showDressingGuide = showWeather || showOccasion;
  const dressingCategory =
    showWeather && showOccasion ? 'both' : showWeather ? 'weather' : showOccasion ? 'occasion' : 'both';

  return (
    <View style={[styles.panel, embedded && styles.panelEmbedded]}>
      <ConfirmDialog
        visible={pendingMove !== null}
        title={pendingMove ? `${pendingMove.fabric} is already selected` : ''}
        message={pendingMove ? getFabricMoveMessage(pendingMove) : ''}
        confirmLabel="Move"
        cancelLabel="Cancel"
        onConfirm={handleConfirmMove}
        onCancel={() => setPendingMove(null)}
      />
      {showAllergies ? (
        <FabricToggleSection
          title="Fiber sensitivities"
          fabrics={fabricNames}
          selected={prefs.sensitiveFabrics}
          blockedFabrics={prefs.preferredFabrics}
          variant="allergy"
          onToggle={handleSensitiveToggle}
          disabled={disabled}
        />
      ) : null}

      {showAllergies && showPreferred ? <View style={styles.divider} /> : null}

      {showPreferred ? (
        <FabricToggleSection
          title="Preferred fiber types"
          fabrics={fabricNames}
          selected={prefs.preferredFabrics}
          blockedFabrics={prefs.sensitiveFabrics}
          variant="preferred"
          onToggle={handlePreferredToggle}
          disabled={disabled}
        />
      ) : null}

      {showPreferred && showDressingGuide ? <View style={styles.divider} /> : null}

      {showDressingGuide ? (
        <OccasionWeatherGuide
          selected={prefs.dressingContexts ?? []}
          onToggle={handleDressingToggle}
          disabled={disabled}
          category={dressingCategory}
        />
      ) : null}

      {hideAutoSaveHint || disabled ? null : (
        <Text style={styles.autoSaveHint}>Changes saved automatically</Text>
      )}
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
  fabricPillBlocked: {
    borderColor: BLOCKED_COLORS.border,
    backgroundColor: BLOCKED_COLORS.background,
    opacity: 0.72,
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
  fabricPillTextBlocked: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: BLOCKED_COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.borderLight,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.6,
  },
  autoSaveHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
