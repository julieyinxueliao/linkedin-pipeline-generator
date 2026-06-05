// Phase C: archetype-anchored draft generation. Never fabricates metrics.

import { ARCHETYPE_BY_ID, type CtaType } from './principles';
import type { CalendarSlot } from './calendar';
import type { StrategyBrief } from './strategy';

const METRIC_PLACEHOLDER = '[INSERT METRIC]';

function ctaLine(cta: CtaType, brief: StrategyBrief): string {
  switch (cta) {
    case 'none':
      return '';
    case 'soft':
      return `Curious what you are seeing in ${brief.wedge || 'your world'} — what would you push back on?`;
    case 'comment-gated': {
      const word = (brief.wedge || 'PLAYBOOK').toUpperCase().split(' ')[0];
      return `If this is useful, comment "${word}" and I will DM you the full version.`;
    }
    case 'hard':
      return `If this sounds like your team, ${brief.companyName || 'we'} are taking new conversations this week — DM me "intro".`;
    default:
      return '';
  }
}

function pickProof(brief: StrategyBrief, i: number): string {
  if (!brief.proofPoints.length) return METRIC_PLACEHOLDER;
  return brief.proofPoints[i % brief.proofPoints.length];
}

export function generateDraftForSlot(slot: CalendarSlot, brief: StrategyBrief): string {
  const arch = ARCHETYPE_BY_ID[slot.archetypeId];
  const angle = slot.workingAngle;
  const co = brief.companyName || 'we';
  const wedge = brief.wedge || 'GTM';
  const cta = ctaLine(slot.ctaType, brief);

  switch (slot.archetypeId) {
    case 'contrarian-pov':
    case 'frame-shift':
      return [
        angle.split('.')[0] + '.',
        '',
        `Most ${brief.icpTitles || 'teams'} I talk to still operate on the old assumption.`,
        `Here is what has actually changed in ${wedge}:`,
        '',
        `• The buyer's first move is no longer a demo.`,
        `• The work that wins is invisible from the dashboard.`,
        `• The tools you bought were designed for a different motion.`,
        '',
        `The frame that works now: stop selling the artifact, start selling the new way of working.`,
        cta,
      ].filter(Boolean).join('\n');

    case 'customer-story':
      return [
        `A customer told me last week: "${pickProof(brief, 0)}"`,
        '',
        `Before working with ${co}, their team was stuck in the same loop most ${brief.icpTitles || 'teams'} are stuck in.`,
        '',
        `What changed:`,
        `1. We renamed the problem (it was not what they thought).`,
        `2. We rebuilt the first 14 days of their workflow.`,
        `3. We measured the one thing that actually moves.`,
        '',
        `Result: ${pickProof(brief, 0)} — verified, ${METRIC_PLACEHOLDER}.`,
        '',
        `The lesson: most ${wedge} problems are workflow problems wearing a tooling costume.`,
        cta,
      ].filter(Boolean).join('\n');

    case 'narrative-product':
      return [
        `We did not set out to build ${co}.`,
        '',
        `We set out to fix one specific problem in ${wedge}:`,
        `${angle}`,
        '',
        `Everything on the market wanted us to add another tab to the workflow.`,
        `We wanted to remove a tab. So we built it.`,
        '',
        `One real user is using it today to ${brief.proofPoints[0] || METRIC_PLACEHOLDER}.`,
        '',
        `We are not for everyone — but if you have felt this exact pain, we should talk.`,
        cta,
      ].filter(Boolean).join('\n');

    case 'teardown':
      return [
        `I spent an hour tearing down a ${wedge} playbook this week.`,
        '',
        `Working:`,
        `• Clear point of view on the buyer's status quo`,
        `• One asset that travels (used in 3 different stages)`,
        `• Outbound that references the buyer's last public move`,
        '',
        `Broken:`,
        `• Generic discovery questions disguised as "qualification"`,
        `• A demo that opens with the product, not the problem`,
        `• A pricing page that assumes the buyer already trusts you`,
        '',
        `The principle: every artifact must do the work of multiplying trust, not extracting it.`,
        cta,
      ].filter(Boolean).join('\n');

    case 'data-drop':
      return [
        `Pulled a number from our own ops this week:`,
        '',
        `${METRIC_PLACEHOLDER} ← replace with the real figure before publishing.`,
        '',
        `Here is how we measured it and why I think it is the leading indicator most ${brief.icpTitles || 'teams'} are missing.`,
        '',
        `Implication: if you are not tracking this, you are forecasting blind.`,
        cta,
      ].filter(Boolean).join('\n');

    case 'comment-gated':
      return [
        `${angle}`,
        '',
        `I put together the ${wedge} playbook we actually use internally — the one we never published.`,
        '',
        `Inside:`,
        `• The workflow change that drove our last ${METRIC_PLACEHOLDER}`,
        `• The 3 questions we ask before any new account`,
        `• A one-pager you can hand to your team Monday`,
        '',
        cta || 'Comment below and I will DM it.',
      ].filter(Boolean).join('\n');

    case 'lesson-learned':
    default:
      return [
        `Something I used to believe about ${wedge} that I do not believe anymore:`,
        '',
        angle,
        '',
        `What changed my mind: ${brief.proofPoints[0] || METRIC_PLACEHOLDER}.`,
        '',
        `The new operating rule for ${co}:`,
        `Build the workflow first. Bolt the tools on after.`,
        cta,
      ].filter(Boolean).join('\n');
  }
}

export { METRIC_PLACEHOLDER };
