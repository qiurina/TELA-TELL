import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, type ReactElement } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Bookmark, Check } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { RecentScanPreview } from '@/data/scans/mock-data';

const COLUMNS = 3;
const GAP = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL = Math.floor((SCREEN_WIDTH - GAP * (COLUMNS - 1)) / COLUMNS);

type ScanGalleryGridProps = {
  scans: RecentScanPreview[];
  selectedIds: Set<string>;
  selectionMode: boolean;
  onPressItem: (scan: RecentScanPreview) => void;
  onLongPressItem?: (scan: RecentScanPreview) => void;
  showFavoriteBadge?: boolean;
  showDaysRemaining?: boolean;
  emptyTitle: string;
  emptyMessage: string;
  ListHeaderComponent?: ReactElement | null;
};

export function ScanGalleryGrid({
  scans,
  selectedIds,
  selectionMode,
  onPressItem,
  onLongPressItem,
  showFavoriteBadge = false,
  showDaysRemaining = false,
  emptyTitle,
  emptyMessage,
  ListHeaderComponent,
}: ScanGalleryGridProps) {
  const data = useMemo(() => scans, [scans]);

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        {ListHeaderComponent}
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={COLUMNS}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const selected = selectedIds.has(item.id);
        const showBottomVignette = showFavoriteBadge || showDaysRemaining;
        return (
          <Pressable
            style={styles.cell}
            onPress={() => onPressItem(item)}
            onLongPress={onLongPressItem ? () => onLongPressItem(item) : undefined}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={item.primaryFabric}>
            <Image source={item.image} style={styles.image} contentFit="cover" />
            {showBottomVignette ? (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.55)']}
                style={styles.bottomVignette}
                pointerEvents="none"
              />
            ) : null}
            {selected || selectionMode ? (
              <View style={[styles.checkWrap, selected && styles.checkWrapSelected]}>
                {selected ? (
                  <Check size={14} color={BrandColors.white} strokeWidth={3} />
                ) : null}
              </View>
            ) : null}
            {showFavoriteBadge && item.isFavorite ? (
              <View style={styles.bookmarkBadge}>
                <Bookmark
                  size={13}
                  color={BrandColors.white}
                  strokeWidth={2.5}
                  fill={BrandColors.white}
                />
              </View>
            ) : null}
            {showDaysRemaining && item.daysRemaining !== undefined ? (
              <View style={styles.daysBadge}>
                <Text style={styles.daysText}>{item.daysRemaining}d</Text>
              </View>
            ) : null}
            {selected ? <View style={styles.selectedScrim} /> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    backgroundColor: BrandColors.lavenderCard,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    zIndex: 1,
  },
  selectedScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 122, 148, 0.28)',
    zIndex: 1,
  },
  checkWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BrandColors.white,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  checkWrapSelected: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  bookmarkBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    zIndex: 2,
  },
  daysBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  daysText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: BrandColors.white,
  },
  empty: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: BrandColors.text,
    textAlign: 'center',
  },
  emptyMessage: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
});
