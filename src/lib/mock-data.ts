import type { ScheduleSlot } from './store';

const themes = [
  'Founder story', 'Industry insight', 'Lesson learned', 'Behind the scenes',
  'Hot take', 'How-to guide', 'Case study', 'Team spotlight',
  'Product update', 'Book recommendation', 'Career advice', 'Myth busting',
  'Customer win', 'Prediction', 'Personal reflection',
];

const formats = [
  'Personal insight', 'Listicle', 'Story arc', 'Question hook',
  'Data-driven', 'Contrarian take', 'Framework share', 'Mini thread',
];

export function generateSchedule(): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const today = new Date();
  let id = 0;

  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends

    slots.push({
      id: `slot-${id++}`,
      date: date.toISOString().split('T')[0],
      theme: themes[id % themes.length],
      format: formats[id % formats.length],
      status: 'not_started',
    });
  }
  return slots;
}

export const mockVoiceProfile = [
  'Conversational and direct',
  'Uses short paragraphs',
  'Opens with a hook or bold statement',
  'Ends with a clear takeaway or CTA',
];

export const mockAISuggestions = [
  { id: '1', excerpt: 'The biggest mistake founders make with their first hires isn\'t who they hire — it\'s when.', tag: 'Hiring' },
  { id: '2', excerpt: 'We grew 40% last quarter by doing one counterintuitive thing: saying no to 80% of inbound leads.', tag: 'Growth' },
  { id: '3', excerpt: 'Remote work doesn\'t kill culture. Bad communication does.', tag: 'Leadership' },
  { id: '4', excerpt: 'The best product feedback comes from your churned customers, not your power users.', tag: 'Product' },
];

// Generate exactly 1 niche-based suggestion
export function generateNicheSuggestion(role: string, industry: string): { id: string; excerpt: string; tag: string; source: 'niche' } {
  const lower = industry.toLowerCase();
  const roleLabel = role || 'leader';

  if (lower.includes('saas') || lower.includes('software')) {
    return { id: 'niche-1', excerpt: `As a ${roleLabel}, I learned that churn tells you more about product-market fit than any growth metric ever will.`, tag: 'SaaS Strategy', source: 'niche' };
  }
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) {
    return { id: 'niche-1', excerpt: `90% of AI projects fail not because the model is wrong — but because the problem was never clearly defined.`, tag: 'AI Strategy', source: 'niche' };
  }
  if (lower.includes('fintech') || lower.includes('finance') || lower.includes('banking')) {
    return { id: 'niche-1', excerpt: `The biggest fintech unlock isn't better UX — it's earning regulatory trust before you need it.`, tag: 'Compliance', source: 'niche' };
  }
  if (lower.includes('health') || lower.includes('med') || lower.includes('biotech')) {
    return { id: 'niche-1', excerpt: `In healthtech, "move fast and break things" can literally break things. Here's how we move fast AND stay safe.`, tag: 'Leadership', source: 'niche' };
  }
  if (lower.includes('climate') || lower.includes('energy') || lower.includes('clean')) {
    return { id: 'niche-1', excerpt: `Climate tech has a storytelling problem. We're solving existential risks but communicating like a textbook.`, tag: 'Messaging', source: 'niche' };
  }
  return { id: 'niche-1', excerpt: `As a ${roleLabel} in ${industry}, the lesson that took me years to learn: your network IS your net worth.`, tag: 'Career', source: 'niche' };
}

// Generate 1 trending LinkedIn topic suggestion
export function generateTrendingSuggestion(industry: string): { id: string; excerpt: string; tag: string; source: 'trending' } {
  const lower = industry.toLowerCase();

  if (lower.includes('saas') || lower.includes('software')) {
    return { id: 'trend-1', excerpt: `The "PLG is dead" discourse is missing the point. Product-led and sales-led aren't opposites — the winners do both.`, tag: '🔥 Trending', source: 'trending' };
  }
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) {
    return { id: 'trend-1', excerpt: `Everyone's talking about AI agents replacing jobs. But the real shift? AI is making 10x engineers out of 1x engineers.`, tag: '🔥 Trending', source: 'trending' };
  }
  if (lower.includes('fintech') || lower.includes('finance') || lower.includes('banking')) {
    return { id: 'trend-1', excerpt: `Stablecoin regulation is the most important fintech conversation nobody's having on LinkedIn right now.`, tag: '🔥 Trending', source: 'trending' };
  }
  if (lower.includes('health') || lower.includes('med') || lower.includes('biotech')) {
    return { id: 'trend-1', excerpt: `GLP-1 drugs are reshaping healthtech — and the companies that adapt their digital health models now will dominate.`, tag: '🔥 Trending', source: 'trending' };
  }
  if (lower.includes('climate') || lower.includes('energy') || lower.includes('clean')) {
    return { id: 'trend-1', excerpt: `The IRA is one year in. Here's what climate tech founders are learning about actually deploying government capital.`, tag: '🔥 Trending', source: 'trending' };
  }
  return { id: 'trend-1', excerpt: `LinkedIn's algorithm just changed again. Here's what ${industry} leaders should know about reach in 2026.`, tag: '🔥 Trending', source: 'trending' };
}

// Generate 2 document-based suggestions from connected sources
export function generateDocumentSuggestions(
  role: string,
  industry: string,
  sourceNames: string[]
): { id: string; excerpt: string; tag: string; source: 'document' }[] {
  const roleLabel = role || 'leader';
  const sourceName = sourceNames[0] || 'your documents';
  const lower = industry.toLowerCase();

  if (lower.includes('saas') || lower.includes('software')) {
    return [
      { id: 'doc-1', excerpt: `Based on your product docs: "Our onboarding reduces time-to-value by 60%" — this is a killer LinkedIn post waiting to happen.`, tag: `From ${sourceName}`, source: 'document' },
      { id: 'doc-2', excerpt: `Your Q1 report mentions a 3x improvement in retention. As a ${roleLabel}, share the framework behind it.`, tag: `From ${sourceName}`, source: 'document' },
    ];
  }
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) {
    return [
      { id: 'doc-1', excerpt: `Your research notes on model evaluation could become a must-read post: "The 3 metrics that actually matter for production AI."`, tag: `From ${sourceName}`, source: 'document' },
      { id: 'doc-2', excerpt: `That internal case study on reducing inference costs by 40%? Your audience needs to hear this story.`, tag: `From ${sourceName}`, source: 'document' },
    ];
  }
  if (lower.includes('fintech') || lower.includes('finance') || lower.includes('banking')) {
    return [
      { id: 'doc-1', excerpt: `Your compliance playbook has a section on "trust-first design" — that's a thought leadership post your audience will save.`, tag: `From ${sourceName}`, source: 'document' },
      { id: 'doc-2', excerpt: `The partnership framework from your strategy deck is exactly what other fintech founders struggle with. Share it.`, tag: `From ${sourceName}`, source: 'document' },
    ];
  }
  return [
    { id: 'doc-1', excerpt: `We found a key insight in your documents about ${industry} — this could be a high-engagement post about what makes your approach different.`, tag: `From ${sourceName}`, source: 'document' },
    { id: 'doc-2', excerpt: `Your internal framework on growth strategy is exactly the kind of original thinking that builds authority as a ${roleLabel}.`, tag: `From ${sourceName}`, source: 'document' },
  ];
}

export function generateMockPost(theme: string, format: string): string {
  return `Here's something most ${theme.toLowerCase()} advice gets wrong:\n\nIt's not about doing more. It's about doing less, better.\n\nI spent 3 years trying to optimize every part of our funnel.\nThe result? Burnout and marginal gains.\n\nThen I tried something different:\n→ Picked ONE metric that mattered\n→ Said no to everything else\n→ Gave my team full autonomy on how to move it\n\nThe result?\n• 2x growth in 6 months\n• Team morale at an all-time high\n• I got my weekends back\n\nThe lesson: Focus isn't saying yes to the right thing.\nIt's saying no to everything else.\n\nWhat's the ONE thing you're focused on this quarter?\n\n#leadership #founders #growth`;
}
