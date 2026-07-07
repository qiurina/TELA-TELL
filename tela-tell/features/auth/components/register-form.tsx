import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import {
  AuthPrimaryButton,
  AuthSwitchPrompt,
  AuthTertiaryButton,
} from '@/features/auth/components/auth-buttons';
import {
  AuthEmailField,
  AuthPasswordField,
  AuthTextField,
} from '@/features/auth/components/auth-form-field';
import {
  AuthFormActions,
  AuthFormFields,
} from '@/features/auth/components/auth-form-layout-shared';
import { PasswordRequirements } from '@/features/auth/components/password-requirements';
import { useAuth } from '@/features/auth/context/auth-provider';
import { isPasswordValid } from '@/features/auth/lib/password';
import { isValidEmail } from '@/features/auth/lib/validation';

type RegisterFormProps = {
  onSwitchToLogin: () => void;
  showSkip?: boolean;
};

export function RegisterForm({ onSwitchToLogin, showSkip = true }: RegisterFormProps) {
  const router = useRouter();
  const { signIn, continueWithoutAccount } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      Alert.alert('First name required', 'Enter your first name to continue.');
      return;
    }

    if (!trimmedLastName) {
      Alert.alert('Last name required', 'Enter your last name to continue.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Check your email', 'Enter a valid email address to continue.');
      return;
    }

    if (!isPasswordValid(password)) {
      Alert.alert('Check your password', 'Make sure your password meets all requirements.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Make sure both password fields match.');
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

  const handleSkip = async () => {
    await continueWithoutAccount();
    router.replace('/(tabs)' as Href);
  };

  return (
    <>
      <AuthFormFields>
        <View style={styles.nameRow}>
          <View style={styles.firstNameCol}>
            <AuthTextField
              label="First Name"
              required
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
            />
          </View>
          <View style={styles.miCol}>
            <AuthTextField
              label="M.I."
              hideIcon
              fieldStyle={styles.miField}
              value={middleInitial}
              onChangeText={(value) => setMiddleInitial(value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())}
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={2}
              placeholder="M.I."
            />
          </View>
        </View>
        <AuthTextField
          label="Last Name"
          required
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
        />
        <AuthEmailField value={email} onChangeText={setEmail} />
        <View>
          <AuthPasswordField
            value={password}
            onChangeText={setPassword}
            textContentType="newPassword"
            autoComplete="new-password"
          />
          <PasswordRequirements password={password} />
        </View>
        <AuthPasswordField
          label="Confirm Password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textContentType="newPassword"
          autoComplete="new-password"
        />
      </AuthFormFields>

      <AuthFormActions>
        <AuthPrimaryButton
          label={isSubmitting ? 'Creating account...' : 'Sign up'}
          onPress={() => void handleRegister()}
          disabled={isSubmitting}
        />
        {showSkip ? (
          <AuthTertiaryButton label="Continue without account" onPress={() => void handleSkip()} />
        ) : null}
      </AuthFormActions>

      <View style={styles.switchWrap}>
        <AuthSwitchPrompt
          prompt="Already have an account?"
          action="Sign in"
          onPress={onSwitchToLogin}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  firstNameCol: {
    flex: 1,
  },
  miCol: {
    width: 72,
  },
  miField: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  switchWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
});
