import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import {
  AuthPrimaryButton,
  AuthSwitchPrompt,
} from '@/features/auth/components/auth-buttons';
import {
  AuthEmailField,
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

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Check your email', 'Enter a valid email address to continue.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Check your password', 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(trimmedEmail);
      router.replace('/(tabs)' as Href);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthFormFields>
        <AuthEmailField value={email} onChangeText={setEmail} placeholder="Email Address" />
        <AuthPasswordField value={password} onChangeText={setPassword} />
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