import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Check, X } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, primaryButtonShadow } from '@/constants/shadows';
import { AuthError, deleteUser, loginUser } from '@/db/users';
import { AuthPasswordField } from '@/features/auth/components/auth-form-field';

const dangerGradient = ['#F87171', '#EF4444', '#DC2626'] as const;

/** Minimum time each processing stage stays on screen, so it reads as real work happening. */
const STAGE_MIN_MS = 900;

type Stage = 'form' | 'verifying' | 'deleting' | 'done';

function waitRemaining(startedAt: number, minMs: number): Promise<void> {
  const elapsed = Date.now() - startedAt;
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, minMs - elapsed)));
}

type DeleteAccountSheetProps = {
  visible: boolean;
  username: string;
  userId: string;
  onCancel: () => void;
  onDeleted: () => void;
};

export function DeleteAccountSheet({
  visible,
  username,
  userId,
  onCancel,
  onDeleted,
}: DeleteAccountSheetProps) {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('form');

  useEffect(() => {
    if (visible) {
      setPassword('');
      setError(null);
      setStage('form');
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!password || stage !== 'form') {
      return;
    }

    setError(null);
    setStage('verifying');
    const verifyStartedAt = Date.now();

    try {
      await loginUser({ username, password });
    } catch (caught) {
      await waitRemaining(verifyStartedAt, STAGE_MIN_MS);
      setStage('form');
      setError(
        caught instanceof AuthError
          ? 'Incorrect password.'
          : 'Could not verify your account. Please try again.',
      );
      return;
    }
    await waitRemaining(verifyStartedAt, STAGE_MIN_MS);

    setStage('deleting');
    const deleteStartedAt = Date.now();

    try {
      await deleteUser(userId);
    } catch {
      await waitRemaining(deleteStartedAt, STAGE_MIN_MS);
      setStage('form');
      setError('Could not delete your account. Please try again.');
      return;
    }
    await waitRemaining(deleteStartedAt, STAGE_MIN_MS);

    setStage('done');
    await new Promise((resolve) => setTimeout(resolve, STAGE_MIN_MS));
    onDeleted();
  };

  const isProcessing = stage !== 'form';
  const confirmDisabled = !password || isProcessing;
  const handleClose = isProcessing ? undefined : onCancel;

  const stageText: Record<Exclude<Stage, 'form'>, string> = {
    verifying: 'Verifying your password...',
    deleting: 'Deleting your account...',
    done: 'Account deleted',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose ?? (() => {})}
      accessibilityViewIsModal>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        {isProcessing ? (
          <View style={styles.processingCardWrap}>
            <View style={[styles.processingCard, faintCardShadow()]}>
              {stage === 'done' ? (
                <View style={styles.doneIcon}>
                  <Check size={28} color={BrandColors.white} strokeWidth={3} />
                </View>
              ) : (
                <ActivityIndicator size="large" color={BrandColors.primary} />
              )}
              <Text style={styles.processingText}>{stageText[stage]}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.sheet, faintCardShadow(), { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>Delete Account</Text>
              <Pressable
                onPress={onCancel}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close">
                <X size={20} color={BrandColors.textMuted} strokeWidth={2.5} />
              </Pressable>
            </View>

            <View style={[styles.messageCard, faintCardShadow()]}>
              <Text style={styles.message}>
                This permanently deletes your account. This can't be undone.
              </Text>
            </View>

            <AuthPasswordField
              label="Confirm your password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError(null);
              }}
              error={error}
              textContentType="password"
              autoComplete="password"
            />

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmWrap,
                  (pressed || confirmDisabled) && styles.pressed,
                ]}
                onPress={() => void handleConfirm()}
                disabled={confirmDisabled}>
                <LinearGradient
                  colors={[...dangerGradient]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.confirmButton, primaryButtonShadow()]}>
                  <Text style={styles.confirmText}>Delete Account</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.borderLight,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.primaryDark,
    paddingRight: 12,
  },
  messageCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.white,
  },
  cancelText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
  confirmWrap: {
    flex: 1,
  },
  confirmButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999,
  },
  confirmText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
  pressed: {
    opacity: 0.88,
  },
  processingCardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  processingCard: {
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
  processingText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: BrandColors.text,
    textAlign: 'center',
  },
});