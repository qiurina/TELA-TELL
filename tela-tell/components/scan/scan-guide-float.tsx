import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Info, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const SCAN_TIPS = [
  'Place fabric flat inside the frame',
  'Use even lighting on the material',
  'Hold steady, then tap the capture button',
  'Review the photo before analyzing',
];

type ScanGuideFloatProps = {
  visible: boolean;
  onDismiss: () => void;
  onShow: () => void;
};

export function ScanGuideFloat({ visible, onDismiss, onShow }: ScanGuideFloatProps) {
  return (
    <>
      {!visible ? (
        <Pressable
          style={styles.infoButton}
          onPress={onShow}
          accessibilityRole="button"
          accessibilityLabel="Show scanning tips">
          <Info size={16} color={BrandColors.white} strokeWidth={2.5} />
        </Pressable>
      ) : null}

      {visible ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Scanning tips</Text>
            <Pressable
              onPress={onDismiss}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss tips">
              <X size={16} color={BrandColors.textMuted} strokeWidth={2.5} />
            </Pressable>
          </View>
          {SCAN_TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.bullet} />
              <Text style={styles.tip}>{tip}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  infoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 72,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BrandColors.primary,
    marginTop: 6,
  },
  tip: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
});
