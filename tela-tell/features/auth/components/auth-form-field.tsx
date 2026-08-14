import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import type { FC } from 'react';

import { Check, Eye, EyeOff, Lock, Square, User } from '@/components/ui/lucide-icons';
import type { IconProps } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const ICON_COLOR = BrandColors.textMuted;
const ERROR_COLOR = '#B91C1C';

type AuthFieldLabelProps = {
  label: string;
  required?: boolean;
};

export function AuthFieldLabel({ label, required }: AuthFieldLabelProps) {
  return (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

export function AuthFieldError({ message }: { message?: string | null }) {
  if (!message?.trim()) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

export function AuthFormBanner({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

type AuthTextFieldProps = Omit<TextInputProps, 'placeholder'> & {
  label: string;
  required?: boolean;
  icon?: FC<IconProps>;
  placeholder?: string;
  hideIcon?: boolean;
  error?: string | null;
  groupStyle?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
};

export function AuthTextField({
  label,
  required,
  icon: Icon = User,
  placeholder,
  hideIcon = false,
  error,
  groupStyle,
  fieldStyle,
  style,
  ...props
}: AuthTextFieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={[styles.fieldGroup, groupStyle]}>
      <AuthFieldLabel label={label} required={required} />
      <View style={[styles.field, hasError && styles.fieldError, fieldStyle]}>
        {hideIcon ? null : (
          <Icon size={18} color={hasError ? ERROR_COLOR : ICON_COLOR} strokeWidth={2} />
        )}
        <TextInput
          style={[styles.input, hideIcon && styles.inputNoIcon, style]}
          placeholder={placeholder ?? label}
          placeholderTextColor={BrandColors.textMuted}
          {...props}
        />
      </View>
      <AuthFieldError message={error} />
    </View>
  );
}

type AuthPasswordFieldProps = Omit<TextInputProps, 'placeholder' | 'secureTextEntry'> & {
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
  fieldStyle?: StyleProp<ViewStyle>;
};

export function AuthPasswordField({
  label = 'Password',
  required = true,
  placeholder = 'Password',
  error,
  style,
  fieldStyle,
  ...props
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.fieldGroup}>
      <AuthFieldLabel label={label} required={required} />
      <View style={[styles.field, hasError && styles.fieldError, fieldStyle]}>
        <Lock size={18} color={hasError ? ERROR_COLOR : ICON_COLOR} strokeWidth={2} />
        <TextInput
          style={[styles.input, style]}
          placeholder={placeholder}
          placeholderTextColor={BrandColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!visible}
          textContentType="password"
          autoComplete="password"
          {...props}
        />
        <Pressable
          onPress={() => setVisible((current) => !current)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
          {visible ? (
            <EyeOff size={18} color={hasError ? ERROR_COLOR : ICON_COLOR} strokeWidth={2} />
          ) : (
            <Eye size={18} color={hasError ? ERROR_COLOR : ICON_COLOR} strokeWidth={2} />
          )}
        </Pressable>
      </View>
      <AuthFieldError message={error} />
    </View>
  );
}

export function AuthRememberRow({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={styles.rememberRow}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Remember me">
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? (
          <Check size={12} color={BrandColors.white} strokeWidth={3} />
        ) : (
          <Square size={16} color={BrandColors.border} strokeWidth={2} />
        )}
      </View>
      <Text style={styles.rememberText}>Remember me</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.text,
    paddingLeft: 4,
  },
  required: {
    color: '#D64545',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BrandColors.inputBackground,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  fieldError: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: BrandColors.text,
    paddingVertical: 12,
  },
  inputNoIcon: {
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: ERROR_COLOR,
    paddingLeft: 4,
  },
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: ERROR_COLOR,
    textAlign: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: BrandColors.primary,
    borderRadius: 4,
  },
  rememberText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
});
