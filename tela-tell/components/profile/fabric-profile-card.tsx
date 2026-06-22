import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { SUSTAINABILITY_DOT, type FabricProfile, type SustainabilityRating } from '@/constants/mock-data';

type FabricProfileCardProps = {
  profile: FabricProfile;
  sustainabilityScore: number;
  sustainabilityRating: SustainabilityRating;
};

type PropertyBoxProps = {
  label: string;
  value: string;
  valueColor?: string;
  fullWidth?: boolean;
};

function PropertyBox({ label, value, valueColor, fullWidth }: PropertyBoxProps) {
  return (
    <View style={[styles.box, faintCardShadow(), fullWidth && styles.boxFull]}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={[styles.boxValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function PropertyRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

export function FabricProfileCard({
  profile,
  sustainabilityScore,
  sustainabilityRating,
}: FabricProfileCardProps) {
  const sustainabilityColor = SUSTAINABILITY_DOT[sustainabilityRating];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <PropertyRow>
          <PropertyBox label="TEXTURE" value={profile.texture} />
          <PropertyBox label="BREATHABILITY" value={profile.breathability} />
        </PropertyRow>

        <PropertyRow>
          <PropertyBox label="DURABILITY" value={profile.durability} />
          <PropertyBox
            label="SUSTAINABILITY"
            value={`${sustainabilityScore}/10`}
            valueColor={sustainabilityColor}
          />
        </PropertyRow>

        <PropertyRow>
          <PropertyBox label="WEAVE" value={profile.weave} />
          <PropertyBox label="STRETCH" value={profile.stretch} />
        </PropertyRow>

        <PropertyBox label="CARE" value={profile.care} fullWidth />
        <PropertyBox label="USE CASES" value={profile.useCases} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  box: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F0EDF8',
  },
  boxFull: {
    flex: undefined,
    width: '100%',
  },
  boxLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  boxValue: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: BrandColors.text,
    lineHeight: 22,
  },
});
