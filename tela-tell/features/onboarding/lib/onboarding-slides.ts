import type { FC } from 'react';

import {
  Camera,
  CircleCheck,
  Info,
  Layers,
  Leaf,
  ScanLine,
  Recycle,
  Search,
  Shield,
  ShieldAlert,
  Shirt,
  Sparkles,
  Square,
  Sun,
  Tag,
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
  icon: FC<IconProps>;
  title: string;
  body?: string;
  points?: OnboardingPoint[];
  footnote?: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: 'welcome',
    icon: ScanLine,
    title: 'Know your fabric before you buy it',
    body: 'TELA-TELL looks at a close-up photo of a fabric and tells you which fiber it most likely is. Made for ukay-ukay and tiangge shopping.',
  },
  {
    key: 'contents',
    icon: Sparkles,
    title: "What you'll find inside",
    points: [
      {
        icon: Leaf,
        title: 'Environmental research',
        text: 'See what lab studies found about each fiber, with their sources. The app does not score sustainability.',
      },
      {
        icon: Recycle,
        title: 'Eco tips',
        text: 'Reuse, resale and donation ideas, plus ways to reduce microplastic shedding.',
      },
      {
        icon: ShieldAlert,
        title: 'Health and safety',
        text: 'Microplastic-shedding risk and allergy alerts for the fibers you are sensitive to.',
      },
      {
        icon: Shirt,
        title: 'Other fabrics to consider',
        text: 'Fabric ideas for your next shop, with the evidence behind each one.',
      },
      {
        icon: Layers,
        title: 'Fiber profile',
        text: `How each of the ${SUPPORTED_FABRICS.length} fibers feels, wears and should be cared for.`,
      },
    ],
    footnote: 'Health notes are advisory only, not medical advice.',
  },
  {
    key: 'scan',
    icon: Camera,
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
    icon: Info,
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
    icon: Tag,
    title: 'Check the label',
    body: 'Add what the care tag or the seller claims. TELA-TELL compares it with your scan and flags a possible mislabel to double-check.',
    footnote: 'Treat it as a hint, not proof.',
  },
  {
    key: 'offline',
    icon: Shield,
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
