import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { Droplets } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import {
  FIBER_INFORMATION_SHEET,
  FIBER_INFORMATION_TITLE,
  type FiberInformation,
} from '@/data/fabrics/shedding-why';
import { getSourceNumber } from '@/data/fabrics/source-registry';

function referenceNumbers(sourceIds: string[]): string {
  const numbers = sourceIds
    .map((id) => getSourceNumber(id))
    .filter((n): n is number => n !== undefined);
  return numbers.length > 0 ? `References: ${numbers.map((n) => `[${n}]`).join(' ')} (see About)` : '';
}

/**
 * Information about microplastics and fiber shedding for a scan whose most likely fiber is natural
 * or cellulose-based (Cotton, Wool, Silk, Linen, Rayon, Leather, Suede, Abaca). Same card frame as
 * the rated "Fiber shedding" card, but neutral and with no level pill: the references do not
 * support a rating for these fibers.
 */
export function FiberInformationCard({ info }: { info: FiberInformation }) {
  const [showSheet, setShowSheet] = useState(false);
  const references = referenceNumbers(info.sourceIds);

  return (
    <StatusCard
      icon={Droplets}
      tone="neutral"
      title={FIBER_INFORMATION_TITLE}
      onInfoPress={() => setShowSheet(true)}
      infoAccessibilityLabel="About this fiber information">
      <InfoSheet
        visible={showSheet}
        title="About this information"
        sections={FIBER_INFORMATION_SHEET}
        icon={Droplets}
        onClose={() => setShowSheet(false)}
      />

      <Text style={styles.summary}>{info.text}</Text>
      {references ? <Text style={styles.references}>{references}</Text> : null}
    </StatusCard>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.text,
  },
  references: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: BrandColors.textMuted,
  },
});
