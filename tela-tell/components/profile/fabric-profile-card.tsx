import { type FC, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  Droplets,
  Grid3x3,
  Layers,
  Leaf,
  MoveHorizontal,
  Shield,
  Shirt,
  Wind,
  type IconProps,
} from '@/components/ui/lucide-icons';
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
  icon: FC<IconProps>;
};

function PropertyBox({ label, value, valueColor, fullWidth, icon: Icon }: PropertyBoxProps) {
  return (
    <View style={[styles.box, faintCardShadow(), fullWidth && styles.boxFull]}>
      <View style={styles.labelRow}>
        <Icon size={14} color={BrandColors.textMuted} strokeWidth={2} />
        <Text style={styles.boxLabel}>{label}</Text>
      </View>
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
          <PropertyBox label="TEXTURE" value={profile.texture} icon={Layers} />
          <PropertyBox label="BREATHABILITY" value={profile.breathability} icon={Wind} />
        </PropertyRow>

        <PropertyRow>
          <PropertyBox label="DURABILITY" value={profile.durability} icon={Shield} />
          <PropertyBox
            label="SUSTAINABILITY"
            value={`${sustainabilityScore}/10`}
            valueColor={sustainabilityColor}
            icon={Leaf}
          />
        </PropertyRow>

        <PropertyRow>
          <PropertyBox label="WEAVE" value={profile.weave} icon={Grid3x3} />
          <PropertyBox label="STRETCH" value={profile.stretch} icon={MoveHorizontal} />
        </PropertyRow>

        <PropertyBox label="CARE" value={profile.care} icon={Droplets} fullWidth />
        <PropertyBox label="USE CASES" value={profile.useCases} icon={Shirt} fullWidth />
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
    borderColor: BrandColors.borderLight,
  },
  boxFull: {
    flex: undefined,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boxLabel: {
    flex: 1,
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
