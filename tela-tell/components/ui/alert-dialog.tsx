import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleCheck, Info, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type AlertVariant = 'error' | 'success' | 'info';

type AlertState = {
  title: string;
  message?: string;
  variant: AlertVariant;
};

let setAlertState: ((state: AlertState) => void) | null = null;

/** Drop-in replacement for `Alert.alert(title, message)` that renders our centered dialog instead of the OS alert. */
export function showAlert(title: string, message?: string, variant: AlertVariant = 'error') {
  setAlertState?.({ title, message, variant });
}

const variantStyle: Record<AlertVariant, { bg: string; color: string; Icon: typeof Info }> = {
  error: { bg: '#FEE2E2', color: '#DC2626', Icon: TriangleAlert },
  success: { bg: '#DCFCE7', color: '#16A34A', Icon: CircleCheck },
  info: { bg: BrandColors.lavenderCard, color: BrandColors.primary, Icon: Info },
};

export function AlertHost() {
  const [state, setState] = useState<AlertState | null>(null);

  useEffect(() => {
    setAlertState = setState;
    return () => {
      setAlertState = null;
    };
  }, []);

  useEffect(() => {
    if (!state || Platform.OS !== 'web') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [state]);

  const { bg, color, Icon } = variantStyle[state?.variant ?? 'error'];

  return (
    <Modal
      visible={state !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setState(null)}
      accessibilityViewIsModal>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setState(null)}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={[styles.card, faintCardShadow()]}>
          <View style={[styles.iconWrap, { backgroundColor: bg }]}>
            <Icon size={26} color={color} strokeWidth={2.25} />
          </View>

          <Text style={styles.title}>{state?.title}</Text>
          {state?.message ? <Text style={styles.message}>{state.message}</Text> : null}

          <Pressable
            style={({ pressed }) => [styles.okButton, pressed && styles.pressed]}
            onPress={() => setState(null)}>
            <Text style={styles.okText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: BrandColors.white,
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    color: BrandColors.text,
    textAlign: 'center',
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  okButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.inputBackground,
    marginTop: 20,
  },
  okText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  pressed: {
    opacity: 0.88,
  },
});
