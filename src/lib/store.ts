import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StrategyBrief } from './strategy';
import { extendCalendar as extendCalendarFn, type ContentCalendar, type CalendarSlot } from './calendar';

export interface ConnectedSource {
  id: string;
  name: string;
  icon: string;
  connectedAt: string;
  documentCount: number;
}

export interface UserProfile {
  name: string;
  role: string;
  industry: string;
  goal: string;
  goalCustom?: string;
  voiceStyle: string[];
  samplePosts: string[];
  connectedSources: ConnectedSource[];
  websiteUrl?: string;
  linkedinUrl?: string;
}

export interface DraftPost {
  id: string;
  content: string;
  createdAt: string;
  status: 'draft' | 'scheduled' | 'published';
  slotId?: string;
  archetypeId?: string;
}

interface AppState {
  onboardingComplete: boolean;
  currentOnboardingStep: number;
  profile: UserProfile;
  brief: StrategyBrief | null;
  calendar: ContentCalendar | null;
  drafts: DraftPost[];
  setOnboardingComplete: (v: boolean) => void;
  setOnboardingStep: (s: number) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  setBrief: (b: StrategyBrief | null) => void;
  updateBrief: (p: Partial<StrategyBrief>) => void;
  setCalendar: (c: ContentCalendar | null) => void;
  extendCalendar: () => void;
  updateSlot: (id: string, p: Partial<CalendarSlot>) => void;
  approveCalendar: () => void;
  addDraft: (d: DraftPost) => void;
  updateDraft: (id: string, p: Partial<DraftPost>) => void;
  resetAll: () => void;
}

const initialProfile: UserProfile = {
  name: '',
  role: '',
  industry: '',
  goal: '',
  voiceStyle: [],
  samplePosts: [],
  connectedSources: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      currentOnboardingStep: 0,
      profile: initialProfile,
      brief: null,
      calendar: null,
      drafts: [],
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      setOnboardingStep: (s) => set({ currentOnboardingStep: s }),
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setBrief: (b) => set({ brief: b }),
      updateBrief: (p) =>
        set((s) => ({ brief: s.brief ? { ...s.brief, ...p } : s.brief })),
      setCalendar: (c) => set({ calendar: c }),
      extendCalendar: () =>
        set((s) => ({
          calendar: s.calendar && s.brief ? extendCalendarFn(s.calendar, s.brief, 4) : s.calendar,
        })),
      updateSlot: (id, p) =>
        set((s) => ({
          calendar: s.calendar
            ? { ...s.calendar, slots: s.calendar.slots.map((sl) => (sl.id === id ? { ...sl, ...p } : sl)) }
            : s.calendar,
        })),
      approveCalendar: () =>
        set((s) => ({
          calendar: s.calendar ? { ...s.calendar, approvedAt: new Date().toISOString() } : s.calendar,
        })),
      addDraft: (d) => set((s) => ({ drafts: [...s.drafts, d] })),
      updateDraft: (id, p) =>
        set((s) => ({ drafts: s.drafts.map((d) => (d.id === id ? { ...d, ...p } : d)) })),
      resetAll: () =>
        set({
          onboardingComplete: false,
          currentOnboardingStep: 0,
          profile: initialProfile,
          brief: null,
          calendar: null,
          drafts: [],
        }),
    }),
    { name: 'brand-builder-state' },
  ),
);
