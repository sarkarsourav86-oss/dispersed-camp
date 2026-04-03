import type { GearItem } from '../types';

export const GEAR_ITEMS: GearItem[] = [
  // SHELTER
  { id: 'tent-3season', name: '3-Season Tent', category: 'shelter', essential: true, conditions: { seasons: ['spring', 'summer', 'fall'] } },
  { id: 'tent-4season', name: '4-Season / Winter Tent', category: 'shelter', essential: true, conditions: { seasons: ['winter'] } },
  { id: 'tarp', name: 'Tarp / Bivy Shelter', category: 'shelter', essential: false, conditions: { seasons: ['spring', 'summer', 'fall'] }, notes: 'Lighter alternative to tent for dry climates' },
  { id: 'tent-stakes', name: 'Extra Tent Stakes', category: 'shelter', essential: true, conditions: {} },
  { id: 'ground-cloth', name: 'Ground Cloth / Footprint', category: 'shelter', essential: false, conditions: {} },

  // SLEEP
  { id: 'sleeping-bag-summer', name: 'Sleeping Bag (35°F+)', category: 'sleep', essential: true, conditions: { seasons: ['summer'] } },
  { id: 'sleeping-bag-3season', name: 'Sleeping Bag (15–35°F)', category: 'sleep', essential: true, conditions: { seasons: ['spring', 'fall'] } },
  { id: 'sleeping-bag-winter', name: 'Sleeping Bag (0°F or below)', category: 'sleep', essential: true, conditions: { seasons: ['winter'] } },
  { id: 'sleeping-pad', name: 'Sleeping Pad (insulated)', category: 'sleep', essential: true, conditions: {} },
  { id: 'pillow', name: 'Camping Pillow', category: 'sleep', essential: false, conditions: {} },

  // COOKING
  { id: 'stove', name: 'Camp Stove + Fuel', category: 'cooking', essential: true, conditions: {}, notes: 'Canister stove (summer) or liquid fuel (winter)' },
  { id: 'stove-winter', name: 'Liquid Fuel Stove', category: 'cooking', essential: false, conditions: { seasons: ['winter'] }, notes: 'Canister stoves fail in cold — liquid fuel recommended below 20°F' },
  { id: 'cookware', name: 'Pot / Pan Set', category: 'cooking', essential: true, conditions: {} },
  { id: 'utensils', name: 'Utensils (spork, knife)', category: 'cooking', essential: true, conditions: {} },
  { id: 'bear-canister', name: 'Bear Canister or Bear Bag', category: 'cooking', essential: false, conditions: { terrain: ['mountain', 'forest'] }, notes: 'Required in many wilderness areas' },
  { id: 'food', name: 'Food + Snacks', category: 'cooking', essential: true, conditions: {} },
  { id: 'cooler', name: 'Cooler / Ice', category: 'cooking', essential: false, conditions: { seasons: ['spring', 'summer', 'fall'] } },
  { id: 'camp-sink', name: 'Collapsible Wash Basin', category: 'cooking', essential: false, conditions: { minDays: 3 } },

  // WATER
  { id: 'water-jugs', name: 'Water Jugs / Containers', category: 'water', essential: true, conditions: {} },
  { id: 'water-filter', name: 'Water Filter (e.g. Sawyer Squeeze)', category: 'water', essential: true, conditions: { hasWaterNearby: true }, notes: 'Required when relying on natural sources' },
  { id: 'water-purification-tabs', name: 'Purification Tablets (backup)', category: 'water', essential: false, conditions: { hasWaterNearby: true } },
  { id: 'hydration-pack', name: 'Hydration Pack / Water Bottles', category: 'water', essential: true, conditions: {} },
  { id: 'collapsible-bucket', name: 'Collapsible Water Bucket', category: 'water', essential: false, conditions: { hasWaterNearby: true } },

  // NAVIGATION
  { id: 'offline-maps', name: 'Offline Maps (Gaia GPS / onX)', category: 'navigation', essential: true, conditions: {}, notes: 'Download before leaving cell service' },
  { id: 'compass', name: 'Compass', category: 'navigation', essential: true, conditions: {} },
  { id: 'paper-map', name: 'Paper Topo Map (USGS)', category: 'navigation', essential: false, conditions: {} },
  { id: 'gps-device', name: 'Dedicated GPS Device', category: 'navigation', essential: false, conditions: { terrain: ['mountain', 'desert'] } },
  { id: 'external-battery', name: 'External Battery Pack', category: 'navigation', essential: true, conditions: {}, notes: 'Keep phone/GPS charged off-grid' },
  { id: 'solar-charger', name: 'Solar Charger', category: 'navigation', essential: false, conditions: { minDays: 3 } },

  // SAFETY
  { id: 'first-aid', name: 'First Aid Kit', category: 'safety', essential: true, conditions: {} },
  { id: 'emergency-blanket', name: 'Emergency Blanket (mylar)', category: 'safety', essential: true, conditions: {} },
  { id: 'whistle', name: 'Emergency Whistle', category: 'safety', essential: true, conditions: {} },
  { id: 'headlamp', name: 'Headlamp + Extra Batteries', category: 'safety', essential: true, conditions: {} },
  { id: 'sat-communicator', name: 'Satellite Communicator (e.g. inReach)', category: 'safety', essential: false, conditions: { terrain: ['mountain', 'desert'] }, notes: 'Highly recommended — no cell service in dispersed areas' },
  { id: 'knife', name: 'Multi-Tool or Knife', category: 'safety', essential: true, conditions: {} },
  { id: 'bear-spray', name: 'Bear Spray', category: 'safety', essential: false, conditions: { terrain: ['mountain', 'forest'] } },
  { id: 'sunscreen', name: 'Sunscreen (SPF 30+)', category: 'safety', essential: true, conditions: { seasons: ['spring', 'summer', 'fall'] } },
  { id: 'bug-repellent', name: 'Bug Repellent (DEET)', category: 'safety', essential: false, conditions: { seasons: ['spring', 'summer'] } },

  // CLOTHING
  { id: 'layers-base', name: 'Moisture-Wicking Base Layer', category: 'clothing', essential: true, conditions: {} },
  { id: 'layers-mid', name: 'Insulating Mid Layer (fleece/down)', category: 'clothing', essential: true, conditions: { seasons: ['spring', 'fall', 'winter'] } },
  { id: 'rain-gear', name: 'Rain Jacket + Pants', category: 'clothing', essential: true, conditions: {} },
  { id: 'warm-hat', name: 'Warm Hat + Gloves', category: 'clothing', essential: true, conditions: { seasons: ['fall', 'winter', 'spring'] } },
  { id: 'sun-hat', name: 'Sun Hat', category: 'clothing', essential: true, conditions: { seasons: ['spring', 'summer', 'fall'] } },
  { id: 'hiking-boots', name: 'Sturdy Hiking Boots', category: 'clothing', essential: true, conditions: {} },
  { id: 'camp-shoes', name: 'Camp Shoes / Sandals', category: 'clothing', essential: false, conditions: { seasons: ['summer'] } },
  { id: 'gaiters', name: 'Gaiters', category: 'clothing', essential: false, conditions: { terrain: ['mountain'], seasons: ['winter'] } },

  // FIRE
  { id: 'lighter', name: 'Lighter + Waterproof Matches', category: 'fire', essential: true, conditions: { fireRestrictionsActive: false } },
  { id: 'fire-starter', name: 'Fire Starter Cubes / Tinder', category: 'fire', essential: false, conditions: { fireRestrictionsActive: false } },
  { id: 'fire-pan', name: 'Fire Pan (required in many BLM areas)', category: 'fire', essential: false, conditions: { fireRestrictionsActive: false }, notes: 'Required on many BLM areas — check local rules' },
  { id: 'fire-gloves', name: 'Heat-Resistant Gloves', category: 'fire', essential: false, conditions: { fireRestrictionsActive: false } },
  { id: 'camp-stove-only', name: 'Camp Stove (fires prohibited)', category: 'fire', essential: true, conditions: { fireRestrictionsActive: true }, notes: 'No open fires allowed — stove use only' },

  // HYGIENE
  { id: 'toiletry-kit', name: 'Toiletry Kit (biodegradable soap)', category: 'hygiene', essential: true, conditions: {} },
  { id: 'trowel', name: 'Cat Hole Trowel (6" dig tool)', category: 'hygiene', essential: true, conditions: {}, notes: 'Dig 6–8 inches, 200 ft from water/camp' },
  { id: 'wag-bags', name: 'WAG Bags (waste disposal)', category: 'hygiene', essential: false, conditions: { terrain: ['desert'] }, notes: 'Required in many desert BLM areas' },
  { id: 'hand-sanitizer', name: 'Hand Sanitizer', category: 'hygiene', essential: true, conditions: {} },
  { id: 'toilet-paper', name: 'Toilet Paper + Zip-Lock Bags', category: 'hygiene', essential: true, conditions: {}, notes: 'Pack it out — do not bury TP' },
  { id: 'camp-towel', name: 'Quick-Dry Camp Towel', category: 'hygiene', essential: false, conditions: {} },

  // VEHICLE
  { id: 'recovery-kit', name: 'Recovery Kit (tow strap, shovel)', category: 'vehicle', essential: false, conditions: { terrain: ['desert'] }, notes: 'Dispersed camping often requires rough roads' },
  { id: 'spare-tire', name: 'Full-Size Spare Tire', category: 'vehicle', essential: true, conditions: {} },
  { id: 'tire-repair', name: 'Tire Repair Kit + Air Compressor', category: 'vehicle', essential: false, conditions: { terrain: ['desert', 'mountain'] } },
  { id: 'jumper-cables', name: 'Jumper Cables / Jump Pack', category: 'vehicle', essential: true, conditions: {} },
  { id: 'extra-fuel', name: 'Extra Fuel (jerry can)', category: 'vehicle', essential: false, conditions: { terrain: ['desert'] }, notes: 'Gas stations can be 100+ miles from BLM land' },
  { id: 'road-atlas', name: 'Paper Road Atlas / BLM Maps', category: 'vehicle', essential: false, conditions: {} },

  // LEAVE NO TRACE
  { id: 'trash-bags', name: 'Trash Bags (pack out all waste)', category: 'leave-no-trace', essential: true, conditions: {} },
  { id: 'camp-soap', name: 'Biodegradable Soap', category: 'leave-no-trace', essential: true, conditions: {}, notes: 'Use 200+ ft from water sources' },
  { id: 'lnt-guide', name: 'Leave No Trace Principles Card', category: 'leave-no-trace', essential: false, conditions: {} },
];
