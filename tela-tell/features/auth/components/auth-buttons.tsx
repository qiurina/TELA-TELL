import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { primaryButtonShadow } from '@/constants/shadows';

export function AuthPrimaryButton({
  label,
  onPress,
  disabled,
  compact,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryPressable,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <LinearGradient
        colors={[BrandColors.primaryLight, BrandColors.primary, BrandColors.primaryDark]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.primaryButton, compact && styles.primaryButtonCompact, primaryButtonShadow()]}>
        <Text style={[styles.primaryText, compact && styles.primaryTextCompact]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function AuthSecondaryButton({
  label,
  onPress,
  disabled,
  compact,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.secondaryButton,
        compact && styles.secondaryButtonCompact,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={[styles.secondaryText, compact && styles.secondaryTextCompact]}>{label}</Text>
    </Pressable>
  );
}

export function AuthTertiaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tertiaryButton, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={styles.tertiaryText}>{label}</Text>
    </Pressable>
  );
}

export function AuthTextLink({
  label,
  onPress,
  emphasis,
}: {
  label: string;
  onPress: () => void;
  emphasis?: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={styles.textLink}>
        {label}
        {emphasis ? <Text style={styles.textLinkEmphasis}> {emphasis}</Text> : null}
      </Text>
    </Pressable>
  );
}

export function AuthSwitchPrompt({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchPrompt}>{prompt} </Text>
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={action}>
        <Text style={styles.switchAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryPressable: {
    alignSelf: 'stretch',
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonCompact: {
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: BrandColors.white,
  },
  primaryTextCompact: {
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: BrandColors.lavenderCard,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  secondaryButtonCompact: {
    paddingVertical: 13,
    borderRadius: 14,
  },
  secondaryTextCompact: {
    fontSize: 15,
  },
  secondaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: BrandColors.primaryDark,
  },
  tertiaryButton: {
    alignSelf: 'stretch',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  tertiaryText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: BrandColors.primary,
  },
  textLink: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  textLinkEmphasis: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  switchPrompt: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: BrandColors.textMuted,
  },
  switchAction: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});
