import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FabricCatalog } from '@/features/fabrics/components/fabric-catalog';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

export default function FabricsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.page, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Fiber guide</Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <FabricCatalog />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.primary,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  page: {
    flex: 1,
  },
  topRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerText: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  sheet: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    flexGrow: 1,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  introText: {
    flex: 1,
    gap: 4,
  },
  introTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  introBody: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
});
