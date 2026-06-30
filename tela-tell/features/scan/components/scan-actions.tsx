import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { Camera, ChevronLeft, ImagePlus, Info, ScanLine, X } from '@/components/ui/lucide-icons';
import { BACKUP_SCAN_DISCLAIMER } from '@/data/scans/analysis';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';
import { getScanMode } from '@/features/scan/lib/scan-session';
import {
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

function OptionalLinks({
  hasSellerLabel,
  hasPreferences,
  onAddLabel,
  onOpenPreferences,
  disabled,
}: {
  hasSellerLabel: boolean;
  hasPreferences: boolean;
  onAddLabel: () => void;
  onOpenPreferences?: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.optionalBlock}>
      <Text style={styles.optionalHeading}>Optional</Text>
      <View style={styles.optionalLinksRow}>
        <Pressable
          onPress={onAddLabel}
          disabled={disabled}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={hasSellerLabel ? 'Update seller label' : 'Add seller label'}>
          <Text style={styles.optionalLink}>
            {hasSellerLabel ? 'Update seller label' : '+ Seller label'}
          </Text>
        </Pressable>

        {onOpenPreferences ? (
          <>
            <Text style={styles.optionalDot}>·</Text>
            <Pressable
              onPress={onOpenPreferences}
              disabled={disabled}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel="Open preferences">
              <Text style={styles.optionalLink}>
                {hasPreferences ? 'Preferences' : 'Set preferences'}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>
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
  const trimmedLabel = savedSellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;
  const isCaptureBusy = Boolean(isAnalyzing || isDeviceScanning);

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

  const optionalLinks = (
    <OptionalLinks
      hasSellerLabel={hasSellerLabel}
      hasPreferences={hasPreferences}
      onAddLabel={onAddLabel}
      onOpenPreferences={onOpenPreferences}
      disabled={isCaptureBusy}
    />
  );

  if (hasPreview) {
    return (
      <View style={styles.container}>
        <View style={styles.reviewBanner}>
          <Text style={styles.reviewStep}>Step 2 — Review & analyze</Text>
        </View>

        {hasSellerLabel ? (
          <SellerLabelPill label={trimmedLabel} onRemove={onRemoveLabel} disabled={isAnalyzing} />
        ) : null}

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

        {optionalLinks}
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
      {optionalLinks}
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
  optionalBlock: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  optionalHeading: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  optionalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  optionalLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primary,
  },
  optionalDot: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
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
