import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Calendar } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { ScanDateFilter } from '@/features/history/lib/scan-date-filters';

const FILTER_OPTIONS: { value: Exclude<ScanDateFilter, 'custom'>; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
];

type ScanHistoryFiltersProps = {
  selected: ScanDateFilter;
  customDate: Date | null;
  onSelect: (filter: ScanDateFilter) => void;
  onCustomDateChange: (date: Date) => void;
};

function formatCustomDateLabel(date: Date | null) {
  if (!date) {
    return 'Pick date';
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ScanHistoryFilters({
  selected,
  customDate,
  onSelect,
  onCustomDateChange,
}: ScanHistoryFiltersProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android' || event.type === 'set') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed' || !date) {
      return;
    }

    onCustomDateChange(date);
    onSelect('custom');
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}>
        {FILTER_OPTIONS.map(({ value, label }) => {
          const isSelected = selected === value;

          return (
            <Pressable
              key={value}
              onPress={() => onSelect(value)}
              style={({ pressed }) => [
                styles.filterPill,
                isSelected ? styles.filterPillActive : styles.filterPillInactive,
                pressed && styles.filterPillPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}>
              <Text
                style={[
                  styles.filterPillText,
                  isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => {
            onSelect('custom');
            setShowPicker(true);
          }}
          style={({ pressed }) => [
            styles.filterPill,
            styles.filterPillIcon,
            selected === 'custom' ? styles.filterPillActive : styles.filterPillInactive,
            pressed && styles.filterPillPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={formatCustomDateLabel(customDate)}
          accessibilityState={{ selected: selected === 'custom' }}>
          <Calendar
            size={14}
            color={selected === 'custom' ? BrandColors.white : BrandColors.textMuted}
            strokeWidth={2}
          />
        </Pressable>
      </ScrollView>

      {showPicker && Platform.OS !== 'web' ? (
        <DateTimePicker
          value={customDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={handleDateChange}
          style={styles.datePicker}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    alignSelf: 'center',
    flexShrink: 0,
  },
  filterPillIcon: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: BrandColors.border,
  },
  filterPillActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  filterPillPressed: {
    opacity: 0.85,
  },
  filterPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  filterPillTextInactive: {
    color: BrandColors.textMuted,
  },
  filterPillTextActive: {
    color: BrandColors.white,
  },
  datePicker: {
    marginTop: 8,
  },
});
