import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthError } from '@/db/users';

import {
  AuthPrimaryButton,
  AuthSwitchPrompt,
} from '@/features/auth/components/auth-buttons';
import {
  AuthPasswordField,
  AuthRememberRow,
  AuthTextField,
} from '@/features/auth/components/auth-form-field';
import {
  AuthFormActions,
  AuthFormFields,
} from '@/features/auth/components/auth-form-layout-shared';
import { useAuth } from '@/features/auth/context/auth-provider';
import { getRememberedUsername } from '@/features/auth/lib/auth-session';
import { isValidUsername } from '@/features/auth/lib/validation';

type LoginFormProps = {
  onSwitchToRegister: () => void;
};

type FieldErrors = {
  username?: string;
  password?: string;
};

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    let active = true;

    void (async () => {
      const remembered = await getRememberedUsername();
      if (!active || !remembered) {
        return;
      }
      setUsername(remembered);
      setRememberMe(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  const clearErrors = () => {
    setFieldErrors({});
  };

  const handleSignIn = async () => {
    const trimmedUsername = username.trim();
    const nextErrors: FieldErrors = {};

    if (!isValidUsername(trimmedUsername)) {
      nextErrors.username = 'Enter a valid username.';
    }

    if (!password) {
      nextErrors.password = 'Enter your password.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await signIn(trimmedUsername, password, { rememberMe });
      router.replace('/(tabs)' as Href);
    } catch (error) {
      const message =
        error instanceof AuthError
          ? error.message
          : 'Could not sign in. Please try again.';
      setFieldErrors({ username: ' ', password: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthFormFields>
        <AuthTextField
          label="Username"
          required
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            clearErrors();
          }}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          autoComplete="username"
          error={fieldErrors.username}
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
