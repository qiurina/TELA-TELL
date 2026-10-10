import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { sourceLabel, type Source } from '@/data/fabrics/source-registry';

function openReference(url: string) {
  Linking.openURL(url).catch(() => {
    // No browser or no connection: the citation text above the link is still readable offline.
  });
}

/** One numbered reference: citation, what it is used for, and a link (needs internet to open). */
export function ReferenceItem({ source, number }: { source: Source; number: number }) {
  return (
    <View style={styles.referenceItem}>
      <Text style={styles.sourceItem}>
        [{number}] {sourceLabel(source)}. {source.title}.
      </Text>
      <Text style={styles.referenceUsedFor}>Used for: {source.usedFor}</Text>
      <Pressable
        onPress={() => openReference(source.url)}
        hitSlop={6}
        accessibilityRole="link"
        accessibilityLabel={`Open reference ${number}: ${source.title}`}>
        <Text style={styles.referenceLink} numberOfLines={1}>
          Open source (needs internet)
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  referenceItem: {
    gap: 2,
  },
  sourceItem: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.text,
  },
  referenceUsedFor: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  referenceLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    lineHeight: 18,
    color: BrandColors.primary,
  },
});
