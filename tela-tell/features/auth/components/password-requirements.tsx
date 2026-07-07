import { StyleSheet, Text, View } from 'react-native';

import { Check, CircleX } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  getPasswordRequirements,
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  getPasswordStrengthProgress,
  getPasswordSuccessLightColor,
} from '@/features/auth/lib/password';

const SUCCESS_GREEN = '#2E7D32';

type PasswordRequirementsProps = {
  password: string;
};

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (!password) {
    return null;
  }

  const requirements = getPasswordRequirements(password);
  const strength = getPasswordStrength(password);
  const progress = getPasswordStrengthProgress(strength);
  const strengthColor = getPasswordStrengthColor(strength);

  return (
    <View style={styles.container}>
      <View style={styles.strengthHeader}>
        <Text style={styles.strengthLabel}>{getPasswordStrengthLabel(strength)}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: strengthColor,
            },
          ]}
        />
      </View>

      {requirements.map((requirement) => (
        <View key={requirement.key} style={styles.requirementRow}>
          {requirement.met ? (
            <Check size={14} color={getPasswordSuccessLightColor()} strokeWidth={2.5} />
          ) : (
            <CircleX size={14} color={BrandColors.textMuted} strokeWidth={2} />
          )}
          <Text style={[styles.requirementText, requirement.met && styles.requirementMet]}>
            {requirement.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    gap: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  strengthLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  requirementText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  requirementMet: {
    color: SUCCESS_GREEN,
  },
});
