import { StyleSheet, Text, View } from 'react-native';

import { Info } from '@/components/ui/lucide-icons';
import { type BlendNoticeContent } from '@/data/scans/analysis';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type BlendNoticeProps = {
  notice: BlendNoticeContent;
};

export function BlendNotice({ notice }: BlendNoticeProps) {
  return (
    <View style={styles.notice}>
      <Info size={14} color={BrandColors.primary} strokeWidth={2.25} />
      <View style={styles.textBlock}>
        <Text style={styles.title}>{notice.title}</Text>
        <Text style={styles.body}>{notice.body}</Text>
        {notice.caution ? <Text style={styles.caution}>{notice.caution}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.primaryDark,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: BrandColors.textMuted,
  },
  caution: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    lineHeight: 16,
    color: '#92400e',
  },
});
