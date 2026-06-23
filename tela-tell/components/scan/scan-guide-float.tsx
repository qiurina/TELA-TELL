import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ViewfinderSource } from '@/components/scan/camera-guide';
import { CircleCheck, Info, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const IOT_QUALITY_CHECKLIST = [
  'Lay fabric flat',
  'Use IoT scanner',
  'Fill the frame',
  'Even lighting',
];

const PHONE_QUALITY_CHECKLIST = [
  'Lay fabric flat',
  'Fill the frame',
  'Even lighting',
  'Hold steady before capture',
];

type ScanGuideFloatProps = {
  visible: boolean;
  source?: ViewfinderSource;
  onDismiss: () => void;
  onShow: () => void;
};

export function ScanGuideFloat({ visible, source = 'iot', onDismiss, onShow }: ScanGuideFloatProps) {
  const isIot = source === 'iot' || source === 'phone-permission';
  const checklist = isIot ? IOT_QUALITY_CHECKLIST : PHONE_QUALITY_CHECKLIST;

  return (
    <>
      {!visible ? (
        <Pressable
          style={styles.infoButton}
          onPress={onShow}
          accessibilityRole="button"
          accessibilityLabel="Show scan quality checklist">
          <Info size={16} color={BrandColors.white} strokeWidth={2.5} />
        </Pressable>
      ) : null}

      {visible ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Scan quality checklist</Text>
            <Pressable
              onPress={onDismiss}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss checklist">
              <X size={16} color={BrandColors.textMuted} strokeWidth={2.5} />
            </Pressable>
          </View>
          {checklist.map((item) => (
            <View key={item} style={styles.checkRow}>
              <CircleCheck size={16} color={BrandColors.primary} strokeWidth={2.25} />
              <Text style={styles.checkText}>{item}</Text>
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
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.text,
  },
});
