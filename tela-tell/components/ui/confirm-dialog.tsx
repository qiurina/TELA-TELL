import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { CircleHelp, Trash2 } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, primaryButtonShadow } from '@/constants/shadows';

const primaryGradient = [BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark] as const;

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!visible || Platform.OS !== 'web') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={[styles.card, faintCardShadow()]}>
          <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
            {destructive ? (
              <Trash2 size={24} color="#DC2626" strokeWidth={2.25} />
            ) : (
              <CircleHelp size={26} color={BrandColors.primary} strokeWidth={2.25} />
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={[styles.actions, message ? undefined : styles.actionsNoMessage]}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.confirmWrap, pressed && styles.pressed]}
              onPress={onConfirm}>
              {destructive ? (
                <View style={[styles.confirmButton, styles.destructiveButton]}>
                  <Text style={styles.confirmText}>{confirmLabel}</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={[...primaryGradient]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.confirmButton, primaryButtonShadow()]}>
                  <Text style={styles.confirmText}>{confirmLabel}</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
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
    backgroundColor: BrandColors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconWrapDestructive: {
    backgroundColor: '#FEE2E2',
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginTop: 20,
  },
  actionsNoMessage: {
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.inputBackground,
  },
  cancelText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
  },
  confirmWrap: {
    flex: 1,
  },
  confirmButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 999,
  },
  destructiveButton: {
    backgroundColor: '#DC2626',
  },
  confirmText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  pressed: {
    opacity: 0.88,
  },
});
