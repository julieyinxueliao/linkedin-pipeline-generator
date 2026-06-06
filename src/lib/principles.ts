// Encodes the GTM Founder LinkedIn principles: presets, archetypes, mix targets.

export type Preset = 'reach' | 'pipeline';
export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU';
export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  TOFU: 'Maximize reach',
  MOFU: 'Build credibility',
  BOFU: 'Drive conversions',
};
export type CtaType = 'none' | 'soft' | 'comment-gated' | 'hard';

export interface Archetype {
  id: string;
  name: string;
  description: string;
  funnel: FunnelStage[];
  defaultCta: CtaType;
  /** Skeleton: section labels for the draft template. */
  skeleton: string[];
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'contrarian-pov',
    name: 'Contrarian POV',
    description: '"Everyone believes X. The truth is Y." Names a category shift.',
    funnel: ['TOFU'],
    defaultCta: 'none',
    skeleton: ['Hook: the belief you reject', 'The shift you see', 'Why it matters', 'One concrete example', 'Land the new frame'],
  },
  {
    id: 'frame-shift',
    name: 'Frame-shift',
    description: '"X is not Y anymore." Repositions a category the market still describes the old way.',
    funnel: ['TOFU', 'MOFU'],
    defaultCta: 'soft',
    skeleton: ['Old frame everyone uses', 'Why it breaks today', 'The new frame', 'What changes for buyers', 'Soft invite to discuss'],
  },
  {
    id: 'customer-story',
    name: 'Customer Story',
    description: 'A real win, narrative-first, with one concrete number.',
    funnel: ['MOFU', 'BOFU'],
    defaultCta: 'soft',
    skeleton: ['The situation before', 'What they tried that did not work', 'The shift / what we did', 'The result with [INSERT METRIC]', 'The lesson for similar teams'],
  },
  {
    id: 'teardown',
    name: 'Teardown',
    description: 'Public analysis of a tactic / page / playbook with a clear verdict.',
    funnel: ['TOFU', 'MOFU'],
    defaultCta: 'none',
    skeleton: ['What you analyzed', '3 things working', '3 things broken', 'The principle behind it', 'What you would change'],
  },
  {
    id: 'narrative-product',
    name: 'Narrative Product',
    description: 'A product or launch wrapped in the problem story that forced it.',
    funnel: ['BOFU'],
    defaultCta: 'hard',
    skeleton: ['The problem we kept hitting', 'Why nothing on the market solved it', 'What we built', 'How a real user is using it today', 'How to try it (one ask)'],
  },
  {
    id: 'comment-gated',
    name: 'Comment-gated Magnet',
    description: 'High-intent: offers a resource in exchange for a comment. Use sparingly.',
    funnel: ['MOFU', 'BOFU'],
    defaultCta: 'comment-gated',
    skeleton: ['Bold claim or stat', 'What the resource is and what is inside', 'Who it is for', 'How to get it: "comment [WORD] and I will DM it"'],
  },
  {
    id: 'lesson-learned',
    name: 'Lesson Learned',
    description: 'Personal, specific lesson from running the company. No CTA.',
    funnel: ['TOFU'],
    defaultCta: 'none',
    skeleton: ['The moment it clicked', 'What you used to believe', 'What changed your mind', 'The new operating rule', 'What you would tell past-you'],
  },
  {
    id: 'data-drop',
    name: 'Proprietary Data Drop',
    description: 'Shares an internal number / benchmark only you can publish.',
    funnel: ['TOFU', 'MOFU'],
    defaultCta: 'soft',
    skeleton: ['The headline number [INSERT METRIC]', 'How you measured it', 'Why it matters now', 'One implication for the reader', 'Soft invite for reactions'],
  },
];

export const ARCHETYPE_BY_ID = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a]));

/** Preset-specific mix targets per the skill principles. */
export const PRESET_MIX: Record<Preset, {
  funnel: Record<FunnelStage, number>;
  cta: Record<CtaType, number>;
  label: string;
  description: string;
}> = {
  reach: {
    label: 'Reach',
    description: 'Optimize for audience, authority, inbound. Proof/BOFU is intentionally minimal.',
    funnel: { TOFU: 60, MOFU: 30, BOFU: 10 },
    cta: { none: 50, soft: 35, 'comment-gated': 10, hard: 5 },
  },
  pipeline: {
    label: 'Pipeline',
    description: 'Tilt toward proof and product. CTA cadence is higher, but authority posts still anchor the mix.',
    funnel: { TOFU: 40, MOFU: 35, BOFU: 25 },
    cta: { none: 30, soft: 35, 'comment-gated': 15, hard: 20 },
  },
};

export const CTA_LABEL: Record<CtaType, string> = {
  none: 'Just share',
  soft: 'Gentle nudge',
  'comment-gated': 'Reply to get it',
  hard: 'Direct ask',
};

/** Map the existing onboarding goal id to the SKILL preset. */
export function goalToPreset(goalId: string): Preset {
  if (goalId === 'sell') return 'pipeline';
  return 'reach';
}

/** Suggested archetype rotation per preset — repeated across the calendar. */
export const ARCHETYPE_ROTATION: Record<Preset, string[]> = {
  reach: [
    'contrarian-pov', 'lesson-learned', 'teardown',
    'frame-shift', 'contrarian-pov', 'data-drop',
    'lesson-learned', 'customer-story', 'contrarian-pov',
    'teardown', 'comment-gated', 'narrative-product',
  ],
  pipeline: [
    'contrarian-pov', 'customer-story', 'narrative-product',
    'data-drop', 'frame-shift', 'customer-story',
    'comment-gated', 'contrarian-pov', 'narrative-product',
    'customer-story', 'teardown', 'lesson-learned',
  ],
};
