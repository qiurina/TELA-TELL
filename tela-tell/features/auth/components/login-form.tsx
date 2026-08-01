import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthError } from '@/db/users';

import {
  AuthPrimaryButton,
  AuthSwitchPrompt,
} from '@/features/auth/components/auth-buttons';
import {
  AuthEmailField,
  AuthFormBanner,
  AuthPasswordField,
  AuthRememberRow,
} from '@/features/auth/components/auth-form-field';
import {
  AuthFormActions,
  AuthFormFields,
} from '@/features/auth/components/auth-form-layout-shared';
import { useAuth } from '@/features/auth/context/auth-provider';
import { isValidEmail } from '@/features/auth/lib/validation';

type LoginFormProps = {
  onSwitchToRegister: () => void;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clearErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Enter your password.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await signIn(trimmedEmail, password);
      router.replace('/(tabs)' as Href);
    } catch (error) {
      const message =
        error instanceof AuthError
          ? error.message
          : 'Could not sign in. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthFormFields>
        <AuthEmailField
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearErrors();
          }}
          placeholder="Email Address"
          error={fieldErrors.email}
        />
        <AuthPasswordField
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            clearErrors();
          }}
          error={fieldErrors.password}
        />
      </AuthFormFields>

      <AuthRememberRow checked={rememberMe} onToggle={() => setRememberMe((current) => !current)} />

      <AuthFormActions>
        <AuthFormBanner message={formError} />
        <AuthPrimaryButton
          label={isSubmitting ? 'Signing in...' : 'Sign in'}
          onPress={() => void handleSignIn()}
          disabled={isSubmitting}
        />
      </AuthFormActions>

      <View style={styles.switchWrap}>
        <AuthSwitchPrompt
          prompt="Don't have an account?"
          action="Sign up"
          onPress={onSwitchToRegister}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  switchWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
});
