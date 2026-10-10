import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Check, Info, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { STATUS_COLORS } from '@/constants/status-colors';
import { getClaimSources } from '@/data/fabrics/eco-alternatives';
import { getSourceNumber, type Source } from '@/data/fabrics/source-registry';
import type { EcoClaim, EcoClaimKind } from '@/data/scans/mock-data';

/** Shown on every Basis sheet: the suggestion itself is the authors' idea, not a finding. */
export const EDITORIAL_NOTE =
  "Suggesting this fabric is the app authors' idea, not a research ranking.";

const DIFFERENT_IMPACTS_NOTE =
  'These measure different things, so one does not cancel the other. Weigh them together.';

const NO_EVIDENCE_NOTE =
  'No study we checked directly compares this swap with the original fabric, so the app makes no claim that it is better for the environment.';

function SourceCard({ source }: { source: Source }) {
  const caution = STATUS_COLORS.caution;
  const good = STATUS_COLORS.good;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{getSourceNumber(source.id)}</Text>
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{source.shortName}</Text>
          <Text style={styles.cardYear}>{source.year ?? 'No date'}</Text>
        </View>
      </View>

      <Text style={styles.gist}>{source.gist}</Text>

      <View style={styles.block}>
        <Text style={styles.blockLabel}>WHAT IT SAYS</Text>
        {source.says.map((point) => (
          <View key={point} style={styles.pointRow}>
            <View style={styles.pointIcon}>
              <Check size={14} color={good.accent} strokeWidth={2.75} />
            </View>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.cautionBox, { backgroundColor: caution.tint, borderColor: caution.border }]}>
        <View style={styles.cautionHeader}>
          <TriangleAlert size={14} color={caution.accent} strokeWidth={2.25} />
          <Text style={[styles.blockLabel, { color: caution.accent }]}>KEEP IN MIND</Text>
        </View>
        {source.caveats.map((point) => (
          <View key={point} style={styles.pointRow}>
            <Text style={[styles.bullet, { color: caution.accent }]}>•</Text>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CLAIM_BLOCKS: { kind: EcoClaimKind; label: string }[] = [
  { kind: 'fact', label: 'FACTS' },
  { kind: 'certification', label: 'WHAT THE LABEL REQUIRES' },
  { kind: 'benefit', label: 'EVIDENCE OF A BENEFIT' },
  { kind: 'tradeoff', label: 'DOWNSIDES TO WEIGH' },
];

function sourceNumbers(claim: EcoClaim): string {
  const numbers = (claim.sourceIds ?? [])
    .map((id) => getSourceNumber(id))
    .filter((n): n is number => n !== undefined);
  return numbers.length > 0 ? ` [${numbers.join(', ')}]` : '';
}

type BasisSheetProps = {
  visible: boolean;
  title: string;
  claims: EcoClaim[];
  /** Replaces the standard "authors' idea" line, e.g. for the reuse tips. */
  editorialNote?: string;
  /** Replaces the heading of a claim block, e.g. for evidence that is not about a swap. */
  claimLabels?: Partial<Record<EcoClaimKind, string>>;
  /** Replaces the "no study compares this swap" note shown when a sheet has no evidence claims; null hides it. */
  noEvidenceNote?: string | null;
  onClose: () => void;
};

/**
 * Basis for one card (or the reuse tips). Keeps four things apart: the authors' choice, what is
 * a material fact, what a label requires, and what the research found, including downsides.
 * Numbers match the About screen's reference list.
 */
export function BasisSheet({
  visible,
  title,
  claims,
  editorialNote = EDITORIAL_NOTE,
  claimLabels,
  noEvidenceNote = NO_EVIDENCE_NOTE,
  onClose,
}: BasisSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sources = getClaimSources(claims);
  const hasEvidence = claims.some((c) => c.kind === 'benefit' || c.kind === 'tradeoff');
  const aspects = new Set(
    claims.filter((c) => c.kind === 'benefit' || c.kind === 'tradeoff').map((c) => c.aspect ?? ''),
  );
  // A benefit and a downside that measure different impacts (e.g. making the fiber vs washing).
  const measuresDifferentImpacts =
    claims.some((c) => c.kind === 'benefit') && claims.some((c) => c.kind === 'tradeoff') && aspects.size > 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <ScrollView
            style={{ maxHeight: windowHeight * 0.62 }}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}>
            <View style={styles.noteBox}>
              <Info size={15} color={BrandColors.primaryDark} strokeWidth={2.25} />
              <Text style={styles.noteText}>{editorialNote}</Text>
            </View>

            {CLAIM_BLOCKS.map(({ kind, label }) => {
              // Plain definitions ("A mix of cotton and linen") need no source, so only sourced
              // facts are listed here.
              const lines = claims.filter(
                (claim) => claim.kind === kind && (kind !== 'fact' || (claim.sourceIds ?? []).length > 0),
              );
              if (lines.length === 0) {
                return null;
              }
              return (
                <View key={kind} style={styles.block}>
                  <Text style={styles.blockLabel}>{claimLabels?.[kind] ?? label}</Text>
                  {lines.map((claim) => (
                    <Text key={claim.text} style={styles.claimText}>
                      {claim.aspect ? <Text style={styles.claimAspect}>{claim.aspect}: </Text> : null}
                      {claim.text}
                      <Text style={styles.claimRef}>{sourceNumbers(claim)}</Text>
                    </Text>
                  ))}
                  {kind === 'tradeoff' && measuresDifferentImpacts ? (
                    <Text style={styles.claimNote}>{DIFFERENT_IMPACTS_NOTE}</Text>
                  ) : null}
                </View>
              );
            })}

            {!hasEvidence && noEvidenceNote ? (
              <View style={styles.block}>
                <Text style={styles.blockLabel}>ENVIRONMENTAL EVIDENCE</Text>
                <Text style={styles.claimText}>{noEvidenceNote}</Text>
              </View>
            ) : null}

            {sources.length > 0 ? <Text style={styles.sectionLabel}>SOURCES</Text> : null}
            {sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityRole="button">
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 18,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.border,
  },
  header: {
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  list: {
    gap: 14,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: BrandColors.lavender,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 12,
  },
  noteText: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.text,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  claimText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.text,
  },
  claimAspect: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
  claimNote: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: BrandColors.textMuted,
  },
  claimRef: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.primaryDark,
  },
  card: {
    gap: 12,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  numberText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  cardYear: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  gist: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.primaryDark,
  },
  block: {
    gap: 6,
  },
  blockLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointIcon: {
    width: 16,
    paddingTop: 3,
    alignItems: 'center',
  },
  bullet: {
    width: 16,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  pointText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.text,
  },
  cautionBox: {
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 11,
    paddingHorizontal: 40,
    borderRadius: 999,
    backgroundColor: BrandColors.primary,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
  },
});
