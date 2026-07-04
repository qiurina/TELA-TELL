import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GarmentConditionIcon,
  GarmentConditionSheet,
  getGarmentConditionLabel,
} from '@/features/scan/components/garment-condition-picker';
import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { Camera, ChevronLeft, ChevronRight, ImagePlus, Info, ScanLine, Settings, Tag, X } from '@/components/ui/lucide-icons';
import { BACKUP_SCAN_DISCLAIMER } from '@/data/scans/analysis';
import {
  DEFAULT_GARMENT_CONDITION,
  type GarmentCondition,
} from '@/data/scans/garment-condition';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';
import { getScanMode } from '@/features/scan/lib/scan-session';
import {
  getUserPreferencesSummary,
  hasActiveUserPreferences,
} from '@/features/profile/lib/user-preferences';

const primaryGradient = [BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark] as const;

type ScanActionsProps = {
  hasPreview?: boolean;
  showPhoneCapture?: boolean;
  savedSellerLabel?: string | null;
  onDeviceScan: () => void;
  onPhoneScan: () => void;
  onUpload: () => void;
  onAnalyze: () => void;
  onTryAnother: () => void;
  garmentCondition: GarmentCondition;
  onGarmentConditionChange: (condition: GarmentCondition) => void;
  onAddLabel: () => void;
  onRemoveLabel?: () => void;
  onOpenPreferences?: () => void;
  isAnalyzing?: boolean;
  isDeviceScanning?: boolean;
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

function BackupScanInfoButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={styles.infoButton}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="About backup scan accuracy">
      <Info size={15} color={BrandColors.textMuted} strokeWidth={2.25} />
    </Pressable>
  );
}

function CompactCaptureButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.compactButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}>
      {icon}
      <Text style={styles.compactButtonText}>{label}</Text>
    </Pressable>
  );
}

function DetailActionRow({
  icon,
  label,
  value,
  isSet,
  onPress,
  disabled,
  accessibilityLabel,
  isLast = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  isSet: boolean;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  isLast?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.detailRow,
        isLast && styles.detailRowLast,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <View style={styles.detailRowIcon}>{icon}</View>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text
        style={[styles.detailRowValue, isSet ? styles.detailRowValueSet : styles.detailRowValueEmpty]}
        numberOfLines={1}>
        {value}
      </Text>
      <ChevronRight size={16} color={BrandColors.textMuted} strokeWidth={2.25} />
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
  isDualScanMode,
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
  isDualScanMode: boolean;
  disabled?: boolean;
}) {
  const [showConditionSheet, setShowConditionSheet] = useState(false);
  const hasCustomCondition = garmentCondition !== DEFAULT_GARMENT_CONDITION;
  const summaryParts: string[] = [];

  if (hasCustomCondition) {
    summaryParts.push(garmentCondition);
  }
  if (hasSellerLabel) {
    summaryParts.push(sellerLabel);
  }
  if (hasPreferences) {
    summaryParts.push('Preferences set');
  }

  const summary = summaryParts.length > 0 ? summaryParts.join(' · ') : null;
  const preferencesSummary = getUserPreferencesSummary();
  const preferencesStatus = !hasPreferences
    ? 'Not set'
    : preferencesSummary ?? (isDualScanMode ? 'Two swatches' : 'Set');

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
            {expanded ? 'Condition, seller label, preferences' : summary ?? 'Condition, seller label, preferences'}
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
              isLast={!onOpenPreferences}
              accessibilityLabel={hasSellerLabel ? `Seller label, ${sellerLabel}. Update` : 'Seller label, not set. Add'}
            />

            {onOpenPreferences ? (
              <DetailActionRow
                icon={<Settings size={16} color={BrandColors.primary} strokeWidth={2.25} />}
                label="Preferences"
                value={preferencesStatus}
                isSet={hasPreferences}
                onPress={onOpenPreferences}
                disabled={disabled}
                isLast
                accessibilityLabel={
                  hasPreferences ? `Preferences, ${preferencesStatus}. Edit` : 'Preferences, not set. Set'
                }
              />
            ) : null}
          </View>

          <GarmentConditionSheet
            visible={showConditionSheet}
            value={garmentCondition}
            onChange={onGarmentConditionChange}
            onClose={() => setShowConditionSheet(false)}
          />
        </View>
      ) : null}
    </View>
  );
}

export function ScanActions({
  hasPreview,
  showPhoneCapture = false,
  savedSellerLabel,
  onDeviceScan,
  onPhoneScan,
  onUpload,
  onAnalyze,
  onTryAnother,
  garmentCondition,
  onGarmentConditionChange,
  onAddLabel,
  onRemoveLabel,
  onOpenPreferences,
  isAnalyzing,
  isDeviceScanning,
}: ScanActionsProps) {
  const [showBackupInfo, setShowBackupInfo] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(
    () => hasActiveUserPreferences() || getScanMode() === 'dual',
  );
  const [isDualScanMode, setIsDualScanMode] = useState(() => getScanMode() === 'dual');
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const trimmedLabel = savedSellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;
  const isCaptureBusy = Boolean(isAnalyzing || isDeviceScanning);

  useEffect(() => {
    setDetailsExpanded(hasPreview ?? false);
  }, [hasPreview]);

  useFocusEffect(
    useCallback(() => {
      setHasPreferences(hasActiveUserPreferences() || getScanMode() === 'dual');
      setIsDualScanMode(getScanMode() === 'dual');
    }, []),
  );

  const captureAlternatives = (
    <>
      <View style={styles.optionalLabelRow}>
        <Text style={styles.optionalLabel}>OR SCAN ANOTHER WAY</Text>
        <BackupScanInfoButton onPress={() => setShowBackupInfo(true)} />
      </View>

      <View style={styles.compactRow}>
        {showPhoneCapture ? (
          <CompactCaptureButton
            icon={<Camera size={18} color={BrandColors.primary} strokeWidth={2} />}
            label="Phone"
            onPress={onPhoneScan}
            disabled={isCaptureBusy}
          />
        ) : null}
        <CompactCaptureButton
          icon={<ImagePlus size={18} color={BrandColors.primary} strokeWidth={2} />}
          label="Gallery"
          onPress={onUpload}
          disabled={isCaptureBusy}
        />
      </View>
    </>
  );

  if (hasPreview) {
    return (
      <View style={styles.container}>
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
              {isAnalyzing
                ? 'Analyzing...'
                : isDualScanMode
                  ? 'Mark Regions & Analyze'
                  : 'Analyze Fabric'}
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
          isDualScanMode={isDualScanMode}
          disabled={isAnalyzing}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScanConfirmSheet
        visible={showBackupInfo}
        variant="info"
        title="Backup scan options"
        message={BACKUP_SCAN_DISCLAIMER}
        confirmLabel="Got it"
        onConfirm={() => setShowBackupInfo(false)}
        onCancel={() => setShowBackupInfo(false)}
      />

      <View style={styles.reviewBanner}>
        <Text style={styles.reviewStep}>Step 1 — Capture fabric</Text>
      </View>

      {hasSellerLabel ? (
        <SellerLabelPill label={trimmedLabel} onRemove={onRemoveLabel} disabled={isAnalyzing} />
      ) : null}

      <Pressable
        style={({ pressed }) => [pressed && styles.pressed, isCaptureBusy && styles.disabled]}
        onPress={onDeviceScan}
        disabled={isCaptureBusy}>
        <LinearGradient
          colors={[...primaryGradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.primaryButton, primaryButtonShadow()]}>
          {isDeviceScanning ? (
            <ActivityIndicator color={BrandColors.white} />
          ) : (
            <ScanLine size={18} color={BrandColors.white} strokeWidth={2.5} />
          )}
          <Text style={styles.primaryText}>
            {isDeviceScanning ? 'Capturing...' : 'Capture with Device'}
          </Text>
        </LinearGradient>
      </Pressable>

      {captureAlternatives}
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
  optionalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  optionalLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  infoButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BrandColors.white,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
  },
  compactButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
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
