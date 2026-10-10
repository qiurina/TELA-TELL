import { StyleSheet, Text, View } from 'react-native';

import { ReferenceItem } from '@/components/ui/reference-item';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  SHEDDING_EXPLAINER_FOOTNOTE,
  SHEDDING_EXPLAINER_INTRO,
  SHEDDING_EXPLAINER_SECTIONS,
  SHEDDING_EXPLAINER_TITLE,
  SHEDDING_REFERENCES_HEADING,
  SHEDDING_REFERENCE_IDS,
  type ExplainerItem,
} from '@/data/fabrics/shedding-explainer';
import { getSource, getSourceNumber } from '@/data/fabrics/source-registry';
import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';

function refNumbers(item: ExplainerItem): string {
  const numbers = (item.sourceIds ?? [])
    .map((id) => getSourceNumber(id))
    .filter((n): n is number => n !== undefined);
  return numbers.length > 0 ? ` [${numbers.join(', ')}]` : '';
}

/**
 * Detailed, offline guide to shedding: why fabrics shed, what affects it, what the studies found,
 * what the estimate means, and the references. The shedding card and its sheet stay short and
 * point here, so the research detail lives in one place.
 */
export default function WhySyntheticsShedScreen() {
  return (
    <ProfileScreenShell title={SHEDDING_EXPLAINER_TITLE} showBack>
      <Text style={styles.intro}>{SHEDDING_EXPLAINER_INTRO}</Text>

      {SHEDDING_EXPLAINER_SECTIONS.map((section) => (
        <View key={section.heading} style={[styles.card, faintCardShadow()]}>
          <Text style={styles.heading}>{section.heading}</Text>
          {section.items.map((item) => (
            <Text key={item.text} style={styles.body}>
              {item.text}
              <Text style={styles.ref}>{refNumbers(item)}</Text>
            </Text>
          ))}
        </View>
      ))}

      <View style={[styles.card, faintCardShadow()]}>
        <Text style={styles.heading}>{SHEDDING_REFERENCES_HEADING}</Text>
        {SHEDDING_REFERENCE_IDS.map((id) => {
          const source = getSource(id);
          const number = getSourceNumber(id);
          return source && number ? <ReferenceItem key={id} source={source} number={number} /> : null;
        })}
      </View>

      <Text style={styles.footnote}>{SHEDDING_EXPLAINER_FOOTNOTE}</Text>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  card: {
    gap: 8,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  heading: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primaryDark,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.text,
  },
  ref: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  footnote: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
});
