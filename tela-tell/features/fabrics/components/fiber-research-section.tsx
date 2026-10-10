import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoButton } from '@/components/ui/info-button';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import {
  RESEARCH_BANNER,
  RESEARCH_INSUFFICIENT,
  RESEARCH_SECTION_TITLE,
  RESEARCH_SHEDDING_NOTE,
  RESEARCH_SHEET_FACTS_LABEL,
  RESEARCH_SHEET_NOTE,
  RESEARCH_SHEET_TITLE,
  getFiberResearch,
  getResearchClaims,
  type ResearchFinding,
} from '@/data/fabrics/fiber-research';
import { getSourceNumber } from '@/data/fabrics/source-registry';
import { BasisSheet } from '@/features/recommendations/components/basis-sheet';

function referenceText(finding: ResearchFinding): string {
  const numbers = finding.sourceIds
    .map((id) => getSourceNumber(id))
    .filter((n): n is number => n !== undefined);
  return numbers.length > 0 ? `Source [${numbers.join(', ')}]` : '';
}

function FindingCard({ finding }: { finding: ResearchFinding }) {
  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{finding.title}</Text>
        <View style={styles.evidencePill}>
          <Text style={styles.evidenceText}>
            {finding.evidence === 'full text' ? 'Full text read' : 'Abstract only'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardText}>{finding.text}</Text>
      <Text style={styles.cardSource}>{referenceText(finding)}</Text>
    </View>
  );
}

/**
 * Sourced lab findings for one fiber, or "Insufficient evidence". It is not a rating and it does
 * not describe a finished garment; see data/fabrics/fiber-research.ts.
 */
export function FiberResearchSection({ fabric }: { fabric: SupportedFabric }) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const findings = getFiberResearch(fabric);

  return (
    <View style={styles.section}>
      <BasisSheet
        visible={sheetVisible}
        title={RESEARCH_SHEET_TITLE}
        claims={getResearchClaims(fabric)}
        editorialNote={RESEARCH_SHEET_NOTE}
        claimLabels={{ fact: RESEARCH_SHEET_FACTS_LABEL }}
        noEvidenceNote={null}
        onClose={() => setSheetVisible(false)}
      />

      <View style={styles.header}>
        <Text style={styles.label}>{RESEARCH_SECTION_TITLE}</Text>
        {findings.length > 0 ? (
          <InfoButton
            onPress={() => setSheetVisible(true)}
            accessibilityLabel="About these research findings"
          />
        ) : null}
      </View>

      <Text style={styles.banner}>{RESEARCH_BANNER}</Text>

      {findings.length > 0 ? (
        <>
          {findings.map((finding) => (
            <FindingCard key={finding.title} finding={finding} />
          ))}
          <Text style={styles.banner}>{RESEARCH_SHEDDING_NOTE}</Text>
        </>
      ) : (
        <View style={[styles.card, faintCardShadow()]}>
          <Text style={styles.cardText}>{RESEARCH_INSUFFICIENT}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    textTransform: 'uppercase',
  },
  banner: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: BrandColors.textMuted,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  evidencePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    backgroundColor: BrandColors.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  evidenceText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: BrandColors.textMuted,
  },
  cardText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  cardSource: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: BrandColors.textMuted,
  },
});
