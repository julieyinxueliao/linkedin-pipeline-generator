
-- Revoke execute on trigger functions (they should only be invoked by triggers, not via API)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Revoke anon SELECT on all user-scoped tables (anon should never access these)
REVOKE SELECT ON public.calendar_slots FROM anon;
REVOKE SELECT ON public.calendars FROM anon;
REVOKE SELECT ON public.connected_sources FROM anon;
REVOKE SELECT ON public.content_suggestions FROM anon;
REVOKE SELECT ON public.drafts FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.schedule_slots FROM anon;
REVOKE SELECT ON public.strategy_briefs FROM anon;
REVOKE SELECT ON public.voice_profiles FROM anon;
