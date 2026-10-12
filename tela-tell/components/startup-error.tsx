import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/constants/brand';

type StartupErrorProps = {
  retrying: boolean;
  onRetry: () => void;
};

/** System typography works here even if the bundled fonts could not load. */
export function StartupError({ retrying, onRetry }: StartupErrorProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>Could not start TELA-TELL</Text>
      <Text style={styles.message}>
        We could not prepare your saved data. Try again to continue.
      </Text>
      <Pressable
        onPress={onRetry}
        disabled={retrying}
        accessibilityRole="button"
        accessibilityLabel={retrying ? 'Trying again' : 'Try again'}
        accessibilityState={{ disabled: retrying, busy: retrying }}
        style={({ pressed }) => [styles.button, (pressed || retrying) && styles.dimmed]}>
        {retrying ? <ActivityIndicator color={BrandColors.white} /> : null}
        <Text style={styles.buttonText}>{retrying ? 'Trying again...' : 'Try again'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: BrandColors.primaryDark, textAlign: 'center' },
  message: { fontSize: 16, lineHeight: 24, color: BrandColors.text, textAlign: 'center' },
  button: {
    backgroundColor: BrandColors.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: BrandColors.white },
  dimmed: { opacity: 0.65 },
});
