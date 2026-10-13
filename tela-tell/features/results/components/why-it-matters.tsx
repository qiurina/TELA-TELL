import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Disclosure } from '@/components/ui/disclosure';
import { Droplets, Info, Shield, Wind, type IconProps } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { Type } from '@/constants/typography';
import { WHY_IT_MATTERS_TITLE, getWhyItMatters, type WhyItMattersLine } from '@/data/fabrics/health-advisory';

const ROW_ICON: Record<WhyItMattersLine['key'], FC<IconProps>> = {
  where: Droplets,
  people: Wind,
  known: Shield,
  limit: Info,
};

export function WhyItMatters({ fiber, defaultOpen = false }: { fiber: string; defaultOpen?: boolean }) {
  return (
    <View style={styles.block}>
      <View style={styles.divider} />
      <Disclosure title={WHY_IT_MATTERS_TITLE} defaultOpen={defaultOpen}>
        {getWhyItMatters(fiber).map((line) => {
          const Icon = ROW_ICON[line.key];
          const isLimit = line.key === 'limit';
          return (
            <View key={line.key} style={styles.row}>
              <View style={[styles.iconTile, isLimit && styles.iconTileMuted]}>
                <Icon size={15} color={isLimit ? BrandColors.textMuted : BrandColors.primaryDark} strokeWidth={2.25} />
              </View>
              <View style={styles.rowBody}>
                {isLimit ? null : <Text style={styles.label}>{line.label}</Text>}
                <Text style={isLimit ? Type.secondary : Type.body}>{line.text}</Text>
              </View>
            </View>
          );
        })}
      </Disclosure>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 10,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BrandColors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  iconTileMuted: {
    backgroundColor: BrandColors.inputBackground,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.text,
  },
});
