import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandColors } from '@/constants/brand';

export function AuthFormFields({ children }: { children: ReactNode }) {
  return <View style={styles.fields}>{children}</View>;
}

export function AuthFormActions({ children }: { children: ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

export const styles = StyleSheet.create({
  fields: {
    gap: 14,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    gap: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
  },
});
