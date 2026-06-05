
## Goal

Rework the app so it executes the SKILL.md workflow end-to-end: a founder lands, completes a Strategy Brief (Phase A), gets a 4-week Content Calendar (Phase B), and drafts posts anchored to calendar slots + archetypes (Phase C). All three phases are persisted per-user in Lovable Cloud.

## Phase A — Strategy Brief (replaces current onboarding)

New onboarding flow (~6 steps), persisted to a new `strategy_briefs` table:

1. **Goal** — keep current Goal step UI; map each option to a `preset` of `reach` or `pipeline` behind the scenes (drives funnel mix + CTA cadence + POV slant downstream).
2. **Company & wedge** — company name, one-line description, website URL, category/wedge.
3. **ICP** — target titles + company type.
4. **Source materials** —
   - Keep the existing Google Drive / Notion / Dropbox / Confluence connector step (writes to `connected_sources`, as today).
   - Add fields: existing LinkedIn post URLs (or paste samples), pitch deck link, customer wins/proof points (free-form list with optional metric).
5. **Voice calibration** — keep current sample-posts/tone step.
6. **Strategy Brief review** — generated from the above:
   - **Positioning statement** (1 sentence).
   - **Category POV to own** ("X is not Y anymore" frame).
   - **POV Bank** — 8–10 angles slanted by preset; editable/removable list.
   - **3–5 Content Pillars** — name, funnel tilt (TOFU/MOFU/BOFU), 3–4 example angles, fitting archetypes.
   - **Asset inventory** — proof points mapped to pillars; gaps flagged "to source".
   - **Preset mix targets** displayed (e.g. Reach = ~60/30/10 TOFU/MOFU/BOFU, sparing CTAs; Pipeline tilts BOFU + CTA cadence up).
   - User confirms → brief saved, onboarding complete.

The current 4-suggestions-on-dashboard step is removed; suggestions are replaced by the calendar.

## Phase B — Content Calendar (replaces current Schedule)

- New `calendar_slots` table replaces `schedule_slots` semantics (or extend it with new columns: `week`, `pillar`, `funnel_stage`, `archetype`, `cta_type`, `asset_needed`, `working_angle`).
- New `/calendar` page (rename/repurpose Schedule):
   - "Generate 4-week calendar" CTA → produces N slots/week (default 3, configurable).
   - Each slot card shows: Week·Day · Pillar · Funnel stage · Archetype · Working angle · CTA type · Asset needed.
   - **Mix Check** panel at top: target % vs actual % for funnel stage and CTA type, color-coded.
   - Slots are editable (pillar/archetype/CTA can be changed; mix updates live).
   - "Approve calendar" toggle gates Phase C drafting.
- Generation logic lives in `src/lib/calendar.ts` and uses the saved strategy brief + preset rules from a new `src/lib/principles.ts` (encodes funnel split, theme rotation, CTA cadence, archetype library — Contrarian POV, Customer Story, Teardown, Frame-shift, Comment-gated magnet, Narrative Product, etc.).

## Phase C — Post Drafts (rework `DraftPost`)

- Drafting is only reachable from an **approved** calendar slot (deep link `/draft?slot=:id`); a stand-alone "Draft a post" entry warns and routes to calendar.
- DraftPost loads the slot + strategy brief + voice, and drafts from the slot's archetype skeleton, the founder's real proof, and confirmed voice.
- Hard rules enforced in UI:
   - Never fabricate metrics — missing numbers render as `[INSERT METRIC]` chips inline.
   - Product slots use narrative wrapper templates, never bare feature lists.
   - One CTA per draft, matching slot's CTA type.
- Voice-confirmation gate: if no sample posts saved, show two tone options to calibrate before generating.
- Batch action: "Draft this week" generates drafts for all slots in a week.

## Dashboard updates

- Replace the "4 content ideas" section with:
   - **Strategy snapshot** (preset, positioning, top 3 POVs).
   - **This week from your calendar** (slots not yet drafted, link to draft).
   - **Mix check mini** (small donut/bar for funnel + CTA).
- Quick actions: "Open calendar", "Draft next slot", "Edit POV bank".

## Data model changes (Lovable Cloud)

Single migration adds:
- `strategy_briefs` — preset, positioning, category_pov, pillars (jsonb), pov_bank (jsonb), asset_inventory (jsonb), icp (jsonb), company (jsonb).
- `calendar_slots` — week, day_of_week, scheduled_for, pillar, funnel_stage, archetype, working_angle, cta_type, asset_needed, status, draft_id, approved (bool on parent calendar).
- `calendars` — owner, cadence_per_week, weeks (4), approved_at.
- Update `drafts` to link to `calendar_slot_id`.
- RLS: owner-only on all; standard GRANTs (`authenticated`, `service_role`).
- Keep `content_suggestions` table but stop writing to it; can be dropped later.

## Technical notes

- New files: `src/lib/principles.ts`, `src/lib/calendar.ts`, `src/lib/strategy.ts`, `src/pages/Calendar.tsx`, `src/pages/StrategyBrief.tsx` (or fold into Onboarding step 6), `src/components/MixCheck.tsx`, `src/components/POVBank.tsx`, `src/components/SlotCard.tsx`.
- Reworked: `src/pages/Onboarding.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Schedule.tsx` → Calendar, `src/pages/DraftPost.tsx`, `src/lib/store.ts`, `src/lib/mock-data.ts` (replaced by generators).
- Generation is deterministic + template-based for now (no LLM call); we can wire Lovable AI later for richer copy in Phase C without changing the surface.
- Keep coral/burnt-orange palette and existing semantic tokens — UI work only adds new components, no theme changes.
- Auth, routing, and the existing connector step stay as they are.

## Out of scope (this pass)

- Real LLM-powered drafting (placeholders + templates only).
- Real document ingestion from Drive/Notion (still simulated, but feeds into asset inventory).
- Publishing to LinkedIn.

## Suggested build order

1. Migration for `strategy_briefs`, `calendars`, `calendar_slots`, drafts link.
2. `principles.ts` + `strategy.ts` generators + types in `store.ts`.
3. Rework Onboarding through Strategy Brief review.
4. Build `/calendar` with generation + Mix Check + approval.
5. Rework Dashboard to strategy snapshot + this-week-from-calendar.
6. Rework DraftPost to slot-anchored with archetype skeletons + `[INSERT METRIC]` discipline.
