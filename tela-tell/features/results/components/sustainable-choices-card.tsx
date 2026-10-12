import { useState } from 'react';
import { Text } from 'react-native';

import { CardLink } from '@/components/ui/card-link';
import { Leaf } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { Type } from '@/constants/typography';
import {
  SUSTAINABLE_CHOICES_ACTION,
  SUSTAINABLE_CHOICES_CLAIMS,
  SUSTAINABLE_CHOICES_KEEP_IN_MIND,
  SUSTAINABLE_CHOICES_SHEET_TITLE,
  SUSTAINABLE_CHOICES_TEXT,
  SUSTAINABLE_CHOICES_TITLE,
} from '@/data/fabrics/sustainable-choices';
import { BasisSheet } from '@/features/recommendations/components/basis-sheet';

/** Points to reuse and wearing clothes longer; no score, no rating, nothing about this garment. */
export function SustainableChoicesCard() {
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <StatusCard icon={Leaf} tone="good" title={SUSTAINABLE_CHOICES_TITLE}>
      <BasisSheet
        visible={sheetVisible}
        title={SUSTAINABLE_CHOICES_SHEET_TITLE}
        icon={Leaf}
        claims={SUSTAINABLE_CHOICES_CLAIMS}
        keepInMind={SUSTAINABLE_CHOICES_KEEP_IN_MIND}
        onClose={() => setSheetVisible(false)}
      />
      <Text style={Type.body}>{SUSTAINABLE_CHOICES_TEXT}</Text>
      <CardLink label={SUSTAINABLE_CHOICES_ACTION} onPress={() => setSheetVisible(true)} />
    </StatusCard>
  );
}
