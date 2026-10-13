import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { Shield } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { STATUS_COLORS } from '@/constants/status-colors';
import { Type } from '@/constants/typography';
import {
  FIBER_SHEDDING_TITLE,
  NOT_MEDICAL_NOTE,
  otherSyntheticNote,
  type FiberStatusAdvisory,
} from '@/data/fabrics/health-advisory';

export function FiberStatusCard({ advisory }: { advisory: FiberStatusAdvisory }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const note = otherSyntheticNote(advisory.otherSynthetics);

  return (
    <StatusCard
      icon={Shield}
      tone={advisory.tone}
      title={FIBER_SHEDDING_TITLE}
      pillLabel={advisory.pillLabel}
      onInfoPress={() => setInfoOpen(true)}
      infoAccessibilityLabel="About this advisory">
      <InfoSheet
        visible={infoOpen}
        title="About this advisory"
        sections={[
          {
            heading: 'What this result means',
            body: 'This describes the fiber the app predicts is most likely. The prediction may be wrong, and the scan cannot identify blends, coatings or finishes.',
          },
          { heading: 'Keep in mind', body: NOT_MEDICAL_NOTE },
        ]}
        icon={Shield}
        tone={advisory.tone}
        onClose={() => setInfoOpen(false)}
      />
      <Text style={Type.body}>{advisory.text}</Text>
      {note ? <Text style={[Type.secondary, styles.note]}>{note}</Text> : null}
    </StatusCard>
  );
}

const styles = StyleSheet.create({
  note: {
    color: STATUS_COLORS.caution.accent,
  },
});
