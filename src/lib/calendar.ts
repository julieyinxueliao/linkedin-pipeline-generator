// Phase B: 4-week calendar generation + Mix Check.

import {
  ARCHETYPE_BY_ID,
  ARCHETYPE_ROTATION,
  PRESET_MIX,
  type CtaType,
  type FunnelStage,
  type Preset,
} from './principles';
import type { StrategyBrief, Pillar } from './strategy';

export interface CalendarSlot {
  id: string;
  week: number;       // 1..4
  dayOfWeek: number;  // 1..5 (Mon..Fri)
  scheduledFor: string; // ISO date
  pillarId: string;
  pillarName: string;
  funnelStage: FunnelStage;
  archetypeId: string;
  archetypeName: string;
  workingAngle: string;
  ctaType: CtaType;
  assetNeeded: string;
  status: 'planned' | 'drafted' | 'scheduled' | 'published';
  draftId?: string;
}

export interface ContentCalendar {
  id: string;
  cadencePerWeek: number;
  weeks: number;
  slots: CalendarSlot[];
  approvedAt?: string;
}

function pickPillarForArchetype(archetypeId: string, pillars: Pillar[]): Pillar {
  const match = pillars.find((p) => p.archetypeIds.includes(archetypeId));
  return match ?? pillars[0];
}

function nextBusinessDay(d: Date): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + 1);
  const day = dt.getDay();
  if (day === 6) dt.setDate(dt.getDate() + 2);
  if (day === 0) dt.setDate(dt.getDate() + 1);
  return dt;
}

function workingAngleFor(archetypeId: string, pillar: Pillar, brief: StrategyBrief, povIndex: number): string {
  const pov = brief.povBank[povIndex % Math.max(brief.povBank.length, 1)]?.text;
  switch (archetypeId) {
    case 'contrarian-pov':
    case 'frame-shift':
      return pov ? pov.replace(/\.$/, '') : pillar.exampleAngles[0];
    case 'customer-story': {
      const proof = brief.proofPoints[0];
      return proof
        ? `Customer story behind: "${proof}"`
        : 'Customer story — pick a recent win with one real number';
    }
    case 'narrative-product':
      return `Why we built ${brief.companyName || 'this'} — the moment the existing tools broke`;
    case 'teardown':
      return `Teardown: a public ${brief.wedge || 'GTM'} playbook — what works, what does not`;
    case 'data-drop':
      return `Internal benchmark: a number from our ${brief.wedge || 'ops'} we can publish`;
    case 'comment-gated':
      return `Resource giveaway: comment "${(brief.wedge || 'PLAYBOOK').toUpperCase().split(' ')[0]}" to get it`;
    case 'lesson-learned':
      return `A belief I used to hold building ${brief.companyName || 'the company'} — and what changed it`;
    default:
      return pillar.exampleAngles[0];
  }
}

function assetForArchetype(archetypeId: string, brief: StrategyBrief): string {
  switch (archetypeId) {
    case 'customer-story':
      return brief.proofPoints[0] ? `Use win: "${brief.proofPoints[0]}"` : 'TO SOURCE: customer win + 1 number';
    case 'data-drop':
      return 'Internal metric to publish (mark [INSERT METRIC] if missing)';
    case 'narrative-product':
      return 'Original problem story + 1 real user using it';
    case 'comment-gated':
      return 'A real downloadable (checklist / template / 1-pager)';
    case 'teardown':
      return 'A public example URL or screenshot';
    default:
      return brief.samplePosts.length ? 'Founder voice samples on file' : 'Founder POV — needs voice calibration';
  }
}

export function generateCalendar(
  brief: StrategyBrief,
  opts: { cadencePerWeek?: number; weeks?: number; startDate?: Date; weekOffset?: number; rotationOffset?: number } = {},
): ContentCalendar {
  const cadencePerWeek = opts.cadencePerWeek ?? 2;
  const weeks = opts.weeks ?? 4;
  const preset: Preset = brief.preset;
  const rotation = ARCHETYPE_ROTATION[preset];

  // Posting rules: never post on weekends, Monday morning, or Friday afternoon.
  // Allowed AM slots (08:30): Tue, Wed, Thu, Fri. Allowed PM slot (15:30): Mon.
  const dayPattern = cadencePerWeek === 5
    ? [1, 2, 3, 4, 5]   // Mon (PM), Tue, Wed, Thu, Fri (AM)
    : cadencePerWeek === 4
    ? [1, 2, 4, 5]      // Mon (PM), Tue, Thu, Fri (AM)
    : cadencePerWeek === 3
    ? [2, 3, 4]         // Tue, Wed, Thu
    : [2, 4];           // Tue, Thu

  // Mon -> afternoon (avoid Mon AM). Fri -> morning (avoid Fri PM). Others -> morning.
  const timeForDay = (dow: number) => (dow === 1 ? '15:30' : '08:30');

  let cursor = opts.startDate ? new Date(opts.startDate) : new Date();
  while (cursor.getDay() !== 1) cursor = nextBusinessDay(cursor);

  const slots: CalendarSlot[] = [];
  const weekOffset = opts.weekOffset ?? 0;
  let i = opts.rotationOffset ?? 0;
  for (let w = 1; w <= weeks; w++) {
    const weekStart = new Date(cursor);
    weekStart.setDate(cursor.getDate() + (w - 1) * 7);
    for (const dow of dayPattern) {
      const archId = rotation[i % rotation.length];
      const arch = ARCHETYPE_BY_ID[archId];
      const pillar = pickPillarForArchetype(archId, brief.pillars);
      const funnelStage: FunnelStage = arch.funnel[0];
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + (dow - 1));
      slots.push({
        id: `slot-${weekOffset + w}-${dow}-${Math.random().toString(36).slice(2, 6)}`,
        week: weekOffset + w,
        dayOfWeek: dow,
        scheduledFor: `${date.toISOString().split('T')[0]}T${timeForDay(dow)}:00`,
        pillarId: pillar.id,
        pillarName: pillar.name,
        funnelStage,
        archetypeId: archId,
        archetypeName: arch.name,
        workingAngle: workingAngleFor(archId, pillar, brief, i),
        ctaType: arch.defaultCta,
        assetNeeded: assetForArchetype(archId, brief),
        status: 'planned',
      });
      i++;
    }
  }

  return {
    id: `cal-${Date.now()}`,
    cadencePerWeek,
    weeks,
    slots,
  };
}

/** Append more weeks of slots to an existing calendar, starting the week after the last slot. */
export function extendCalendar(existing: ContentCalendar, brief: StrategyBrief, addWeeks = 4): ContentCalendar {
  const lastDate = existing.slots
    .map((s) => new Date(s.scheduledFor))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date();
  const start = new Date(lastDate);
  start.setDate(start.getDate() + 7);
  while (start.getDay() !== 1) start.setDate(start.getDate() + 1);

  const added = generateCalendar(brief, {
    cadencePerWeek: existing.cadencePerWeek,
    weeks: addWeeks,
    startDate: start,
    weekOffset: existing.weeks,
    rotationOffset: existing.slots.length,
  });

  return {
    ...existing,
    weeks: existing.weeks + addWeeks,
    slots: [...existing.slots, ...added.slots],
  };
}

export interface MixCheck {
  funnel: { target: Record<FunnelStage, number>; actual: Record<FunnelStage, number> };
  cta: { target: Record<CtaType, number>; actual: Record<CtaType, number> };
}

export function computeMixCheck(calendar: ContentCalendar, preset: Preset): MixCheck {
  const total = Math.max(calendar.slots.length, 1);
  const funnel: Record<FunnelStage, number> = { TOFU: 0, MOFU: 0, BOFU: 0 };
  const cta: Record<CtaType, number> = { none: 0, soft: 0, 'comment-gated': 0, hard: 0 };
  calendar.slots.forEach((s) => {
    funnel[s.funnelStage] += 1;
    cta[s.ctaType] += 1;
  });
  const actualFunnel = Object.fromEntries(
    Object.entries(funnel).map(([k, v]) => [k, Math.round((v / total) * 100)]),
  ) as Record<FunnelStage, number>;
  const actualCta = Object.fromEntries(
    Object.entries(cta).map(([k, v]) => [k, Math.round((v / total) * 100)]),
  ) as Record<CtaType, number>;
  return {
    funnel: { target: PRESET_MIX[preset].funnel, actual: actualFunnel },
    cta: { target: PRESET_MIX[preset].cta, actual: actualCta },
  };
}
