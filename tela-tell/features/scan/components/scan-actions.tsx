import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GarmentConditionIcon,
  GarmentConditionSheet,
  getGarmentConditionLabel,
} from '@/features/scan/components/garment-condition-picker';
import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import {
  Camera,
  ChevronRight,
  ImagePlus,
  Lock,
  Plus,
  Settings,
  Tag,
  X,
} from '@/components/ui/lucide-icons';
import {
  DEFAULT_GARMENT_CONDITION,
  type GarmentCondition,
} from '@/data/scans/garment-condition';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, primaryButtonShadow } from '@/constants/shadows';
import { useAuth } from '@/features/auth/context/auth-provider';
import {
  getUserPreferencesSummary,
  hasActiveUserPreferences,
} from '@/features/profile/lib/user-preferences';

const primaryGradient = [BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark] as const;

type FloatingCaptureBarProps = {
  hasPreview?: boolean;
  onTakePhoto: () => void;
  onUpload: () => void;
  onTryAnother: () => void;
  isAnalyzing?: boolean;
};

export function FloatingCaptureBar({
  hasPreview = false,
  onTakePhoto,
  onUpload,
  onTryAnother,
  isAnalyzing,
}: FloatingCaptureBarProps) {
  return (
    <View style={styles.controlsRow}>
      <Pressable
        style={({ pressed }) => [
          styles.sideButton,
          pressed && styles.pressed,
          isAnalyzing && styles.disabled,
        ]}
        onPress={onUpload}
        disabled={isAnalyzing}
        accessibilityRole="button"
        accessibilityLabel="Upload from gallery">
        <ImagePlus size={22} color={BrandColors.white} strokeWidth={2.25} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.shutterOuter,
          pressed && styles.pressed,
          isAnalyzing && styles.disabled,
        ]}
        onPress={onTakePhoto}
        disabled={isAnalyzing}
        accessibilityRole="button"
        accessibilityLabel={hasPreview ? 'Retake photo' : 'Take photo'}>
        <LinearGradient
          colors={[...primaryGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.shutterInner, primaryButtonShadow()]}>
          <Camera size={26} color={BrandColors.white} strokeWidth={2.25} />
        </LinearGradient>
      </Pressable>

      {hasPreview ? (
        <Pressable
          style={({ pressed }) => [
            styles.sideButton,
            pressed && styles.pressed,
            isAnalyzing && styles.disabled,
          ]}
          onPress={onTryAnother}
          disabled={isAnalyzing}
          accessibilityRole="button"
          accessibilityLabel="Clear photo">
          <X size={22} color={BrandColors.white} strokeWidth={2.25} />
        </Pressable>
      ) : (
        <View style={styles.sideButtonPlaceholder} />
      )}
    </View>
  );
}

type ScanDetailsPanelProps = {
  savedSellerLabel?: string | null;
  garmentCondition: GarmentCondition;
  onGarmentConditionChange: (condition: GarmentCondition) => void;
  onAddLabel: () => void;
  onOpenPreferences?: () => void;
  isAnalyzing?: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  variant?: 'chip' | 'sheet';
};

function DetailActionRow({
  icon,
  label,
  value,
  isSet,
  onPress,
  disabled,
  locked,
  accessibilityLabel,
  isLast = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isSet: boolean;
  onPress: () => void;
  disabled?: boolean;
  locked?: boolean;
  accessibilityLabel: string;
  isLast?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.detailRow,
        isLast && styles.detailRowLast,
        locked && styles.detailRowLocked,
        pressed && !locked && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}>
      <View style={styles.detailRowIcon}>{icon}</View>
      <Text style={[styles.detailRowLabel, locked && styles.detailRowLabelLocked]}>{label}</Text>
      <Text
        style={[
          styles.detailRowValue,
          locked
            ? styles.detailRowValueLocked
            : isSet
              ? styles.detailRowValueSet
              : styles.detailRowValueEmpty,
        ]}
        numberOfLines={1}>
        {value}
      </Text>
      {locked ? (
        <Lock size={14} color="#C27803" strokeWidth={2.25} />
      ) : (
        <ChevronRight size={16} color={BrandColors.textMuted} strokeWidth={2.25} />
      )}
    </Pressable>
  );
}

export function ScanDetailsPanel({
  savedSellerLabel,
  garmentCondition,
  onGarmentConditionChange,
  onAddLabel,
  onOpenPreferences,
  isAnalyzing,
  expanded,
  onExpandedChange,
  variant = 'chip',
}: ScanDetailsPanelProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [showPreferencesLocked, setShowPreferencesLocked] = useState(false);
  const [showConditionSheet, setShowConditionSheet] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(() => hasActiveUserPreferences());
  const trimmedLabel = savedSellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;
  const preferencesLocked = !isSignedIn;
  const hasCustomCondition = garmentCondition !== DEFAULT_GARMENT_CONDITION;

  useFocusEffect(
    useCallback(() => {
      setHasPreferences(hasActiveUserPreferences());
    }, []),
  );

  const summaryParts: string[] = [];
  if (hasCustomCondition) {
    summaryParts.push(getGarmentConditionLabel(garmentCondition));
  }
  if (hasSellerLabel) {
    summaryParts.push(trimmedLabel);
  }
  if (hasPreferences && !preferencesLocked) {
    summaryParts.push('Prefs set');
  }
  const hasAnyDetails = summaryParts.length > 0;
  const chipLabel = hasAnyDetails ? summaryParts.join(' · ') : 'Add details';

  const preferencesSummary = getUserPreferencesSummary();
  const preferencesStatus = preferencesLocked
    ? 'Sign in required'
    : !hasPreferences
      ? 'Not set'
      : preferencesSummary ?? 'Set';

  const useSheet = variant === 'sheet';

  return (
    <View>
      <ScanConfirmSheet
        visible={showPreferencesLocked}
        variant="info"
        title="Preferences locked"
        message="Sign in to save skin tone, allergies, and fabric preferences."
        confirmLabel="Log in"
        cancelLabel="Not now"
        onConfirm={() => {
          setShowPreferencesLocked(false);
          router.push('/login' as Href);
        }}
        onCancel={() => setShowPreferencesLocked(false)}
      />

      {!expanded && !useSheet ? (
        <Pressable
          style={({ pressed }) => [styles.detailsChip, pressed && styles.pressed]}
          onPress={() => onExpandedChange(true)}
          disabled={isAnalyzing}
          accessibilityRole="button"
          accessibilityLabel="Add details">
          <View style={styles.detailsChipIcon}>
            <Plus size={14} color={BrandColors.white} strokeWidth={2.5} />
          </View>
          <Text style={styles.detailsChipText} numberOfLines={1}>
            {chipLabel}
          </Text>
          {!hasAnyDetails ? (
            <Text style={styles.detailsChipOptional}>Optional</Text>
          ) : null}
        </Pressable>
      ) : useSheet ? (
        <View style={[styles.detailsCard, faintCardShadow()]}>
          <View style={styles.sheetHeader}>
            <View style={styles.accordionTriggerText}>
              <View style={styles.accordionTitleRow}>
                <Text style={styles.detailsTitle}>Add details</Text>
                <View style={styles.optionalPill}>
                  <Text style={styles.optionalPillText}>Optional</Text>
                </View>
              </View>
              <Text style={styles.accordionHint}>Condition, stated label, preferences</Text>
            </View>
          </View>

          <View style={styles.detailRowsBlock}>
            <DetailActionRow
              icon={<GarmentConditionIcon condition={garmentCondition} />}
              label="Fabric condition"
              value={getGarmentConditionLabel(garmentCondition)}
              isSet
              onPress={() => setShowConditionSheet(true)}
              disabled={isAnalyzing}
              accessibilityLabel={`Fabric condition, ${getGarmentConditionLabel(garmentCondition)}. Change`}
            />

            <DetailActionRow
              icon={<Tag size={16} color={BrandColors.primary} strokeWidth={2.25} />}
              label="Stated label"
              value={hasSellerLabel ? trimmedLabel : 'Not set'}
              isSet={hasSellerLabel}
              onPress={onAddLabel}
              disabled={isAnalyzing}
              accessibilityLabel={
                hasSellerLabel
                  ? `Stated label, ${trimmedLabel}. Update`
                  : 'Stated label, not set. Add'
              }
            />

            <DetailActionRow
              icon={
                preferencesLocked ? (
                  <Lock size={16} color="#C27803" strokeWidth={2.25} />
                ) : (
                  <Settings size={16} color={BrandColors.primary} strokeWidth={2.25} />
                )
              }
              label="Preferences"
              value={preferencesStatus}
              isSet={hasPreferences && !preferencesLocked}
              locked={preferencesLocked}
              onPress={
                preferencesLocked
                  ? () => setShowPreferencesLocked(true)
                  : onOpenPreferences ?? (() => {})
              }
              disabled={isAnalyzing}
              isLast
              accessibilityLabel={
                preferencesLocked
                  ? 'Preferences locked. Sign in required'
                  : hasPreferences
                    ? `Preferences, ${preferencesStatus}. Edit`
                    : 'Preferences, not set. Set'
              }
            />
          </View>
        </View>
      ) : (
        <View style={[styles.detailsCard, faintCardShadow()]}>
          <Pressable
            style={({ pressed }) => [styles.accordionTrigger, pressed && styles.pressed]}
            onPress={() => onExpandedChange(!expanded)}
            disabled={isAnalyzing}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Hide add details' : 'Add details'}>
            <View style={[styles.accordionChevron, expanded && styles.accordionChevronOpen]}>
              <ChevronRight size={16} color={BrandColors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.accordionTriggerText}>
              <View style={styles.accordionTitleRow}>
                <Text style={styles.detailsTitle}>Add details</Text>
                <View style={styles.optionalPill}>
                  <Text style={styles.optionalPillText}>Optional</Text>
                </View>
              </View>
              <Text style={styles.accordionHint} numberOfLines={1}>
                {expanded
                  ? 'Condition, stated label, preferences'
                  : hasAnyDetails
                    ? summaryParts.join(' · ')
                    : 'Condition, stated label, preferences'}
              </Text>
            </View>
          </Pressable>

          {expanded ? (
            <View style={styles.detailRowsBlock}>
              <DetailActionRow
                icon={<GarmentConditionIcon condition={garmentCondition} />}
                label="Fabric condition"
                value={getGarmentConditionLabel(garmentCondition)}
                isSet
                onPress={() => setShowConditionSheet(true)}
                disabled={isAnalyzing}
                accessibilityLabel={`Fabric condition, ${getGarmentConditionLabel(garmentCondition)}. Change`}
              />

              <DetailActionRow
                icon={<Tag size={16} color={BrandColors.primary} strokeWidth={2.25} />}
                label="Stated label"
                value={hasSellerLabel ? trimmedLabel : 'Not set'}
                isSet={hasSellerLabel}
                onPress={onAddLabel}
                disabled={isAnalyzing}
                accessibilityLabel={
                  hasSellerLabel
                    ? `Stated label, ${trimmedLabel}. Update`
                    : 'Stated label, not set. Add'
                }
              />

              <DetailActionRow
                icon={
                  preferencesLocked ? (
                    <Lock size={16} color="#C27803" strokeWidth={2.25} />
                  ) : (
                    <Settings size={16} color={BrandColors.primary} strokeWidth={2.25} />
                  )
                }
                label="Preferences"
                value={preferencesStatus}
                isSet={hasPreferences && !preferencesLocked}
                locked={preferencesLocked}
                onPress={
                  preferencesLocked
                    ? () => setShowPreferencesLocked(true)
                    : onOpenPreferences ?? (() => {})
                }
                disabled={isAnalyzing}
                isLast
                accessibilityLabel={
                  preferencesLocked
                    ? 'Preferences locked. Sign in required'
                    : hasPreferences
                      ? `Preferences, ${preferencesStatus}. Edit`
                      : 'Preferences, not set. Set'
                }
              />
            </View>
          ) : null}
        </View>
      )}

      <GarmentConditionSheet
        visible={showConditionSheet}
        value={garmentCondition}
        onChange={onGarmentConditionChange}
        onClose={() => setShowConditionSheet(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  sideButtonPlaceholder: {
    width: 48,
    height: 48,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsChip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '92%',
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  detailsChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  detailsChipText: {
    flexShrink: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.white,
  },
  detailsChipOptional: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
    overflow: 'hidden',
  },
  accordionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sheetHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  accordionChevron: {
    marginTop: 1,
  },
  accordionChevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  accordionTriggerText: {
    flex: 1,
    gap: 2,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  optionalPill: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  optionalPillText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: BrandColors.textMuted,
  },
  accordionHint: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: BrandColors.textMuted,
  },
  detailRowsBlock: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailRowIcon: {
    width: 22,
    alignItems: 'center',
  },
  detailRowLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  detailRowValue: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    textAlign: 'right',
  },
  detailRowValueEmpty: {
    color: BrandColors.textMuted,
  },
  detailRowValueSet: {
    color: BrandColors.primary,
    fontFamily: Fonts.medium,
  },
  detailRowLocked: {
    backgroundColor: '#FFFBF5',
  },
  detailRowLabelLocked: {
    color: BrandColors.textMuted,
  },
  detailRowValueLocked: {
    color: '#9A6700',
    fontFamily: Fonts.medium,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.6,
  },
});
