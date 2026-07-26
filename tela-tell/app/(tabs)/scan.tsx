import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraGuide } from '@/features/scan/components/camera-guide';
import { ScanActions } from '@/features/scan/components/scan-actions';
import { DEFAULT_GARMENT_CONDITION, type GarmentCondition } from '@/data/scans/garment-condition';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { useFabricCapture } from '@/features/scan/hooks/use-fabric-capture';
import { clearLastCaptureUri, setLastCaptureUri } from '@/features/scan/lib/last-capture';
import { clearLastSellerLabel, getLastSellerLabel } from '@/features/scan/lib/last-seller-label';
import { clearRegionSelection } from '@/features/scan/lib/region-selection';
import { clearLastGarmentCondition, getLastGarmentCondition, setLastGarmentCondition } from '@/features/scan/lib/garment-condition';
import { consumeFreshScan } from '@/features/scan/lib/scan-fresh';
import { getScanMode } from '@/features/scan/lib/scan-session';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guideVisible, setGuideVisible] = useState(true);
  const [savedSellerLabel, setSavedSellerLabel] = useState<string | null>(null);
  const [garmentCondition, setGarmentCondition] = useState<GarmentCondition>(
    () => getLastGarmentCondition(),
  );
  const { captureFromCamera, captureFromGallery } = useFabricCapture();

  useFocusEffect(
    useCallback(() => {
      if (consumeFreshScan()) {
        setPreviewUri(null);
        clearRegionSelection();
        clearLastGarmentCondition();
        setGarmentCondition(DEFAULT_GARMENT_CONDITION);
      }
      setGuideVisible(true);
      setSavedSellerLabel(getLastSellerLabel());
    }, []),
  );

  const runAnalysis = (photoUri?: string | null) => {
    if (photoUri) {
      setLastCaptureUri(photoUri);
    } else {
      clearLastCaptureUri();
    }

    // Dual-swatch remains supported in code but is hidden from the UI for now.
    const resultId = getScanMode() === 'dual' ? 'dual' : '1';

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      router.push(`/results/${resultId}` as Href);
    }, 1500);
  };

  const handleTakePhoto = async () => {
    if (isAnalyzing) {
      return;
    }

    const photoUri = await captureFromCamera();
    if (photoUri) {
      setPreviewUri(photoUri);
    }
  };

  const handleUpload = async () => {
    if (isAnalyzing) {
      return;
    }

    const photoUri = await captureFromGallery();
    if (photoUri) {
      setPreviewUri(photoUri);
    }
  };

  const handleAnalyze = () => {
    if (isAnalyzing) {
      return;
    }

    if (!previewUri) {
      Alert.alert(
        'No fabric photo',
        'Capture or upload a fabric image first, then tap Analyze Fabric.',
      );
      return;
    }

    setLastGarmentCondition(garmentCondition);

    if (getScanMode() === 'dual') {
      setLastCaptureUri(previewUri);
      clearRegionSelection();
      router.push('/region-select' as Href);
      return;
    }

    runAnalysis(previewUri);
  };

  const handleTryAnother = () => {
    if (isAnalyzing) {
      return;
    }

    setPreviewUri(null);
    clearRegionSelection();
    clearLastGarmentCondition();
    setGarmentCondition(DEFAULT_GARMENT_CONDITION);
  };

  const handleGarmentConditionChange = (condition: GarmentCondition) => {
    setGarmentCondition(condition);
    setLastGarmentCondition(condition);
  };

  const handleAddLabel = () => {
    router.push('/modal');
  };

  const handleOpenPreferences = () => {
    router.push('/user-preferences');
  };

  const handleRemoveLabel = () => {
    clearLastSellerLabel();
    setSavedSellerLabel(null);
  };

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
            <Text style={styles.title}>Scan Fabric</Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <CameraGuide
              previewUri={previewUri}
              isAnalyzing={isAnalyzing}
              guideVisible={guideVisible}
              onDismissGuide={() => setGuideVisible(false)}
              onShowGuide={() => setGuideVisible(true)}
            />

            <ScanActions
              hasPreview={Boolean(previewUri)}
              savedSellerLabel={savedSellerLabel}
              onTakePhoto={handleTakePhoto}
              onUpload={handleUpload}
              onAnalyze={handleAnalyze}
              onTryAnother={handleTryAnother}
              garmentCondition={garmentCondition}
              onGarmentConditionChange={handleGarmentConditionChange}
              onAddLabel={handleAddLabel}
              onRemoveLabel={handleRemoveLabel}
              onOpenPreferences={handleOpenPreferences}
              isAnalyzing={isAnalyzing}
            />
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
    gap: 1,
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
    gap: 12,
    flexGrow: 1,
  },
});
