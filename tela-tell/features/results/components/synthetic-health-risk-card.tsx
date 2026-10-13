import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { CardLink } from '@/components/ui/card-link';
import { Info, Shield } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { Type } from '@/constants/typography';
import type { StatusTone } from '@/constants/status-colors';
import { SHEDDING_SHEET_TITLE } from '@/data/fabrics/assessment-disclaimers';
import { SHEDDING_ESTIMATE_TITLE } from '@/data/fabrics/health-advisory';
import type { HealthRiskLevel, SyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';
import { WhyItMatters } from '@/features/results/components/why-it-matters';

const LEVEL_TONE: Record<HealthRiskLevel, StatusTone> = {
  low: 'good',
  moderate: 'caution',
  high: 'alert',
};

type SyntheticHealthRiskCardProps = {
  risk: SyntheticHealthRisk;
  /**
   * Scan results pass this: the card stays short and its button opens Eco tips. Without it (on Eco
   * tips, the detail page) the card shows "Why it matters" open instead.
   */
  onReduceShedding?: () => void;
};

export function SyntheticHealthRiskCard({ risk, onReduceShedding }: SyntheticHealthRiskCardProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <StatusCard
      icon={Shield}
      tone={LEVEL_TONE[risk.level]}
      title={SHEDDING_ESTIMATE_TITLE}
      pillLabel={risk.label}
      onInfoPress={() => setShowDisclaimer(true)}
      infoAccessibilityLabel="About this shedding estimate">
      <InfoSheet
        visible={showDisclaimer}
        title={SHEDDING_SHEET_TITLE}
        sections={risk.disclaimer}
        icon={Shield}
        tone={LEVEL_TONE[risk.level]}
        onClose={() => setShowDisclaimer(false)}
      />

      <Text style={Type.body}>
        <Text style={Type.lead}>About this estimate: </Text>
        {risk.reason}
      </Text>

      {onReduceShedding ? (
        <CardLink icon={Info} label="Why it matters & how to reduce it" onPress={onReduceShedding} />
      ) : (
        <View style={styles.matters}>
          <WhyItMatters fiber={risk.fibers[0]} defaultOpen />
        </View>
      )}
    </StatusCard>
  );
}

const styles = StyleSheet.create({
  matters: {
    marginTop: 4,
  },
});
