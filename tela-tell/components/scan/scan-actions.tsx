import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Camera, ChevronLeft, ImagePlus, ScanLine, Tag, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';

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
  isAnalyzing?: boolean;
};

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
  isAnalyzing,
}: ScanActionsProps) {
  const sellerLabelPill =
    savedSellerLabel && savedSellerLabel.trim().length > 0 ? (
      <View style={styles.savedLabelRow}>
        <Text style={styles.savedLabelCaption}>Selected label</Text>
        <View style={styles.savedLabelPill}>
          <Text style={styles.savedLabelText}>{savedSellerLabel.trim()}</Text>
          <Pressable
            onPress={onRemoveLabel}
            hitSlop={8}
            disabled={isAnalyzing}
            accessibilityRole="button"
            accessibilityLabel="Remove label">
            <X size={14} color={BrandColors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    ) : null;

  if (hasPreview) {
    return (
      <View style={styles.container}>
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
          disabled={isAnalyzing}>
          <ChevronLeft size={18} color={BrandColors.primary} strokeWidth={2.5} />
          <Text style={styles.outlineText}>Try Another</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={onAddLabel}
          disabled={isAnalyzing}>
          <Tag size={18} color={BrandColors.primary} strokeWidth={2} />
          <Text style={styles.secondaryText}>Add Seller Label</Text>
        </Pressable>

        {sellerLabelPill}
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      <Text style={styles.optionalLabel}>OR SCAN ANOTHER WAY</Text>

      {showPhoneCapture ? (
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          onPress={onPhoneScan}
          disabled={isAnalyzing}>
          <Camera size={18} color={BrandColors.primary} strokeWidth={2} />
          <Text style={styles.outlineText}>Scan with Your Phone</Text>
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

      {sellerLabelPill}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
  },
  optionalLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
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
    marginTop: -4,
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
