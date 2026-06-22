import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  SUITABILITY_COLOR,
  type GarmentPurposeItem,
  type ScanRecommendations,
} from '@/constants/mock-data';

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function Card({ children }: { children: ReactNode }) {
  return <View style={[styles.card, faintCardShadow()]}>{children}</View>;
}

function PurposeBox({ purpose, suitability }: { purpose: string; suitability: GarmentPurposeItem['suitability'] }) {
  return (
    <View style={[styles.purposeBox, faintCardShadow()]}>
      <Text style={styles.purposeBoxName}>{purpose}</Text>
      <Text style={[styles.purposeBoxRating, { color: SUITABILITY_COLOR[suitability] }]}>
        {suitability}
      </Text>
    </View>
  );
}

function GarmentPurposeSection({ items }: { items: GarmentPurposeItem[] }) {
  const rows: GarmentPurposeItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View style={styles.section}>
      <SectionLabel title="GARMENT PURPOSE / SUITABILITY" />
      <View style={styles.purposeGrid}>
        {rows.map((row) => (
          <View key={row.map((item) => item.purpose).join('-')} style={styles.purposeRow}>
            {row.map((item) => (
              <PurposeBox key={item.purpose} purpose={item.purpose} suitability={item.suitability} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function EcoAwarenessSection({
  ecoAwareness,
}: {
  ecoAwareness: ScanRecommendations['ecoAwareness'];
}) {
  return (
    <View style={styles.section}>
      <SectionLabel title="ECO + RECYCLED AWARENESS" />
      <Card>
        <Text style={styles.bodyText}>{ecoAwareness.summary}</Text>
        <View style={styles.tipsList}>
          {ecoAwareness.tips.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.bullet} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
        <View style={styles.altBox}>
          <Text style={styles.altLabel}>RECOMMENDED ALTERNATIVE</Text>
          <Text style={styles.altValue}>{ecoAwareness.alternative}</Text>
        </View>
      </Card>
    </View>
  );
}

function ReuseSection({ reuse }: { reuse: ScanRecommendations['reuse'] }) {
  const items = [
    { label: 'RESALE', value: reuse.resale },
    { label: 'DONATE', value: reuse.donate },
    { label: 'UPCYCLE', value: reuse.upcycle },
  ];

  return (
    <View style={styles.section}>
      <SectionLabel title="RESALE / DONATE / UPCYCLE" />
      <View style={styles.list}>
        {items.map((item) => (
          <Card key={item.label}>
            <Text style={styles.reuseLabel}>{item.label}</Text>
            <Text style={styles.bodyText}>{item.value}</Text>
          </Card>
        ))}
      </View>
    </View>
  );
}

type RecommendationsContentProps = {
  recommendations: ScanRecommendations;
};

export function RecommendationsContent({ recommendations }: RecommendationsContentProps) {
  return (
    <View style={styles.container}>
      <GarmentPurposeSection items={recommendations.garmentPurposes} />
      <EcoAwarenessSection ecoAwareness={recommendations.ecoAwareness} />
      <ReuseSection reuse={recommendations.reuse} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  list: {
    gap: 12,
  },
  purposeGrid: {
    gap: 12,
  },
  purposeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  purposeBox: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F0EDF8',
  },
  purposeBoxName: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.text,
    lineHeight: 20,
  },
  purposeBoxRating: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0EDF8',
  },
  bodyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.text,
  },
  tipsList: {
    gap: 8,
    marginTop: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.primary,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.text,
  },
  altBox: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EDF8',
    gap: 4,
  },
  altLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
  altValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.primary,
  },
  reuseLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
  },
});
