import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScanConfirmSheet } from '@/features/scan/components/scan-confirm-sheet';
import { Camera, ChevronLeft, ImagePlus, Info, ScanLine, Settings, Tag, X } from '@/components/ui/lucide-icons';
import { BACKUP_SCAN_DISCLAIMER } from '@/data/scans/analysis';
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
}: ScanActionsProps) {
  const [showBackupInfo, setShowBackupInfo] = useState(false);
  const [preferencesSummary, setPreferencesSummary] = useState<string | null>(() => {
    const parts: string[] = [];
    if (getScanMode() === 'dual') {
      parts.push('Two swatches');
    }
    const profile = getUserPreferencesSummary();
    if (profile) {
      parts.push(profile);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  });
  const [hasPreferences, setHasPreferences] = useState(
    () => hasActiveUserPreferences() || getScanMode() === 'dual',
  );
  const [isDualScanMode, setIsDualScanMode] = useState(() => getScanMode() === 'dual');
  const trimmedLabel = savedSellerLabel?.trim() ?? '';
  const hasSellerLabel = trimmedLabel.length > 0;

  useFocusEffect(
    useCallback(() => {
      const parts: string[] = [];
      if (getScanMode() === 'dual') {
        parts.push('Two swatches');
      }
      const profile = getUserPreferencesSummary();
      if (profile) {
        parts.push(profile);
      }
      setPreferencesSummary(parts.length > 0 ? parts.join(' · ') : null);
      setHasPreferences(hasActiveUserPreferences() || getScanMode() === 'dual');
      setIsDualScanMode(getScanMode() === 'dual');
    }, []),
  );

  const preferencesButton = onOpenPreferences ? (
    <View style={styles.preferencesBlock}>
      <Pressable
        style={({ pressed }) => [styles.preferencesButton, pressed && styles.pressed]}
        onPress={onOpenPreferences}
        disabled={isAnalyzing}
        accessibilityRole="button"
        accessibilityLabel="Open user preferences">
        <Settings size={18} color={BrandColors.primary} strokeWidth={2} />
        <View style={styles.preferencesTextBlock}>
          <Text style={styles.preferencesText}>
            {hasPreferences ? 'Update User Preferences' : 'User Preferences'}
          </Text>
          {preferencesSummary ? (
            <Text style={styles.preferencesSummary} numberOfLines={2}>
              {preferencesSummary}
            </Text>
          ) : (
            <Text style={styles.preferencesHint}>
              Skin tone, allergies, preferred fabrics, dressing guide
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  ) : null;

  if (hasPreview) {
    return (
      <View style={styles.container}>
        <View style={styles.reviewBanner}>
          <Text style={styles.reviewStep}>Step 2 — Review & analyze</Text>
          <Text style={styles.reviewBody}>
            {isDualScanMode
              ? 'Mark a box around each fabric swatch, then analyze both regions.'
              : 'Confirm the capture looks correct before running fabric analysis.'}
          </Text>
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
          disabled={isAnalyzing}>
          <ChevronLeft size={18} color={BrandColors.primary} strokeWidth={2.5} />
          <Text style={styles.outlineText}>Try Another Capture</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={onAddLabel}
          disabled={isAnalyzing}>
          <Tag size={18} color={BrandColors.primary} strokeWidth={2} />
          <Text style={styles.secondaryText}>
            {hasSellerLabel ? 'Update Seller Label' : 'Add Seller Label'}
          </Text>
        </Pressable>

        {preferencesButton}
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
        <Text style={styles.reviewBody}>
          {isDualScanMode
            ? 'Two-swatches mode is on. Capture both fabrics in one photo — you will mark regions next.'
            : hasSellerLabel
              ? 'Seller label saved. Scan fabric, review the capture, then analyze.'
              : 'Scan or upload fabric, review the capture, then analyze.'}
        </Text>
      </View>

      {isDualScanMode ? (
        <View style={styles.dualModeBanner}>
          <Text style={styles.dualModeTitle}>Two swatches mode</Text>
          <Text style={styles.dualModeBody}>
            After capture, the main button becomes Mark Regions & Analyze.
          </Text>
        </View>
      ) : null}

      {hasSellerLabel ? (
        <SellerLabelPill label={trimmedLabel} onRemove={onRemoveLabel} disabled={isAnalyzing} />
      ) : null}

      <Pressable
        style={({ pressed }) => [pressed && styles.pressed, isAnalyzing && styles.disabled]}
        onPress={onDeviceScan}
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
            {isAnalyzing ? 'Analyzing...' : 'Scan with Device'}
          </Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.optionalLabelRow}>
        <Text style={styles.optionalLabel}>OR SCAN ANOTHER WAY</Text>
        <BackupScanInfoButton onPress={() => setShowBackupInfo(true)} />
      </View>

      {showPhoneCapture ? (
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          onPress={onPhoneScan}
          disabled={isAnalyzing}>
          <Camera size={18} color={BrandColors.primary} strokeWidth={2} />
          <Text style={styles.outlineText}>Use Phone Camera</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
        onPress={onUpload}
        disabled={isAnalyzing}>
        <ImagePlus size={18} color={BrandColors.primary} strokeWidth={2} />
        <Text style={styles.outlineText}>Upload from Gallery</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={onAddLabel}
        disabled={isAnalyzing}>
        <Tag size={18} color={BrandColors.primary} strokeWidth={2} />
        <Text style={styles.secondaryText}>Add Seller Label</Text>
      </Pressable>

      {preferencesButton}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 4,
  },
  reviewBanner: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 14,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  reviewStep: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primaryDark,
    letterSpacing: 0.2,
  },
  reviewBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  dualModeBanner: {
    backgroundColor: BrandColors.lavender,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  dualModeTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.primaryDark,
  },
  dualModeBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
  },
  optionalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BrandColors.lavender,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 4,
  },
  primaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  outlineText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
  secondaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
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
  preferencesBlock: {
    marginTop: 4,
  },
  preferencesButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: BrandColors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  preferencesTextBlock: {
    flex: 1,
    gap: 2,
  },
  preferencesText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
  },
  preferencesHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  preferencesSummary: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
});
