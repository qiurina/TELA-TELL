import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type ConnectionType = 'wifi' | 'bluetooth';
type ConnectionStatus = 'ready' | 'connecting' | 'offline';

type DeviceStatusCardProps = {
  deviceName?: string;
  connectionType?: ConnectionType;
  status?: ConnectionStatus;
};

const DOT_COLORS: Record<ConnectionStatus, string> = {
  ready: '#16a34a',
  connecting: '#ca8a04',
  offline: '#dc2626',
};

function getStatusLabel(status: ConnectionStatus): string {
  if (status === 'offline') {
    return 'Scanner not connected';
  }
  if (status === 'connecting') {
    return 'Connecting...';
  }
  return 'Ready to scan';
}

export function DeviceStatusCard({
  deviceName = 'TELA-TELL Scanner',
  connectionType = 'wifi',
  status = 'ready',
}: DeviceStatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.deviceName}>{deviceName}</Text>
        <View style={[styles.statusDot, { backgroundColor: DOT_COLORS[status] }]} />
      </View>
      <Text style={styles.connectionLabel}>{getStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 20,
    padding: 16,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E0DBF0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.text,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
});
