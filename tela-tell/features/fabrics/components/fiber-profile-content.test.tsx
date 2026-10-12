import type { ReactElement, ReactNode } from 'react';
import { Modal, Pressable, Text } from 'react-native';

import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import {
  FIBER_PROFILE_EDUCATION,
  PROFILE_CARE_REMINDER,
  PROFILE_IDENTIFICATION_REMINDER,
  PROFILE_PREDICTION_NOTICE,
  PROFILE_REFERENCE_CAPTION,
} from '@/data/fabrics/fiber-profile-education';
import { FIBER_PROFILES, getFiberProfile } from '@/data/fabrics/fiber-profiles';
import { FiberProfileContent } from './fiber-profile-content';

type TestInstance = {
  props: {
    children?: ReactNode;
    onPress?: () => void;
    onRequestClose?: () => void;
    visible?: boolean;
    testID?: string;
    stickyHeaderIndices?: number[];
    onLayout?: (event: { nativeEvent: { layout: { y: number; height: number } } }) => void;
    onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: { selected?: boolean };
  };
  findAll: (predicate: (item: TestInstance) => boolean) => TestInstance[];
  findAllByType: (type: unknown) => TestInstance[];
};
type TestRenderer = { root: TestInstance; unmount: () => void };
// jest-expo supplies the matching renderer; keep the same test API as existing component tests.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => void | Promise<void>) => Promise<void>;
  create: (element: ReactElement) => TestRenderer;
};

jest.mock('expo-image', () => ({ Image: 'ReferenceImage' }));
jest.mock('@/components/ui/lucide-icons', () => ({
  Camera: () => null,
  Layers: () => null,
  Shirt: () => null,
  Info: () => null,
  Tag: () => null,
  X: () => null,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 20, left: 0, right: 0 }),
}));

let renderer: TestRenderer | undefined;

function displayedText(): string[] {
  return renderer!.root.findAllByType(Text)
    .map((item) => item.props.children)
    .filter((value): value is string => typeof value === 'string');
}

function tabs() {
  // Pressable is memoized; locate its rendered tab props rather than the exported wrapper type.
  return renderer!.root.findAll((item) => item.props.accessibilityRole === 'tab' && typeof item.props.onPress === 'function');
}

async function openIdentificationLimits() {
  const info = renderer!.root.findAll((item) => item.props.accessibilityLabel === 'Identification limits' && typeof item.props.onPress === 'function')[0];
  if (!info) throw new Error('Missing identification limits (i)');
  await act(async () => info.props.onPress!());
}

async function selectTab(label: string) {
  const tab = tabs().find((item) => item.findAllByType(Text).some((child) => child.props.children === label));
  if (!tab) throw new Error(`Missing ${label} tab`);
  await act(async () => tab.props.onPress!());
}

afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
});

it.each(SUPPORTED_FABRICS)('opens %s on Look with photo and touch content, and identification limits behind an (i)', async (fabric) => {
  await act(async () => { renderer = create(<FiberProfileContent profile={getFiberProfile(fabric)} />); });
  const content = FIBER_PROFILE_EDUCATION[fabric];
  expect(tabs().map((item) => item.props.accessibilityState?.selected)).toEqual([false, true, false]);
  expect(displayedText()).toEqual(expect.arrayContaining([
    content.displayName, content.classification.text, content.about.origin.text,
    'In photos', content.look.photos.text, 'When handled', content.look.handling.text,
    'Similar appearances', PROFILE_REFERENCE_CAPTION,
  ]));
  expect(displayedText().join(' ')).not.toContain(PROFILE_IDENTIFICATION_REMINDER.text);
  await openIdentificationLimits();
  expect(displayedText().join(' ')).toContain(content.look.limitations.text);
  expect(displayedText().join(' ')).toContain(PROFILE_IDENTIFICATION_REMINDER.text);
  const comparisons = renderer!.root.findAll((item) => item.props.accessibilityLabel === content.look.similarAppearances.text);
  expect(comparisons.length).toBeGreaterThan(0);
  expect(comparisons.every((item) => !item.props.onPress)).toBe(true);
  expect(displayedText()).not.toContain(PROFILE_CARE_REMINDER.text);
  expect(displayedText()).not.toContain(PROFILE_PREDICTION_NOTICE);
  await selectTab('Care');
  for (const guidance of content.care) {
    expect(displayedText().join(' ')).toContain(guidance.text);
  }
});

it('switches tabs, keeps evidence out of the screen and leaves operational data unchanged', async () => {
  const before = JSON.parse(JSON.stringify(FIBER_PROFILES));
  const content = FIBER_PROFILE_EDUCATION.Spandex;
  await act(async () => { renderer = create(<FiberProfileContent profile={getFiberProfile('Spandex')} />); });
  await selectTab('About');
  expect(displayedText()).toContain(content.about.description.text);
  // Physical characteristics are no longer shown on the profile.
  for (const property of content.about.properties) {
    expect(displayedText()).not.toContain(property.text);
  }
  expect(displayedText()).not.toContain(PROFILE_IDENTIFICATION_REMINDER.text);
  await selectTab('Care');
  expect(displayedText()).toContain(PROFILE_CARE_REMINDER.text);
  for (const guidance of content.care) {
    expect(displayedText().join(' ')).toContain(guidance.text);
  }
  expect(displayedText().join(' ')).not.toMatch(/https?:\/\//);
  expect(displayedText()).not.toContain('Weather');
  expect(displayedText()).not.toContain('Occasion');
  await selectTab('Look');
  await openIdentificationLimits();
  expect(displayedText().join(' ')).toContain(PROFILE_IDENTIFICATION_REMINDER.text);
  expect(FIBER_PROFILES).toEqual(before);
});

it('opens and closes the full reference image with the close button and platform back action', async () => {
  await act(async () => { renderer = create(<FiberProfileContent profile={getFiberProfile('Wool')} />); });
  const enlarge = () => renderer!.root.findAll((item) => item.props.accessibilityLabel === 'Enlarge Wool reference image' && Boolean(item.props.onPress))[0];
  await act(async () => enlarge().props.onPress!());
  expect(renderer!.root.findAllByType(Modal)[0].props.visible).toBe(true);
  expect(renderer!.root.findAllByType('ReferenceImage')).toHaveLength(2);
  const close = renderer!.root.findAll((item) => item.props.accessibilityLabel === 'Close reference image' && Boolean(item.props.onPress))[0];
  await act(async () => close.props.onPress!());
  expect(renderer!.root.findAllByType(Modal)[0].props.visible).toBe(false);
  await act(async () => enlarge().props.onPress!());
  await act(async () => renderer!.root.findAllByType(Modal)[0].props.onRequestClose!());
  expect(renderer!.root.findAllByType(Modal)[0].props.visible).toBe(false);
  expect(renderer!.root.findAllByType('ReferenceImage')).toHaveLength(1);
});

it('keeps a scan comparison in the profile scroll and lets its reference open the same viewer', async () => {
  await act(async () => {
    renderer = create(<FiberProfileContent
      profile={getFiberProfile('Cotton')}
      showHero={false}
      predicted
      headerContent={(openReference) => (
        <Pressable accessibilityLabel="Scan comparison reference" onPress={openReference}>
          <Text>Scan comparison</Text>
        </Pressable>
      )}
    />);
  });
  expect(displayedText()).toContain('Scan comparison');
  const open = renderer!.root.findAll((item) => item.props.accessibilityLabel === 'Scan comparison reference' && Boolean(item.props.onPress))[0];
  await act(async () => open.props.onPress!());
  expect(renderer!.root.findAllByType(Modal)[0].props.visible).toBe(true);
  expect(renderer!.root.findAllByType('ReferenceImage')).toHaveLength(1);
});

it('makes tabs a direct sticky scroll child and reports the identity visibility only when it changes', async () => {
  const onHiddenChange = jest.fn();
  await act(async () => { renderer = create(<FiberProfileContent profile={getFiberProfile('Wool')} onIdentityHiddenChange={onHiddenChange} />); });
  const scroll = renderer!.root.findAll((item) => item.props.testID === 'fiber-profile-scroll')[0];
  const identity = renderer!.root.findAll((item) => item.props.testID === 'fiber-profile-identity')[0];
  expect(scroll.props.stickyHeaderIndices).toEqual([1]);
  await act(async () => identity.props.onLayout!({ nativeEvent: { layout: { y: 0, height: 220 } } }));
  expect(onHiddenChange).toHaveBeenLastCalledWith(false);
  await act(async () => scroll.props.onScroll!({ nativeEvent: { contentOffset: { y: 240 } } }));
  expect(onHiddenChange).toHaveBeenLastCalledWith(true);
  await act(async () => scroll.props.onScroll!({ nativeEvent: { contentOffset: { y: 260 } } }));
  expect(onHiddenChange).toHaveBeenCalledTimes(2);
  await selectTab('Care');
  expect(displayedText()).toContain(PROFILE_CARE_REMINDER.text);
  await act(async () => scroll.props.onScroll!({ nativeEvent: { contentOffset: { y: 0 } } }));
  expect(onHiddenChange).toHaveBeenLastCalledWith(false);
});

it('marks scan-linked summaries as predicted without requiring a second reference image', async () => {
  await act(async () => {
    renderer = create(<FiberProfileContent profile={getFiberProfile('Rayon')} showHero={false} predicted />);
  });
  expect(displayedText()).toContain(PROFILE_PREDICTION_NOTICE);
  expect(renderer!.root.findAllByType('ReferenceImage')).toHaveLength(0);
  await selectTab('About');
  expect(displayedText()).toContain(FIBER_PROFILE_EDUCATION.Rayon.about.description.text);
});
