import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { Droplets, Leaf, Recycle } from '@/components/ui/lucide-icons';
import { SectionLabel } from '@/components/ui/section-label';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { Type } from '@/constants/typography';
import {
  ECO_GUIDE_HOW_TO_READ,
  ECO_GUIDE_USE_NOTE,
  getExtraReduceTips,
  type FiberEcoGuide,
} from '@/data/fabrics/eco-guide';

/**
 * Eco tips for one fiber, from the Microplastics & Sustainable Choices Guide: how to reduce
 * shedding, a better-fit alternative and reuse ideas. The fiber's microplastic status is in the
 * Health risk advisory above it; the guide's sources are listed in About.
 */
export function EcoGuideSection({ guide, isSynthetic }: { guide: FiberEcoGuide; isSynthetic: boolean }) {
  const [readOpen, setReadOpen] = useState(false);

  return (
    <View style={styles.root}>
      <InfoSheet
        visible={readOpen}
        title="About these tips"
        sections={[
          { heading: "What the scan can't tell", body: ECO_GUIDE_HOW_TO_READ },
          { heading: 'Good to know', body: ECO_GUIDE_USE_NOTE },
        ]}
        onClose={() => setReadOpen(false)}
      />

      <SectionLabel title="ECO TIPS" onInfoPress={() => setReadOpen(true)} infoAccessibilityLabel="About these tips" />

      <StatusCard icon={Droplets} tone="neutral" title="Reduce shedding">
        <Text style={Type.body}>{guide.reduceShedding}</Text>
        <View style={styles.divider} />
        <View style={styles.tips}>
          {getExtraReduceTips(isSynthetic).map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={[Type.body, styles.tipText]}>{tip}</Text>
            </View>
          ))}
        </View>
      </StatusCard>

      <StatusCard icon={Leaf} tone="neutral" title="Better-fit alternative">
        <View style={styles.alternative}>
          <Text style={Type.lead}>{guide.alternative.name}</Text>
          <Text style={Type.body}>{guide.alternative.reason}</Text>
        </View>
      </StatusCard>

      <StatusCard icon={Recycle} tone="neutral" title="Reuse it">
        <Text style={Type.body}>{guide.reuse}</Text>
      </StatusCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BrandColors.border,
  },
  tips: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    backgroundColor: BrandColors.primary,
  },
  tipText: {
    flex: 1,
  },
  alternative: {
    gap: 2,
  },
});
