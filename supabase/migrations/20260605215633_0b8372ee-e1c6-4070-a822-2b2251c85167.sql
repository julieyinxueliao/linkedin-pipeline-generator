
-- Strategy briefs
CREATE TABLE public.strategy_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preset TEXT NOT NULL DEFAULT 'reach' CHECK (preset IN ('reach','pipeline')),
  company JSONB NOT NULL DEFAULT '{}'::jsonb,
  icp JSONB NOT NULL DEFAULT '{}'::jsonb,
  positioning TEXT,
  category_pov TEXT,
  pov_bank JSONB NOT NULL DEFAULT '[]'::jsonb,
  pillars JSONB NOT NULL DEFAULT '[]'::jsonb,
  asset_inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
  proof_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  sample_posts JSONB NOT NULL DEFAULT '[]'::jsonb,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategy_briefs TO authenticated;
GRANT ALL ON public.strategy_briefs TO service_role;
ALTER TABLE public.strategy_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own brief" ON public.strategy_briefs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_briefs_updated BEFORE UPDATE ON public.strategy_briefs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Calendars
CREATE TABLE public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cadence_per_week INT NOT NULL DEFAULT 3,
  weeks INT NOT NULL DEFAULT 4,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendars TO authenticated;
GRANT ALL ON public.calendars TO service_role;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own calendar" ON public.calendars FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_calendars_updated BEFORE UPDATE ON public.calendars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Calendar slots
CREATE TABLE public.calendar_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week INT NOT NULL,
  day_of_week INT NOT NULL,
  scheduled_for DATE,
  pillar TEXT NOT NULL,
  funnel_stage TEXT NOT NULL CHECK (funnel_stage IN ('TOFU','MOFU','BOFU')),
  archetype TEXT NOT NULL,
  working_angle TEXT NOT NULL,
  cta_type TEXT NOT NULL,
  asset_needed TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','drafted','scheduled','published')),
  draft_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_slots TO authenticated;
GRANT ALL ON public.calendar_slots TO service_role;
ALTER TABLE public.calendar_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own slot" ON public.calendar_slots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_slots_updated BEFORE UPDATE ON public.calendar_slots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Link drafts to slots
ALTER TABLE public.drafts ADD COLUMN IF NOT EXISTS calendar_slot_id UUID REFERENCES public.calendar_slots(id) ON DELETE SET NULL;
ALTER TABLE public.drafts ADD COLUMN IF NOT EXISTS archetype TEXT;
