import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleCheck, Info, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const QUALITY_CHECKLIST = [
  'Lay fabric flat',
  'Fill the frame',
  'Even lighting',
  'Hold steady before capture',
];

type ScanGuideFloatProps = {
  visible: boolean;
  onDismiss: () => void;
  onShow: () => void;
};

export function ScanGuideFloat({ visible, onDismiss, onShow }: ScanGuideFloatProps) {
  const checklist = QUALITY_CHECKLIST;

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
        <>
          <Pressable
            style={styles.backdrop}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss scan quality checklist"
          />
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Scan quality checklist</Text>
              <Pressable
                onPress={onDismiss}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Dismiss checklist">
                <X size={16} color="rgba(255,255,255,0.85)" strokeWidth={2.5} />
              </Pressable>
            </View>
            {checklist.map((item) => (
              <View key={item} style={styles.checkRow}>
                <CircleCheck size={16} color="rgba(255,255,255,0.9)" strokeWidth={2.25} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  card: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 72,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    color: BrandColors.white,
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
    color: 'rgba(255, 255, 255, 0.92)',
  },
});
