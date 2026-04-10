
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  goal TEXT NOT NULL DEFAULT '',
  goal_custom TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create voice_profiles table
CREATE TABLE public.voice_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  traits TEXT[] NOT NULL DEFAULT '{}',
  sample_posts TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice profile" ON public.voice_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own voice profile" ON public.voice_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own voice profile" ON public.voice_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create schedule_slots table
CREATE TABLE public.schedule_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  theme TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedule" ON public.schedule_slots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own schedule" ON public.schedule_slots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedule" ON public.schedule_slots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own schedule" ON public.schedule_slots FOR DELETE USING (auth.uid() = user_id);

-- Create drafts table
CREATE TABLE public.drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  schedule_slot_id UUID REFERENCES public.schedule_slots(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drafts" ON public.drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own drafts" ON public.drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own drafts" ON public.drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drafts" ON public.drafts FOR DELETE USING (auth.uid() = user_id);

-- Create content_suggestions table
CREATE TABLE public.content_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  excerpt TEXT NOT NULL,
  tag TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions" ON public.content_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own suggestions" ON public.content_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suggestions" ON public.content_suggestions FOR DELETE USING (auth.uid() = user_id);

-- Create connected_sources table
CREATE TABLE public.connected_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  document_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.connected_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sources" ON public.connected_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sources" ON public.connected_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sources" ON public.connected_sources FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
