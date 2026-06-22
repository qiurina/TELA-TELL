import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';

type ConnectionStatus = 'online' | 'offline';

type DeviceStatusCardProps = {
  deviceName?: string;
  status?: ConnectionStatus;
};

const STATUS_STYLES: Record<
  ConnectionStatus,
  { backgroundColor: string; borderColor: string; dotColor: string }
> = {
  online: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
    dotColor: '#22C55E',
  },
  offline: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    dotColor: '#EF4444',
  },
};

export function DeviceStatusCard({
  deviceName = 'TELA-TELL Scanner',
  status = 'online',
}: DeviceStatusCardProps) {
  const statusStyle = STATUS_STYLES[status];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.card,
          faintCardShadow(),
          {
            backgroundColor: statusStyle.backgroundColor,
            borderColor: statusStyle.borderColor,
          },
        ]}>
        <Text style={styles.deviceName}>{deviceName}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusStyle.dotColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  deviceName: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
