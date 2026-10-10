import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeft, ChevronRight } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type ScanPagerProps = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export function ScanPager({ page, totalPages, onPrev, onNext }: ScanPagerProps) {
  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <View style={styles.pager}>
      <Pressable
        onPress={onPrev}
        disabled={atStart}
        style={({ pressed }) => [
          styles.pagerButton,
          atStart && styles.pagerButtonDisabled,
          pressed && !atStart && styles.pagerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        accessibilityState={{ disabled: atStart }}>
        <ChevronLeft
          size={18}
          color={atStart ? BrandColors.textMuted : BrandColors.primaryDark}
          strokeWidth={2.25}
        />
        <Text style={[styles.pagerButtonText, atStart && styles.pagerButtonTextDisabled]}>Prev</Text>
      </Pressable>

      <Text style={styles.pagerLabel}>
        Page {page} of {totalPages}
      </Text>

      <Pressable
        onPress={onNext}
        disabled={atEnd}
        style={({ pressed }) => [
          styles.pagerButton,
          atEnd && styles.pagerButtonDisabled,
          pressed && !atEnd && styles.pagerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Next page"
        accessibilityState={{ disabled: atEnd }}>
        <Text style={[styles.pagerButtonText, atEnd && styles.pagerButtonTextDisabled]}>Next</Text>
        <ChevronRight
          size={18}
          color={atEnd ? BrandColors.textMuted : BrandColors.primaryDark}
          strokeWidth={2.25}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  pagerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: BrandColors.lavender,
    borderWidth: 1,
    borderColor: BrandColors.border,
    minWidth: 84,
    justifyContent: 'center',
  },
  pagerButtonDisabled: {
    backgroundColor: BrandColors.white,
    borderColor: BrandColors.borderLight,
  },
  pagerPressed: {
    opacity: 0.85,
  },
  pagerButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.primaryDark,
  },
  pagerButtonTextDisabled: {
    color: BrandColors.textMuted,
  },
  pagerLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
});
