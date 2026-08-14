import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Check } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

const AUTO_DISMISS_MS = 1100;

type SuccessModalProps = {
  visible: boolean;
  message: string;
  onDone: () => void;
};

/** Centered "done" confirmation — matches the checkmark stage in delete-account-sheet.tsx. */
export function SuccessModal({ visible, message, onDone }: SuccessModalProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = setTimeout(onDone, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onDone]);

  return (
    <Modal visible={visible} transparent animationType="fade" accessibilityViewIsModal>
      <View style={styles.root}>
        <View style={styles.backdrop} />
        <View style={styles.cardWrap}>
          <View style={[styles.card, faintCardShadow()]}>
            <View style={styles.doneIcon}>
              <Check size={28} color={BrandColors.white} strokeWidth={3} />
            </View>
            <Text style={styles.text}>{message}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  doneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: BrandColors.text,
    textAlign: 'center',
  },
});
