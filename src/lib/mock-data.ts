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

export function generateNicheSuggestions(role: string, industry: string): { id: string; excerpt: string; tag: string }[] {
  const lower = industry.toLowerCase();
  const roleLabel = role || 'leader';

  if (lower.includes('saas') || lower.includes('software')) {
    return [
      { id: 'ns-1', excerpt: `As a ${roleLabel}, I learned that churn tells you more about product-market fit than any growth metric ever will.`, tag: 'SaaS Strategy' },
      { id: 'ns-2', excerpt: `The #1 pricing mistake in SaaS? Charging for features instead of outcomes.`, tag: 'Pricing' },
      { id: 'ns-3', excerpt: `Your first 10 customers should hate 80% of your roadmap — here's why that's a good sign.`, tag: 'Early Stage' },
      { id: 'ns-4', excerpt: `Most SaaS onboarding flows optimize for activation. The best ones optimize for the "aha" moment.`, tag: 'Product' },
      { id: 'ns-5', excerpt: `Enterprise sales taught me that the real buyer is never the person on the demo call.`, tag: 'Sales' },
    ];
  }
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('machine learning')) {
    return [
      { id: 'ns-1', excerpt: `90% of AI projects fail not because the model is wrong — but because the problem was never clearly defined.`, tag: 'AI Strategy' },
      { id: 'ns-2', excerpt: `As a ${roleLabel} in AI, I've learned: the best model is the one your team can actually maintain.`, tag: 'Engineering' },
      { id: 'ns-3', excerpt: `"Just add AI" is the new "just add blockchain." Here's how to tell if AI actually fits your use case.`, tag: 'Hot Take' },
      { id: 'ns-4', excerpt: `The gap between a demo and a production AI system is 10x bigger than most founders realize.`, tag: 'Product' },
      { id: 'ns-5', excerpt: `Data quality > model architecture. Every. Single. Time.`, tag: 'ML Ops' },
    ];
  }
  if (lower.includes('fintech') || lower.includes('finance') || lower.includes('banking')) {
    return [
      { id: 'ns-1', excerpt: `The biggest fintech unlock isn't better UX — it's earning regulatory trust before you need it.`, tag: 'Compliance' },
      { id: 'ns-2', excerpt: `As a ${roleLabel}, I learned that the hardest part of fintech isn't building the product — it's building the partnerships.`, tag: 'Strategy' },
      { id: 'ns-3', excerpt: `Traditional banks aren't slow because they're dumb. They're slow because they understand risk better than we do.`, tag: 'Hot Take' },
      { id: 'ns-4', excerpt: `The best fintech products make money invisible. The worst ones make it confusing.`, tag: 'Product' },
      { id: 'ns-5', excerpt: `Embedded finance will create more fintech winners than standalone apps. Here's why.`, tag: 'Trends' },
    ];
  }
  if (lower.includes('health') || lower.includes('med') || lower.includes('biotech')) {
    return [
      { id: 'ns-1', excerpt: `In healthtech, "move fast and break things" can literally break things. Here's how we move fast AND stay safe.`, tag: 'Leadership' },
      { id: 'ns-2', excerpt: `As a ${roleLabel}, the hardest conversation I have is explaining why clinical validation takes so long.`, tag: 'Founder Life' },
      { id: 'ns-3', excerpt: `The biggest opportunity in healthtech isn't replacing doctors — it's giving them superpowers.`, tag: 'Vision' },
      { id: 'ns-4', excerpt: `Patient trust is your real product. Everything else is a feature.`, tag: 'Strategy' },
      { id: 'ns-5', excerpt: `HIPAA compliance isn't a checkbox. It's a competitive advantage if you do it right.`, tag: 'Compliance' },
    ];
  }
  if (lower.includes('climate') || lower.includes('energy') || lower.includes('clean')) {
    return [
      { id: 'ns-1', excerpt: `Climate tech has a storytelling problem. We're solving existential risks but communicating like a textbook.`, tag: 'Messaging' },
      { id: 'ns-2', excerpt: `As a ${roleLabel}, I've learned that climate investors care about unit economics just as much as impact.`, tag: 'Fundraising' },
      { id: 'ns-3', excerpt: `The hardest sell in climate tech? Convincing enterprises that sustainability IS the cost savings.`, tag: 'Sales' },
      { id: 'ns-4', excerpt: `Green premium is shrinking. The companies that move now will own the next decade.`, tag: 'Trends' },
      { id: 'ns-5', excerpt: `Climate tech needs more operators, not more researchers. Here's why.`, tag: 'Hot Take' },
    ];
  }
  // Generic but personalized fallback
  return [
    { id: 'ns-1', excerpt: `As a ${roleLabel} in ${industry}, the lesson that took me years to learn: your network IS your net worth.`, tag: 'Career' },
    { id: 'ns-2', excerpt: `Most ${industry} leaders overcomplicate strategy. The best ones can explain it in one sentence.`, tag: 'Leadership' },
    { id: 'ns-3', excerpt: `The biggest risk in ${industry} isn't competition — it's irrelevance. Here's how I stay ahead.`, tag: 'Strategy' },
    { id: 'ns-4', excerpt: `I asked 10 ${industry} leaders what they'd do differently. Every single one said the same thing.`, tag: 'Insights' },
    { id: 'ns-5', excerpt: `What I wish someone told me when I started as a ${roleLabel}: your first year is about learning, not winning.`, tag: 'Founder Life' },
  ];
}

export function generateMockPost(theme: string, format: string): string {
  return `Here's something most ${theme.toLowerCase()} advice gets wrong:\n\nIt's not about doing more. It's about doing less, better.\n\nI spent 3 years trying to optimize every part of our funnel.\nThe result? Burnout and marginal gains.\n\nThen I tried something different:\n→ Picked ONE metric that mattered\n→ Said no to everything else\n→ Gave my team full autonomy on how to move it\n\nThe result?\n• 2x growth in 6 months\n• Team morale at an all-time high\n• I got my weekends back\n\nThe lesson: Focus isn't saying yes to the right thing.\nIt's saying no to everything else.\n\nWhat's the ONE thing you're focused on this quarter?\n\n#leadership #founders #growth`;
}
