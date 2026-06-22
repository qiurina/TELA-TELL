import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Camera, ChevronLeft, ImagePlus, ScanLine, Tag } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';

type ScanActionsProps = {
  hasPreview?: boolean;
  onDeviceScan: () => void;
  onPhoneScan: () => void;
  onUpload: () => void;
  onAnalyze: () => void;
  onTryAnother: () => void;
  onAddLabel: () => void;
  isAnalyzing?: boolean;
};

export function ScanActions({
  hasPreview,
  onDeviceScan,
  onPhoneScan,
  onUpload,
  onAnalyze,
  onTryAnother,
  onAddLabel,
  isAnalyzing,
}: ScanActionsProps) {
  if (hasPreview) {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            primaryButtonShadow(),
            pressed && styles.pressed,
            isAnalyzing && styles.disabled,
          ]}
          onPress={onAnalyze}
          disabled={isAnalyzing}>
          {isAnalyzing ? (
            <ActivityIndicator color={BrandColors.white} />
          ) : (
            <ScanLine size={18} color={BrandColors.white} strokeWidth={2.5} />
          )}
          <Text style={styles.primaryText}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Fabric'}
          </Text>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          primaryButtonShadow(),
          pressed && styles.pressed,
          isAnalyzing && styles.disabled,
        ]}
        onPress={onDeviceScan}
        disabled={isAnalyzing}>
        {isAnalyzing ? (
          <ActivityIndicator color={BrandColors.white} />
        ) : (
          <ScanLine size={18} color={BrandColors.white} strokeWidth={2.5} />
        )}
        <Text style={styles.primaryText}>
          {isAnalyzing ? 'Analyzing...' : 'Scan with Device'}
        </Text>
      </Pressable>

      <Text style={styles.optionalLabel}>OR SCAN ANOTHER WAY</Text>

      <Pressable
        style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
        onPress={onPhoneScan}
        disabled={isAnalyzing}>
        <Camera size={18} color={BrandColors.primary} strokeWidth={2} />
        <Text style={styles.outlineText}>Scan with Your Phone</Text>
      </Pressable>

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
    backgroundColor: BrandColors.primary,
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
});
