## Goal
Remove the goal-selection step from onboarding. Default the user's goal to "Generate leads" automatically.

## Changes (all in `src/pages/Onboarding.tsx`)

1. **Remove the step 0 UI block** (lines ~320–345): the "What's your goal?" card with goal options, custom goal input, and Continue button.

2. **Default the goal in state**: initialize `selectedGoal` to `'leads'` (the lead-gen option id) so downstream logic (strategy brief, suggestions) still receives a valid goal. Remove the `goals` array, `customGoal` state, and related setters if no longer referenced.

3. **Renumber the flow** from 5 steps to 4:
   - Update `TOTAL_STEPS` from 5 → 4.
   - Shift each remaining step's displayed number down by 1 (`Header step={1..4}` instead of `2..5`).
   - Keep internal `step` index logic working: simplest path is to keep current indices (1–4) and just start the user at `step = 1` instead of `0`. Update the initial `currentOnboardingStep` default in the Zustand store accordingly, and the step-4 refresh guard's redirect target.
   - Update the progress-bar mapping so 4 dots render filled correctly.

4. **Remove now-unused imports/icons** tied to the goal step.

## Out of scope
- No changes to strategy brief generation, content suggestions, or calendar — they continue to read the goal value (now hardcoded `'leads'`).
- No design/visual changes to remaining steps.
