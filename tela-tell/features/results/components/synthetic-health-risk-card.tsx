import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { InfoSheet } from '@/components/ui/info-sheet';
import { Shield } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { StatusTone } from '@/constants/status-colors';
import { SHEDDING_SHEET_TITLE } from '@/data/fabrics/assessment-disclaimers';
import type { HealthRiskLevel, SyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';

const LEVEL_TONE: Record<HealthRiskLevel, StatusTone> = {
  low: 'good',
  moderate: 'caution',
  high: 'alert',
};

type SyntheticHealthRiskCardProps = {
  risk: SyntheticHealthRisk;
};

export function SyntheticHealthRiskCard({ risk }: SyntheticHealthRiskCardProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <StatusCard
      icon={Shield}
      tone={LEVEL_TONE[risk.level]}
      title="Fiber shedding"
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

      <Text style={styles.summary}>
        <Text style={styles.lead}>Why {risk.label}: </Text>
        {risk.reason}
      </Text>
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
  lead: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
});
