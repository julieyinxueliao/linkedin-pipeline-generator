// Generators for Phase A: Strategy Brief.

import { ARCHETYPES, type Preset, type FunnelStage } from './principles';

export interface BriefInputs {
  preset: Preset;
  companyName: string;
  companyOneLiner: string;
  websiteUrl?: string;
  wedge: string; // category / wedge they own
  icpTitles: string;
  icpCompanyType: string;
  proofPoints: string[]; // "Cut onboarding 60%", "$2M ARR in 9 months"
  samplePosts: string[];
  connectedSourceNames: string[];
}

export interface PovItem {
  id: string;
  text: string;
  edited?: boolean;
}

export interface Pillar {
  id: string;
  name: string;
  funnelTilt: FunnelStage;
  exampleAngles: string[];
  archetypeIds: string[];
}

export interface AssetItem {
  id: string;
  pillarId: string;
  text: string;
  hasProof: boolean; // false = "to source"
}

export interface StrategyBrief extends BriefInputs {
  positioning: string;
  categoryPov: string;
  povBank: PovItem[];
  pillars: Pillar[];
  assetInventory: AssetItem[];
  customMix?: Record<FunnelStage, number>;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generatePositioning(b: BriefInputs): string {
  const co = b.companyName || 'We';
  const who = b.icpTitles || 'GTM teams';
  const wedge = b.wedge || b.companyOneLiner || 'the next era of go-to-market';
  return `${co} helps ${who} win in ${wedge} by changing how the work actually gets done — not by adding another tool to the stack.`;
}

export function generateCategoryPov(b: BriefInputs): string {
  const w = b.wedge || 'GTM';
  return `${w} is not a software category anymore — it is an operating model. The teams who treat it that way will own the next decade.`;
}

const POV_TEMPLATES_REACH = [
  (b: BriefInputs) => `Everyone treats ${b.wedge || 'GTM'} as a tooling problem. It is a workflow problem — and the workflow has not been redesigned in 10 years.`,
  (b: BriefInputs) => `The "best practices" most ${b.icpTitles || 'GTM leaders'} repeat were invented for a market that no longer exists.`,
  (b: BriefInputs) => `Outbound is not dead. Generic outbound is dead. There is a difference and most teams refuse to see it.`,
  (b: BriefInputs) => `AI does not replace ${b.icpTitles || 'sellers'}. It exposes the ones who were already coasting.`,
  (b: BriefInputs) => `The funnel is a lie we tell ourselves to feel in control. Buyers do not move in stages — they move in loops.`,
  (b: BriefInputs) => `Pipeline coverage is a vanity metric. Pipeline quality per rep per week is the only thing that predicts the quarter.`,
  (b: BriefInputs) => `Most ${b.wedge || 'GTM'} dashboards measure activity, not progress. That is why the board meeting feels confusing.`,
  (b: BriefInputs) => `"Enablement" became a department because nobody owns the customer's first 90 days. Fix the ownership, kill the department.`,
  (b: BriefInputs) => `The best ${b.icpTitles || 'sellers'} I know spend more time picking accounts than working accounts. Selection is the skill.`,
  (b: BriefInputs) => `Brand is what your buyer says when you are not in the room. ${b.companyName || 'You'} cannot outsource that to a content agency.`,
];

const POV_TEMPLATES_PIPELINE = [
  (b: BriefInputs) => `If your team needs more SDRs to hit number, you do not have a pipeline problem — you have a targeting problem.`,
  (b: BriefInputs) => `The reason your win rate dropped is not the economy. It is that your ICP shifted and your messaging did not.`,
  (b: BriefInputs) => `Discovery is not a stage. It is the entire deal. Teams that get this win 2x more often.`,
  (b: BriefInputs) => `Stop forecasting from CRM stages. Forecast from the last meaningful action in the last 14 days.`,
  (b: BriefInputs) => `The fastest way to double pipeline is to fire 20% of your accounts. Most ${b.icpTitles || 'leaders'} will not do it.`,
  (b: BriefInputs) => `Buyer enablement beats seller enablement every time. Give the champion the deck — do not present it.`,
  (b: BriefInputs) => `If your reps cannot articulate the buyer's status quo in one sentence, they are not going to win the deal.`,
  (b: BriefInputs) => `Multi-threading is not "CC the VP." It is making three different people internally repeat your point of view back to you.`,
  (b: BriefInputs) => `${b.companyName || 'Our team'} stopped chasing MQLs and pipeline went up. Correlation is not causation — but it is suspicious.`,
  (b: BriefInputs) => `The fastest deals close because the buyer felt understood, not because the demo was great. Re-prioritize accordingly.`,
];

export function generatePovBank(b: BriefInputs): PovItem[] {
  const templates = b.preset === 'pipeline' ? POV_TEMPLATES_PIPELINE : POV_TEMPLATES_REACH;
  return templates.slice(0, 10).map((fn, i) => ({ id: `pov-${i}`, text: fn(b) }));
}

export function generatePillars(b: BriefInputs): Pillar[] {
  const w = b.wedge || 'GTM';
  const isPipeline = b.preset === 'pipeline';
  return [
    {
      id: 'pillar-pov',
      name: `${w} POV`,
      funnelTilt: 'TOFU',
      exampleAngles: [
        `What "${w}" actually means in 2026`,
        `The category shift most teams are sleeping on`,
        `What buyers wish vendors understood`,
      ],
      archetypeIds: ['contrarian-pov', 'frame-shift', 'lesson-learned'],
    },
    {
      id: 'pillar-playbook',
      name: 'Operator Playbook',
      funnelTilt: 'MOFU',
      exampleAngles: [
        `A specific tactic with the steps`,
        `Teardown of a real-world example`,
        `Numbers from our own ops`,
      ],
      archetypeIds: ['teardown', 'data-drop', 'lesson-learned'],
    },
    {
      id: 'pillar-proof',
      name: 'Customer Proof',
      funnelTilt: isPipeline ? 'BOFU' : 'MOFU',
      exampleAngles: [
        `A customer that changed how they work`,
        `Before / after with one number`,
        `What made the relationship click`,
      ],
      archetypeIds: ['customer-story', 'data-drop'],
    },
    {
      id: 'pillar-product',
      name: 'Narrative Product',
      funnelTilt: 'BOFU',
      exampleAngles: [
        `Why we built it (the original problem)`,
        `How a real user is using it`,
        `What we are NOT building, and why`,
      ],
      archetypeIds: ['narrative-product', 'customer-story'],
    },
    {
      id: 'pillar-founder',
      name: 'Founder Lens',
      funnelTilt: 'TOFU',
      exampleAngles: [
        `A lesson from running the company`,
        `A belief I used to hold and changed`,
        `Hiring / building / culture as it relates to the wedge`,
      ],
      archetypeIds: ['lesson-learned', 'contrarian-pov'],
    },
  ];
}

export function generateAssetInventory(b: BriefInputs): AssetItem[] {
  const items: AssetItem[] = [];
  // Map proof points → proof pillar
  b.proofPoints.filter(Boolean).forEach((p) => {
    items.push({ id: uid('asset'), pillarId: 'pillar-proof', text: p, hasProof: true });
  });
  // Connected sources → playbook (assume material lives there)
  b.connectedSourceNames.forEach((src) => {
    items.push({ id: uid('asset'), pillarId: 'pillar-playbook', text: `Internal docs from ${src}`, hasProof: true });
  });
  // Sample posts → founder lens
  b.samplePosts.filter(Boolean).forEach((p, i) => {
    items.push({ id: uid('asset'), pillarId: 'pillar-founder', text: `Past post #${i + 1}: "${p.slice(0, 60)}…"`, hasProof: true });
  });
  // Flag gaps
  if (!items.some((i) => i.pillarId === 'pillar-proof')) {
    items.push({ id: uid('asset'), pillarId: 'pillar-proof', text: 'Customer win with a real number', hasProof: false });
  }
  if (!items.some((i) => i.pillarId === 'pillar-product')) {
    items.push({ id: uid('asset'), pillarId: 'pillar-product', text: 'A user story or launch narrative', hasProof: false });
  }
  return items;
}

export function generateStrategyBrief(b: BriefInputs): StrategyBrief {
  return {
    ...b,
    positioning: generatePositioning(b),
    categoryPov: generateCategoryPov(b),
    povBank: generatePovBank(b),
    pillars: generatePillars(b),
    assetInventory: generateAssetInventory(b),
  };
}

// Just to surface archetype metadata to UI in one place
export { ARCHETYPES };
