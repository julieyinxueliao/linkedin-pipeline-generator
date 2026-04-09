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

export function generateMockPost(theme: string, format: string): string {
  return `Here's something most ${theme.toLowerCase()} advice gets wrong:\n\nIt's not about doing more. It's about doing less, better.\n\nI spent 3 years trying to optimize every part of our funnel.\nThe result? Burnout and marginal gains.\n\nThen I tried something different:\n→ Picked ONE metric that mattered\n→ Said no to everything else\n→ Gave my team full autonomy on how to move it\n\nThe result?\n• 2x growth in 6 months\n• Team morale at an all-time high\n• I got my weekends back\n\nThe lesson: Focus isn't saying yes to the right thing.\nIt's saying no to everything else.\n\nWhat's the ONE thing you're focused on this quarter?\n\n#leadership #founders #growth`;
}
