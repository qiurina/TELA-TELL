import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Eye } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { SUSTAINABILITY_DOT, type RecentScanPreview } from '@/constants/mock-data';

type ScanHistoryCardProps = {
  scan: RecentScanPreview;
  onPress: () => void;
};

export function ScanHistoryCard({ scan, onPress }: ScanHistoryCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, faintCardShadow(), pressed && styles.cardPressed]}
      onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.fabric}>{scan.primaryFabric}</Text>
          <View
            style={[styles.sustainabilityDot, { backgroundColor: SUSTAINABILITY_DOT[scan.sustainability] }]}
          />
        </View>
        <Text style={styles.composition}>{scan.composition}</Text>
        <Text style={styles.meta}>{scan.scannedAt}</Text>
        {scan.mislabeling ? (
          <Text style={styles.mislabelingTag}>Mislabeling detected</Text>
        ) : (
          <Text style={styles.verifiedTag}>Label check passed</Text>
        )}
      </View>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.eyeButton}>
        <Eye size={18} color={BrandColors.white} strokeWidth={2} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    minHeight: 88,
  },
  cardPressed: {
    opacity: 0.92,
  },
  content: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabric: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  sustainabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  composition: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    opacity: 0.85,
  },
  mislabelingTag: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
  },
  verifiedTag: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#16a34a',
    marginTop: 2,
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
