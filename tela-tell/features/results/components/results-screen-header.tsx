import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bookmark, ChevronLeft, Trash2 } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const DELETE_RED = '#DC2626';
const BOOKMARK_ACTIVE = '#EAB308';
const BOOKMARK_IDLE = BrandColors.primary;

type ResultsScreenHeaderProps = {
  title: string;
  onBack: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  isFavorite?: boolean;
  actionsDisabled?: boolean;
  rightSlot?: ReactNode;
  compact?: boolean;
};

export function ResultsScreenHeader({
  title,
  onBack,
  onToggleFavorite,
  onDelete,
  isFavorite = false,
  actionsDisabled = false,
  rightSlot,
  compact = false,
}: ResultsScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const showBuiltInActions = Boolean(onToggleFavorite || onDelete);

  return (
    <View
      style={[
        styles.header,
        compact && styles.headerCompact,
        { paddingTop: insets.top + (compact ? 4 : 8) },
      ]}>
      <View style={styles.row}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={24} color={BrandColors.primary} strokeWidth={2.5} />
          <Text style={[styles.headerTitle, compact && styles.headerTitleCompact]} numberOfLines={1}>
            {title}
          </Text>
        </Pressable>

        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}

        {!rightSlot && showBuiltInActions ? (
          <View style={styles.actions}>
            {onToggleFavorite ? (
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                onPress={onToggleFavorite}
                disabled={actionsDisabled}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                accessibilityState={{ selected: isFavorite }}>
                <Bookmark
                  size={22}
                  color={isFavorite ? BOOKMARK_ACTIVE : BOOKMARK_IDLE}
                  strokeWidth={2.25}
                  fill={isFavorite ? BOOKMARK_ACTIVE : 'transparent'}
                />
              </Pressable>
            ) : null}

            {onDelete ? (
              <Pressable
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                onPress={onDelete}
                disabled={actionsDisabled}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Delete scan">
                <Trash2 size={22} color={DELETE_RED} strokeWidth={2.25} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  headerCompact: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.primary,
    flexShrink: 1,
  },
  headerTitleCompact: {
    fontSize: 18,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
