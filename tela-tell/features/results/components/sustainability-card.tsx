import { Text } from 'react-native';

import { CardLink } from '@/components/ui/card-link';
import { Leaf } from '@/components/ui/lucide-icons';
import { StatusCard } from '@/components/ui/status-card';
import { Type } from '@/constants/typography';
import { ECO_GUIDE } from '@/data/fabrics/eco-guide';
import type { SupportedFabric } from '@/data/fabrics/fabrics';

/**
 * Scan results' short Sustainability card, for the predicted fiber: one way to keep this item in
 * use (the eco guide's per-fiber reuse row) and a button to Eco tips, which holds the alternatives
 * and the reuse research ("Why reuse helps"). It gives no score or rating: no source rates a single
 * garment's sustainability.
 */
export function SustainabilityCard({ fiber, onEcoTips }: { fiber: SupportedFabric; onEcoTips: () => void }) {
  const subject = fiber === 'Spandex' ? 'clothes with spandex' : fiber.toLowerCase();

  return (
    <StatusCard icon={Leaf} tone="good" title={`Sustainable choices for ${subject}`}>
      <Text style={Type.body}>
        <Text style={Type.lead}>Keep it in use: </Text>
        {ECO_GUIDE[fiber].reuse}
      </Text>
      <CardLink icon={Leaf} label="More sustainable choices" onPress={onEcoTips} />
    </StatusCard>
  );
}
