import { type FC, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CircleCheck,
  CircleX,
  Grid3x3,
  Layers,
  Leaf,
  MoveHorizontal,
  Shield,
  Wind,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { SUSTAINABILITY_DOT, getFabricPropertyColor, type FabricProfile, type SustainabilityRating } from '@/constants/mock-data';

type FabricProfileCardProps = {
  profile: FabricProfile;
  sustainabilityScore: number;
  sustainabilityRating: SustainabilityRating;
};

type PropertyBoxProps = {
  label: string;
  value: string;
  valueColor?: string;
  icon: FC<IconProps>;
};

function PropertyBox({ label, value, valueColor, icon: Icon }: PropertyBoxProps) {
  return (
    <View style={[styles.box, faintCardShadow()]}>
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
          <PropertyBox
            label="BREATHABILITY"
            value={profile.breathability}
            valueColor={getFabricPropertyColor(profile.breathability)}
            icon={Wind}
          />
        </PropertyRow>

        <PropertyRow>
          <PropertyBox
            label="DURABILITY"
            value={profile.durability}
            valueColor={getFabricPropertyColor(profile.durability)}
            icon={Shield}
          />
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CARE INSTRUCTIONS</Text>
        <View style={[styles.careCard, faintCardShadow()]}>
          {profile.careInstructions.map((instruction) => (
            <View key={instruction.text} style={styles.careRow}>
              {instruction.recommended ? (
                <CircleCheck size={18} color="#16a34a" strokeWidth={2.25} />
              ) : (
                <CircleX size={18} color="#dc2626" strokeWidth={2.25} />
              )}
              <Text style={styles.careText}>{instruction.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>BEST USED FOR</Text>
        <View style={styles.useCasePills}>
          {profile.useCases.map((useCase) => (
            <View key={useCase} style={styles.useCasePill}>
              <Text style={styles.useCasePillText}>{useCase}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
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
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  careCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  careRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  careText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: BrandColors.text,
    lineHeight: 20,
  },
  useCasePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  useCasePill: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  useCasePillText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
});
