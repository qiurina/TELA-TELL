import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GarmentConditionIcon,
  GarmentConditionSheet,
  getGarmentConditionLabel,
} from '@/features/scan/components/garment-condition-picker';
import { getScanModeLabel, ScanModeSheet } from '@/features/scan/components/scan-mode-sheet';
import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { Camera, ChevronLeft, ChevronRight, ImagePlus, Lock, ScanLine, Settings, Tag, X } from '@/components/ui/lucide-icons';
import {
  DEFAULT_GARMENT_CONDITION,
  type GarmentCondition,
} from '@/data/scans/garment-condition';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';
import { useAuth } from '@/features/auth/context/auth-provider';
import {
  getUserPreferencesSummary,
  hasActiveUserPreferences,
} from '@/features/profile/lib/user-preferences';
import { getScanMode, setScanMode, type ScanMode } from '@/features/scan/lib/scan-session';

const primaryGradient = [BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark] as const;

/** Dual-swatch scan mode is kept in code but hidden from the UI for now. */
const SHOW_SCAN_MODE_SELECTOR = false;

type ScanActionsProps = {
  hasPreview?: boolean;
  savedSellerLabel?: string | null;
  onTakePhoto: () => void;
  onUpload: () => void;
  onAnalyze: () => void;
  onTryAnother: () => void;
  garmentCondition: GarmentCondition;
  onGarmentConditionChange: (condition: GarmentCondition) => void;
  onAddLabel: () => void;
  onRemoveLabel?: () => void;
  onOpenPreferences?: () => void;
  isAnalyzing?: boolean;
};

function SellerLabelPill({
  label,
  onRemove,
  disabled,
}: {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.savedLabelRow}>
      <Text style={styles.savedLabelCaption}>Seller label</Text>
      <View style={styles.savedLabelPill}>
        <Text style={styles.savedLabelText}>{label}</Text>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Remove label">
          <X size={14} color={BrandColors.primary} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

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

function AddDetailsAccordion({
  expanded,
  onToggle,
  hasSellerLabel,
  sellerLabel,
  hasPreferences,
  garmentCondition,
  onGarmentConditionChange,
  onAddLabel,
  onOpenPreferences,
  scanMode,
  onScanModeChange,
  preferencesLocked,
  onLockedPreferencesPress,
  disabled,
}: {
  expanded: boolean;
  onToggle: () => void;
  hasSellerLabel: boolean;
  sellerLabel: string;
  hasPreferences: boolean;
  garmentCondition: GarmentCondition;
  onGarmentConditionChange: (condition: GarmentCondition) => void;
  onAddLabel: () => void;
  onOpenPreferences?: () => void;
  scanMode: ScanMode;
  onScanModeChange: (mode: ScanMode) => void;
  preferencesLocked: boolean;
  onLockedPreferencesPress: () => void;
  disabled?: boolean;
}) {
  const [showConditionSheet, setShowConditionSheet] = useState(false);
  const [showScanModeSheet, setShowScanModeSheet] = useState(false);
  const hasCustomCondition = garmentCondition !== DEFAULT_GARMENT_CONDITION;
  const summaryParts: string[] = [];

  if (hasCustomCondition) {
    summaryParts.push(garmentCondition);
  }
  if (hasSellerLabel) {
    summaryParts.push(sellerLabel);
  }
  if (SHOW_SCAN_MODE_SELECTOR) {
    summaryParts.push(getScanModeLabel(scanMode));
  }
  if (hasPreferences) {
    summaryParts.push('Preferences set');
  }

  const summary = summaryParts.length > 0 ? summaryParts.join(' · ') : null;
  const preferencesSummary = getUserPreferencesSummary();
  const preferencesStatus = preferencesLocked
    ? 'Sign in required'
    : !hasPreferences
      ? 'Not set'
      : preferencesSummary ?? 'Set';

  return (
    <View style={styles.accordionBlock}>
      <Pressable
        style={({ pressed }) => [styles.accordionTrigger, pressed && styles.pressed]}
        onPress={onToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Hide add details' : 'Add details'}>
        <View style={[styles.accordionChevron, expanded && styles.accordionChevronOpen]}>
          <ChevronRight size={16} color={BrandColors.primary} strokeWidth={2.5} />
        </View>
        <View style={styles.accordionTriggerText}>
          <Text style={styles.accordionTriggerTitle}>Add details</Text>
          <Text style={styles.accordionTriggerHint}>
            {expanded
              ? 'Condition, seller label, preferences'
              : summary ?? 'Condition, seller label, preferences'}
          </Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.accordionPanel}>
          <View style={styles.detailRowsBlock}>
            <DetailActionRow
              icon={<GarmentConditionIcon condition={garmentCondition} />}
              label="Fabric condition"
              value={getGarmentConditionLabel(garmentCondition)}
              isSet
              onPress={() => setShowConditionSheet(true)}
              disabled={disabled}
              accessibilityLabel={`Fabric condition, ${getGarmentConditionLabel(garmentCondition)}. Change`}
            />

            <DetailActionRow
              icon={<Tag size={16} color={BrandColors.primary} strokeWidth={2.25} />}
              label="Seller label"
              value={hasSellerLabel ? sellerLabel : 'Not set'}
              isSet={hasSellerLabel}
              onPress={onAddLabel}
              disabled={disabled}
              accessibilityLabel={hasSellerLabel ? `Seller label, ${sellerLabel}. Update` : 'Seller label, not set. Add'}
            />

            {SHOW_SCAN_MODE_SELECTOR ? (
              <DetailActionRow
                icon={<ScanLine size={16} color={BrandColors.primary} strokeWidth={2.25} />}
                label="Scan mode"
                value={getScanModeLabel(scanMode)}
                isSet
                onPress={() => setShowScanModeSheet(true)}
                disabled={disabled}
                accessibilityLabel={`Scan mode, ${getScanModeLabel(scanMode)}. Change`}
              />
            ) : null}

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
              onPress={preferencesLocked ? onLockedPreferencesPress : onOpenPreferences ?? (() => {})}
              disabled={disabled}
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

          <GarmentConditionSheet
            visible={showConditionSheet}
            value={garmentCondition}
            onChange={onGarmentConditionChange}
            onClose={() => setShowConditionSheet(false)}
          />

          {SHOW_SCAN_MODE_SELECTOR ? (
            <ScanModeSheet
              visible={showScanModeSheet}
              value={scanMode}
              onChange={onScanModeChange}
              onClose={() => setShowScanModeSheet(false)}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function ScanActions({
  hasPreview,
  savedSellerLabel,
  onTakePhoto,
  onUpload,
  onAnalyze,
  onTryAnother,
  garmentCondition,
  onGarmentConditionChange,
  onAddLabel,
  onRemoveLabel,
  onOpenPreferences,
  isAnalyzing,
}: ScanActionsProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [showPreferencesLocked, setShowPreferencesLocked] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(() => hasActiveUserPreferences());
  const [scanMode, setScanModeState] = useState<ScanMode>(() => getScanMode());
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const trimmedLabel = savedSellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;

  useEffect(() => {
    setDetailsExpanded(hasPreview ?? false);
  }, [hasPreview]);

  useFocusEffect(
    useCallback(() => {
      setHasPreferences(hasActiveUserPreferences());
      setScanModeState(getScanMode());
    }, []),
  );

  const handleScanModeChange = (mode: ScanMode) => {
    setScanMode(mode);
    setScanModeState(mode);
  };

  if (hasPreview) {
    return (
      <View style={styles.container}>
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

        <View style={styles.reviewBanner}>
          <Text style={styles.reviewStep}>Step 2 — Review & analyze</Text>
        </View>

        <Pressable
          style={({ pressed }) => [pressed && styles.pressed, isAnalyzing && styles.disabled]}
          onPress={onAnalyze}
          disabled={isAnalyzing}>
          <LinearGradient
            colors={[...primaryGradient]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.primaryButton, primaryButtonShadow()]}>
            {isAnalyzing ? (
              <ActivityIndicator color={BrandColors.white} />
            ) : (
              <ScanLine size={18} color={BrandColors.white} strokeWidth={2.5} />
            )}
            <Text style={styles.primaryText}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Fabric'}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          onPress={onTryAnother}
          disabled={isAnalyzing}
          accessibilityRole="button"
          accessibilityLabel="Try another capture">
          <ChevronLeft size={18} color={BrandColors.primary} strokeWidth={2.5} />
          <Text style={styles.outlineText}>Try Another Capture</Text>
        </Pressable>

        <AddDetailsAccordion
          expanded={detailsExpanded}
          onToggle={() => setDetailsExpanded((open) => !open)}
          hasSellerLabel={hasSellerLabel}
          sellerLabel={trimmedLabel}
          hasPreferences={hasPreferences}
          garmentCondition={garmentCondition}
          onGarmentConditionChange={onGarmentConditionChange}
          onAddLabel={onAddLabel}
          onOpenPreferences={onOpenPreferences}
          scanMode={scanMode}
          onScanModeChange={handleScanModeChange}
          preferencesLocked={!isSignedIn}
          onLockedPreferencesPress={() => setShowPreferencesLocked(true)}
          disabled={isAnalyzing}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.reviewBanner}>
        <Text style={styles.reviewStep}>Step 1 — Capture fabric</Text>
      </View>

      {hasSellerLabel ? (
        <SellerLabelPill label={trimmedLabel} onRemove={onRemoveLabel} disabled={isAnalyzing} />
      ) : null}

      <Pressable
        style={({ pressed }) => [pressed && styles.pressed, isAnalyzing && styles.disabled]}
        onPress={onTakePhoto}
        disabled={isAnalyzing}>
        <LinearGradient
          colors={[...primaryGradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.primaryButton, primaryButtonShadow()]}>
          <Camera size={18} color={BrandColors.white} strokeWidth={2.5} />
          <Text style={styles.primaryText}>Take Photo</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
        onPress={onUpload}
        disabled={isAnalyzing}
        accessibilityRole="button"
        accessibilityLabel="Upload from gallery">
        <ImagePlus size={18} color={BrandColors.primary} strokeWidth={2.5} />
        <Text style={styles.outlineText}>Upload from Gallery</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 1,
  },
  reviewBanner: {
    alignItems: 'center',
  },
  reviewStep: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.textMuted,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 999,
  },
  accordionBlock: {
    width: '100%',
    borderRadius: 14,
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
  accordionTriggerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  accordionTriggerHint: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: BrandColors.textMuted,
  },
  accordionPanel: {
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
  },
  detailRowsBlock: {
    gap: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.lavenderCard,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
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
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BrandColors.white,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
  },
  outlineText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
  primaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.75,
  },
  savedLabelRow: {
    alignItems: 'flex-start',
    gap: 6,
  },
  savedLabelCaption: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  savedLabelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  savedLabelText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primary,
  },
});
