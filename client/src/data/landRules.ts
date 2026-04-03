import type { LandRuleSet } from '../types';

export const LAND_RULES: Record<string, LandRuleSet> = {
  BLM: {
    agencyType: 'BLM',
    generalRules: [
      {
        id: 'blm-stay-limit',
        category: 'stay-limit',
        title: '14-Day Stay Limit',
        description:
          'You may camp in one location for up to 14 days within any 28-day period. After 14 days, you must move at least 25 miles away before returning.',
        citation: '43 CFR 8365.1-5',
      },
      {
        id: 'blm-water',
        category: 'water',
        title: '200 ft From Water',
        description:
          'Camp and park vehicles at least 200 feet from water sources (rivers, lakes, springs) to protect riparian areas and water quality.',
      },
      {
        id: 'blm-vehicle',
        category: 'vehicle',
        title: 'Stay on Designated Routes',
        description:
          'Motorized vehicles must stay on designated roads and trails. Off-route vehicle travel is prohibited unless in an area specifically designated for cross-country travel.',
        citation: '43 CFR 8341.1',
      },
      {
        id: 'blm-fire',
        category: 'fire',
        title: 'Campfire Rules',
        description:
          'Campfires are generally allowed but may be restricted during high fire danger. Use existing fire rings when available, keep fires small, and always drown fires completely before leaving. A fire pan may be required in some areas.',
      },
      {
        id: 'blm-waste',
        category: 'waste',
        title: 'Pack It Out',
        description:
          'All trash and waste must be packed out. Human waste must be buried in a cat hole 6–8 inches deep, at least 200 feet from water, trails, and camp. In many desert areas, WAG bags are required for solid waste.',
      },
      {
        id: 'blm-fees',
        category: 'fees',
        title: 'Free — No Permit Required',
        description:
          'Dispersed camping on BLM land is free and requires no reservation or permit in most areas. Some Special Recreation Management Areas (SRMAs) may have fees or permit requirements.',
      },
    ],
  },
  USFS: {
    agencyType: 'USFS',
    generalRules: [
      {
        id: 'usfs-stay-limit',
        category: 'stay-limit',
        title: '14-Day Stay Limit',
        description:
          'Dispersed camping is generally limited to 14 consecutive days at any one location. Rules vary by National Forest — some forests use a 16-day or 30-day calendar year window.',
      },
      {
        id: 'usfs-setback',
        category: 'water',
        title: '150 ft Setback',
        description:
          'Camp at least 150–200 feet from water sources, roads, and trails. This protects water quality and maintains the natural character of the area.',
        citation: '36 CFR 261',
      },
      {
        id: 'usfs-structures',
        category: 'waste',
        title: 'No Permanent Structures',
        description:
          'You may not build permanent structures, leave unattended property for more than 14 days, or dig trenches around your camp.',
      },
      {
        id: 'usfs-fire',
        category: 'fire',
        title: 'Campfire Restrictions',
        description:
          'Campfire rules vary by forest and season. During dry conditions, campfires may be prohibited in all or part of a National Forest. Always check current restrictions before your trip.',
      },
      {
        id: 'usfs-fees',
        category: 'fees',
        title: 'Generally Free',
        description:
          'Dispersed camping on National Forest land is generally free. Some developed recreation areas within forests require fees. Wilderness areas may require a free permit.',
      },
    ],
  },
  unknown: {
    agencyType: 'unknown',
    generalRules: [
      {
        id: 'unknown-check',
        category: 'fees',
        title: 'Verify Land Ownership',
        description:
          'The land type for this location could not be determined. Please verify it is public land (BLM or National Forest) before camping. Private land camping is trespassing.',
      },
    ],
  },
};
