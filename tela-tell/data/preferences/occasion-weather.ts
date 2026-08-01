export type DressingContext =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'thunderstorms'
  | 'windy'
  | 'foggy'
  | 'cool'
  | 'casual'
  | 'office_work'
  | 'school'
  | 'formal'
  | 'wedding'
  | 'party'
  | 'sports_gym'
  | 'beach'
  | 'travel'
  | 'outdoor_activities'
  | 'home_wear'
  | 'sleepwear';

export type FabricRecommendation = {
  fabric: string;
  reason: string;
};

export type OccasionWeatherGuide = {
  id: DressingContext;
  label: string;
  bestChoices: FabricRecommendation[];
  avoid: FabricRecommendation[];
};

export type DressingContextCategory = 'weather' | 'occasion';

export type DressingContextOption = {
  id: DressingContext;
  label: string;
  category: DressingContextCategory;
};

export const WEATHER_CONTEXT_OPTIONS: DressingContextOption[] = [
  { id: 'sunny', label: 'Sunny', category: 'weather' },
  { id: 'partly_cloudy', label: 'Partly cloudy', category: 'weather' },
  { id: 'cloudy', label: 'Cloudy', category: 'weather' },
  { id: 'rainy', label: 'Rainy', category: 'weather' },
  { id: 'thunderstorms', label: 'Thunderstorms', category: 'weather' },
  { id: 'windy', label: 'Windy', category: 'weather' },
  { id: 'foggy', label: 'Foggy', category: 'weather' },
  { id: 'cool', label: 'Cool', category: 'weather' },
];

export type WeatherContext = (typeof WEATHER_CONTEXT_OPTIONS)[number]['id'];
export type OccasionContext = (typeof OCCASION_CONTEXT_OPTIONS)[number]['id'];

export const OCCASION_CONTEXT_OPTIONS: DressingContextOption[] = [
  { id: 'casual', label: 'Casual', category: 'occasion' },
  { id: 'office_work', label: 'Office / Work', category: 'occasion' },
  { id: 'school', label: 'School', category: 'occasion' },
  { id: 'formal', label: 'Formal Event', category: 'occasion' },
  { id: 'wedding', label: 'Wedding', category: 'occasion' },
  { id: 'party', label: 'Party', category: 'occasion' },
  { id: 'sports_gym', label: 'Sports / Gym', category: 'occasion' },
  { id: 'beach', label: 'Beach', category: 'occasion' },
  { id: 'travel', label: 'Travel', category: 'occasion' },
  { id: 'outdoor_activities', label: 'Outdoor Activities', category: 'occasion' },
  { id: 'home_wear', label: 'Home Wear', category: 'occasion' },
  { id: 'sleepwear', label: 'Sleepwear', category: 'occasion' },
];

export const DRESSING_CONTEXT_OPTIONS: DressingContextOption[] = [
  ...WEATHER_CONTEXT_OPTIONS,
  ...OCCASION_CONTEXT_OPTIONS,
];

export const OCCASION_WEATHER_GUIDES: Record<DressingContext, OccasionWeatherGuide> = {
  sunny: {
    id: 'sunny',
    label: 'Sunny',
    bestChoices: [
      { fabric: 'Linen', reason: 'Most breathable. Stays cool under direct sun' },
      { fabric: 'Cotton', reason: 'Absorbs sweat and feels light in heat' },
      { fabric: 'Rayon', reason: 'Flows well and dries quickly in warm air' },
    ],
    avoid: [
      { fabric: 'Polyester', reason: 'Traps heat and sweat in bright sun' },
      { fabric: 'Nylon', reason: 'Not breathable for hot outdoor wear' },
      { fabric: 'Acrylic', reason: 'Can feel warm and sticky' },
    ],
  },
  partly_cloudy: {
    id: 'partly_cloudy',
    label: 'Partly cloudy',
    bestChoices: [
      { fabric: 'Cotton', reason: 'Comfortable when sun and shade alternate' },
      { fabric: 'Linen', reason: 'Breathable for warm but not extreme heat' },
      { fabric: 'Cotton blends', reason: 'Less wrinkling with good everyday comfort' },
    ],
    avoid: [
      { fabric: 'Heavy wool', reason: 'Too warm for mild tropical days' },
      { fabric: 'Thick acrylic', reason: 'Can overheat when the sun breaks through' },
      { fabric: 'Rubberized nylon', reason: 'Too sealed for changing conditions' },
    ],
  },
  cloudy: {
    id: 'cloudy',
    label: 'Cloudy',
    bestChoices: [
      { fabric: 'Cotton blends', reason: 'Balanced comfort for cooler overcast days' },
      { fabric: 'Rayon', reason: 'Light drape without heavy insulation' },
      { fabric: 'Light wool blends', reason: 'Adds warmth when the sun is hidden' },
    ],
    avoid: [
      { fabric: 'Sheer linen', reason: 'May feel too cool and breezy alone' },
      { fabric: 'Open-weave abaca', reason: 'Better for hot sun than grey skies' },
      { fabric: 'Thin polyester', reason: 'Can feel clammy in humid cloud cover' },
    ],
  },
  rainy: {
    id: 'rainy',
    label: 'Rainy',
    bestChoices: [
      { fabric: 'Polyester blends', reason: 'Dries faster than pure cotton during habagat rains' },
      { fabric: 'Nylon', reason: 'Repels light moisture when used as outer layers' },
      { fabric: 'Quick-dry cotton blends', reason: 'Balance comfort with faster drying time' },
    ],
    avoid: [
      { fabric: 'Pure linen', reason: 'Absorbs water and dries slowly' },
      { fabric: 'Silk', reason: 'Water spots and stains easily' },
      { fabric: 'Wool', reason: 'Takes a long time to dry after getting soaked' },
    ],
  },
  thunderstorms: {
    id: 'thunderstorms',
    label: 'Thunderstorms',
    bestChoices: [
      { fabric: 'Nylon', reason: 'Sheds heavy rain when used as a shell layer' },
      { fabric: 'Polyester blends', reason: 'Quick-drying after sudden downpours' },
      { fabric: 'Synthetic fleece layers', reason: 'Stay warm when wet if layered properly' },
    ],
    avoid: [
      { fabric: 'Cotton', reason: 'Soaks up water and stays damp for hours' },
      { fabric: 'Silk', reason: 'Damaged easily by heavy rain and humidity' },
      { fabric: 'Linen', reason: 'Absorbs water and stays heavy when wet' },
    ],
  },
  windy: {
    id: 'windy',
    label: 'Windy',
    bestChoices: [
      { fabric: 'Dense cotton', reason: 'Holds shape and blocks gusts better than sheer fabrics' },
      { fabric: 'Wool blends', reason: 'Structured layers that stay put in wind' },
      { fabric: 'Twill cotton', reason: 'Heavier weave resists flapping and chill' },
    ],
    avoid: [
      { fabric: 'Loose rayon', reason: 'Blows and clings uncomfortably in wind' },
      { fabric: 'Sheer chiffon', reason: 'Offers little protection from cold gusts' },
      { fabric: 'Light linen', reason: 'Can feel too breezy and expose skin' },
    ],
  },
  foggy: {
    id: 'foggy',
    label: 'Foggy',
    bestChoices: [
      { fabric: 'Cotton', reason: 'Comfortable in cool, damp air' },
      { fabric: 'Light wool blends', reason: 'Adds warmth without heavy bulk in mist' },
      { fabric: 'Moisture-wicking polyester', reason: 'Manages dampness on humid foggy mornings' },
    ],
    avoid: [
      { fabric: 'Heavy denim', reason: 'Stays cold and heavy when damp' },
      { fabric: 'Absorbent linen', reason: 'Holds moisture from foggy air' },
      { fabric: 'Silk', reason: 'Spots and feels chilly when humid' },
    ],
  },
  cool: {
    id: 'cool',
    label: 'Cool',
    bestChoices: [
      { fabric: 'Wool', reason: 'Natural insulation for Baguio-style cool climates' },
      { fabric: 'Acrylic blends', reason: 'Light warmth for cool evenings' },
      { fabric: 'Cotton flannel', reason: 'Soft layer for mild cool weather' },
    ],
    avoid: [
      { fabric: 'Sheer linen', reason: 'Too breezy when temperatures drop' },
      { fabric: 'Thin rayon', reason: 'Offers little warmth in cool air' },
      { fabric: 'Open-weave abaca', reason: 'Better suited to hot tropical days' },
    ],
  },
  casual: {
    id: 'casual',
    label: 'Casual',
    bestChoices: [
      { fabric: 'Cotton', reason: 'Soft, easy to wash, and comfortable for everyday ukay finds' },
      { fabric: 'Linen', reason: 'Breathable and relaxed for daily errands' },
      { fabric: 'Rayon', reason: 'Light drape for casual tops and dresses' },
    ],
    avoid: [
      { fabric: 'Wool', reason: 'Often too warm for everyday tropical wear' },
      { fabric: 'Silk', reason: 'Delicate and better saved for dressier pieces' },
      { fabric: 'Thick acrylic', reason: 'Can feel scratchy for all-day casual use' },
    ],
  },
  office_work: {
    id: 'office_work',
    label: 'Office / Work',
    bestChoices: [
      { fabric: 'Cotton blends', reason: 'Neat look with less wrinkling on commutes' },
      { fabric: 'Rayon', reason: 'Professional drape for blouses and trousers' },
      { fabric: 'Wool blends', reason: 'Structured layers for air-conditioned offices' },
    ],
    avoid: [
      { fabric: 'Pure linen', reason: 'Wrinkles quickly during long commutes' },
      { fabric: 'Heavy acrylic', reason: 'Can look fuzzy and less polished' },
      { fabric: 'Rough abaca', reason: 'Too casual or textured for most office dress codes' },
    ],
  },
  school: {
    id: 'school',
    label: 'School',
    bestChoices: [
      { fabric: 'Cotton', reason: 'Durable, washable, and comfortable for daily classes' },
      { fabric: 'Cotton-poly blends', reason: 'Less ironing for uniforms and PE alternates' },
      { fabric: 'Rayon', reason: 'Light option for school blouses in warm classrooms' },
    ],
    avoid: [
      { fabric: 'Silk', reason: 'Too delicate for active school days' },
      { fabric: 'Wool', reason: 'Often too warm for Philippine school climates' },
      { fabric: 'Leather', reason: 'Too heavy and formal for everyday school wear' },
    ],
  },
  formal: {
    id: 'formal',
    label: 'Formal Event',
    bestChoices: [
      { fabric: 'Silk', reason: 'Smooth drape and polished look for dressy occasions' },
      { fabric: 'Abaca', reason: 'Structured Philippine fiber for tropical formal wear' },
      { fabric: 'Linen', reason: 'Breathable polish for tropical formal events' },
    ],
    avoid: [
      { fabric: 'Acrylic', reason: 'Can look inexpensive and pill under formal lighting' },
      { fabric: 'Nylon', reason: 'Too sporty for dress codes' },
      { fabric: 'Heavy polyester', reason: 'May look stiff and trap heat indoors' },
    ],
  },
  wedding: {
    id: 'wedding',
    label: 'Wedding',
    bestChoices: [
      { fabric: 'Abaca', reason: 'Heritage Philippine fiber for celebration barong details' },
      { fabric: 'Silk', reason: 'Luxurious drape for dresses and formal separates' },
      { fabric: 'Linen', reason: 'Breathable formal option for tropical wedding venues' },
    ],
    avoid: [
      { fabric: 'Nylon', reason: 'Too athletic for celebration dress codes' },
      { fabric: 'Acrylic', reason: 'Can look shiny or cheap in event photos' },
      { fabric: 'Heavy polyester', reason: 'May feel uncomfortable during long receptions' },
    ],
  },
  party: {
    id: 'party',
    label: 'Party',
    bestChoices: [
      { fabric: 'Silk', reason: 'Elegant sheen for evening celebrations' },
      { fabric: 'Rayon', reason: 'Flows well for dresses and dressy separates' },
      { fabric: 'Polyester blends', reason: 'Holds shape and resists wrinkles through the night' },
    ],
    avoid: [
      { fabric: 'Heavy cotton', reason: 'Can look too casual for party dress codes' },
      { fabric: 'Rough abaca', reason: 'Too rustic for most party settings' },
      { fabric: 'Wool', reason: 'Often too warm for indoor Philippine parties' },
    ],
  },
  sports_gym: {
    id: 'sports_gym',
    label: 'Sports / Gym',
    bestChoices: [
      { fabric: 'Nylon', reason: 'Lightweight and dries fast during workouts' },
      { fabric: 'Polyester', reason: 'Wicks sweat and holds shape during activity' },
      { fabric: 'Spandex blends', reason: 'Stretch and recovery for movement' },
    ],
    avoid: [
      { fabric: 'Cotton', reason: 'Holds sweat and feels heavy when wet' },
      { fabric: 'Silk', reason: 'Not durable or breathable enough for exercise' },
      { fabric: 'Wool', reason: 'Too hot and slow-drying for gym wear' },
    ],
  },
  beach: {
    id: 'beach',
    label: 'Beach',
    bestChoices: [
      { fabric: 'Linen', reason: 'Breathable cover-up fabric for resort heat' },
      { fabric: 'Cotton', reason: 'Comfortable over swimwear and easy to layer' },
      { fabric: 'Abaca', reason: 'Light native fiber suited to tropical resort wear' },
    ],
    avoid: [
      { fabric: 'Wool', reason: 'Too heavy and warm near the water' },
      { fabric: 'Silk', reason: 'Damaged easily by salt, sun, and chlorine' },
      { fabric: 'Acrylic', reason: 'Can feel hot and sticky in humid beach air' },
    ],
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    bestChoices: [
      { fabric: 'Cotton-poly blends', reason: 'Wrinkle-resistant for packing and long trips' },
      { fabric: 'Nylon', reason: 'Durable and light for bags and outer layers' },
      { fabric: 'Merino or wool blends', reason: 'Versatile layering across changing climates' },
    ],
    avoid: [
      { fabric: 'Pure linen', reason: 'Wrinkles heavily in luggage' },
      { fabric: 'Delicate silk', reason: 'Snags and stains easily on the road' },
      { fabric: 'Heavy denim', reason: 'Bulky and slow to dry while traveling' },
    ],
  },
  outdoor_activities: {
    id: 'outdoor_activities',
    label: 'Outdoor Activities',
    bestChoices: [
      { fabric: 'Nylon', reason: 'Durable and quick-drying for hikes and trails' },
      { fabric: 'Cotton', reason: 'Comfortable for light outdoor errands' },
      { fabric: 'Abaca', reason: 'Tough native fiber for rustic outdoor wear' },
    ],
    avoid: [
      { fabric: 'Silk', reason: 'Too delicate for dirt, sun, and abrasion' },
      { fabric: 'Leather', reason: 'Too stiff and heavy for active outdoor use' },
      { fabric: 'Heavy wool', reason: 'Too warm for most Philippine outdoor activity' },
    ],
  },
  home_wear: {
    id: 'home_wear',
    label: 'Home Wear',
    bestChoices: [
      { fabric: 'Cotton', reason: 'Soft and breathable for lounging at home' },
      { fabric: 'Jersey cotton', reason: 'Stretchy comfort for relaxed indoor wear' },
      { fabric: 'Rayon', reason: 'Light and smooth for house dresses and tops' },
    ],
    avoid: [
      { fabric: 'Structured wool', reason: 'Too stiff and warm for lounging' },
      { fabric: 'Leather', reason: 'Too stiff and formal for daily home use' },
      { fabric: 'Scratchy acrylic', reason: 'Uncomfortable against skin for long wear' },
    ],
  },
  sleepwear: {
    id: 'sleepwear',
    label: 'Sleepwear',
    bestChoices: [
      { fabric: 'Cotton', reason: 'Breathable and gentle on skin overnight' },
      { fabric: 'Rayon', reason: 'Smooth drape for pajamas and nightdresses' },
      { fabric: 'Modal blends', reason: 'Soft, cool feel for tropical nights' },
    ],
    avoid: [
      { fabric: 'Polyester', reason: 'Can trap heat and feel less breathable at night' },
      { fabric: 'Wool', reason: 'Too warm for Philippine sleeping climates' },
      { fabric: 'Rough abaca', reason: 'Too textured for comfortable sleep' },
    ],
  },
};

export function getOccasionWeatherGuide(context: DressingContext): OccasionWeatherGuide {
  return OCCASION_WEATHER_GUIDES[context];
}

export function getDressingContextLabel(context: DressingContext): string {
  return DRESSING_CONTEXT_OPTIONS.find((option) => option.id === context)?.label ?? context;
}
