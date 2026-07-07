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

import { Check, Eye, EyeOff, Lock, Mail, Square, User } from '@/components/ui/lucide-icons';
import type { IconProps } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const ICON_COLOR = BrandColors.textMuted;

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

type AuthTextFieldProps = Omit<TextInputProps, 'placeholder'> & {
  label: string;
  required?: boolean;
  icon?: FC<IconProps>;
  placeholder?: string;
  hideIcon?: boolean;
  groupStyle?: StyleProp<ViewStyle>;
  fieldStyle?: StyleProp<ViewStyle>;
};

export function AuthTextField({
  label,
  required,
  icon: Icon = User,
  placeholder,
  hideIcon = false,
  groupStyle,
  fieldStyle,
  style,
  ...props
}: AuthTextFieldProps) {
  return (
    <View style={[styles.fieldGroup, groupStyle]}>
      <AuthFieldLabel label={label} required={required} />
      <View style={[styles.field, fieldStyle]}>
        {hideIcon ? null : <Icon size={18} color={ICON_COLOR} strokeWidth={2} />}
        <TextInput
          style={[styles.input, hideIcon && styles.inputNoIcon, style]}
          placeholder={placeholder ?? label}
          placeholderTextColor={BrandColors.textMuted}
          {...props}
        />
      </View>
    </View>
  );
}

type AuthEmailFieldProps = Omit<TextInputProps, 'placeholder'> & {
  label?: string;
  required?: boolean;
  placeholder?: string;
};

export function AuthEmailField({
  label = 'Email Address',
  required = true,
  placeholder = 'Email Address',
  style,
  ...props
}: AuthEmailFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <AuthFieldLabel label={label} required={required} />
      <View style={styles.field}>
        <Mail size={18} color={ICON_COLOR} strokeWidth={2} />
        <TextInput
          style={[styles.input, style]}
          placeholder={placeholder}
          placeholderTextColor={BrandColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          {...props}
        />
      </View>
    </View>
  );
}

type AuthPasswordFieldProps = Omit<TextInputProps, 'placeholder' | 'secureTextEntry'> & {
  label?: string;
  required?: boolean;
  placeholder?: string;
};

export function AuthPasswordField({
  label = 'Password',
  required = true,
  placeholder = 'Password',
  style,
  ...props
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <AuthFieldLabel label={label} required={required} />
      <View style={styles.field}>
        <Lock size={18} color={ICON_COLOR} strokeWidth={2} />
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
            <EyeOff size={18} color={ICON_COLOR} strokeWidth={2} />
          ) : (
            <Eye size={18} color={ICON_COLOR} strokeWidth={2} />
          )}
        </Pressable>
      </View>
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
