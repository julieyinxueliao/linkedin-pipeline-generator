import { create } from 'zustand';

export interface ContentSuggestion {
  id: string;
  excerpt: string;
  tag: string;
}

export interface UserProfile {
  name: string;
  role: string;
  industry: string;
  goal: string;
  goalCustom?: string;
  voiceStyle: string[];
  samplePosts: string[];
  contentSuggestions: ContentSuggestion[];
}

export interface ScheduleSlot {
  id: string;
  date: string;
  theme: string;
  format: string;
  status: 'not_started' | 'draft' | 'published';
  content?: string;
}

export interface DraftPost {
  id: string;
  content: string;
  createdAt: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduleSlotId?: string;
}

interface AppState {
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  currentOnboardingStep: number;
  profile: UserProfile;
  schedule: ScheduleSlot[];
  drafts: DraftPost[];
  setAuthenticated: (val: boolean) => void;
  setOnboardingComplete: (val: boolean) => void;
  setOnboardingStep: (step: number) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setSchedule: (schedule: ScheduleSlot[]) => void;
  updateSlot: (id: string, partial: Partial<ScheduleSlot>) => void;
  addDraft: (draft: DraftPost) => void;
  updateDraft: (id: string, partial: Partial<DraftPost>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  onboardingComplete: false,
  currentOnboardingStep: 0,
  profile: {
    name: '',
    role: '',
    industry: '',
    goal: '',
    voiceStyle: [],
    samplePosts: [],
    contentSuggestions: [],
  },
  schedule: [],
  drafts: [],
  setAuthenticated: (val) => set({ isAuthenticated: val }),
  setOnboardingComplete: (val) => set({ onboardingComplete: val }),
  setOnboardingStep: (step) => set({ currentOnboardingStep: step }),
  updateProfile: (partial) =>
    set((s) => ({ profile: { ...s.profile, ...partial } })),
  setSchedule: (schedule) => set({ schedule }),
  updateSlot: (id, partial) =>
    set((s) => ({
      schedule: s.schedule.map((sl) =>
        sl.id === id ? { ...sl, ...partial } : sl
      ),
    })),
  addDraft: (draft) => set((s) => ({ drafts: [...s.drafts, draft] })),
  updateDraft: (id, partial) =>
    set((s) => ({
      drafts: s.drafts.map((d) => (d.id === id ? { ...d, ...partial } : d)),
    })),
}));
