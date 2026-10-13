import type { FC } from 'react';
import type { ImageSourcePropType } from 'react-native';

import {
  Camera,
  CircleCheck,
  Layers,
  ScanLine,
  Recycle,
  Search,
  Shield,
  ShieldAlert,
  Square,
  Sun,
  TriangleAlert,
  Wifi,
  type IconProps,
} from '@/components/ui/lucide-icons';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';

export type OnboardingPoint = {
  icon: FC<IconProps>;
  title: string;
  text: string;
};

export type OnboardingSlide = {
  key: string;
  image: ImageSourcePropType;
  title: string;
  body?: string;
  points?: OnboardingPoint[];
  footnote?: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: 'welcome',
    image: require('@/assets/images/knowfabric.png'),
    title: 'Know your fabric before you buy it',
    body: 'TELA-TELL looks at a close-up photo of a fabric and tells you which fiber it most likely is. Made for ukay-ukay and tiangge shopping.',
  },
  {
    key: 'contents',
    image: require('@/assets/images/findinside.png'),
    title: "What you'll find inside",
    points: [
      {
        icon: ShieldAlert,
        title: 'Health risk advisory',
        text: "Estimated fiber shedding for synthetic fibers, what it means for health (WHO 2022), and reminders for fibers you're sensitive to.",
      },
      {
        icon: Recycle,
        title: 'Eco tips',
        text: 'Ways to reduce shedding, a better-fit fabric to consider, and reuse ideas.',
      },
      {
        icon: Layers,
        title: 'Fiber profile',
        text: `What each of the ${SUPPORTED_FABRICS.length} fibers is, how it looks in photos, and how to care for it.`,
      },
    ],
    footnote: 'Health notes are advisory only, not medical advice.',
  },
  {
    key: 'scan',
    image: require('@/assets/images/howtoscan.png'),
    title: 'How to scan',
    points: [
      {
        icon: ScanLine,
        title: 'Get close',
        text: 'You should be able to see the individual threads.',
      },
      {
        icon: Square,
        title: 'Fill the frame',
        text: 'Fill the square with fabric only: no hands, no background.',
      },
      {
        icon: Sun,
        title: 'Good light, hold steady',
        text: 'Use the fill-light button in dim stalls and keep the phone still.',
      },
      {
        icon: Search,
        title: 'Macro lens helps',
        text: 'A clip-on macro lens gives the most accurate results.',
      },
    ],
  },
  {
    key: 'results',
    image: require('@/assets/images/recordresult.png'),
    title: 'Reading your result',
    points: [
      {
        icon: CircleCheck,
        title: 'Top 3 matches',
        text: 'You get the three most likely fibers, each with a confidence percentage.',
      },
      {
        icon: TriangleAlert,
        title: 'Not a lab test',
        text: "The percentages are the model's visual confidence, not measured fiber content.",
      },
      {
        icon: Camera,
        title: 'Low confidence?',
        text: 'Move closer and scan again.',
      },
    ],
  },
  {
    key: 'label',
    image: require('@/assets/images/checklabel.png'),
    title: 'Check the label',
    body: 'Add what the care tag or the seller claims. TELA-TELL compares it with your scan and flags when the label may not match, so you can double-check.',
    footnote: 'Treat it as a hint, not proof.',
  },
  {
    key: 'offline',
    image: require('@/assets/images/scananywhere.png'),
    title: 'Scan anywhere, even with no signal',
    body: 'Shop with confidence, wherever the bargains are.',
    points: [
      {
        icon: Wifi,
        title: 'Works with zero signal',
        text: 'No data, no Wi-Fi, no problem. Point your camera, tap, and find out what a fabric is right at the stall.',
      },
      {
        icon: Shield,
        title: 'Yours alone',
        text: 'Your scans and preferences stay on your phone. No account, no sign-up.',
      },
    ],
  },
];
