## Goal
Onboarding step 2 should actually pull company name, one-liner, wedge, ICP titles, ICP company type, and proof points from the user's website + LinkedIn company URL. No hardcoded placeholders.

## Why the previous attempt was mock
- Pull ran in the browser → CORS blocks direct fetches of third-party sites.
- LinkedIn connector reads only the logged-in member (`v2/userinfo`), not arbitrary company pages.
- Result: I used `setTimeout` + derived a name from the URL hostname. That's the bug.

## Architecture

```text
Onboarding (client)
   │  websiteUrl + linkedinCompanyUrl
   ▼
Edge function: pull-company-profile
   ├─ Firecrawl /v2/scrape  (website, formats: markdown + summary)
   ├─ Firecrawl /v2/scrape  (LinkedIn company URL, markdown)
   └─ Lovable AI (google/gemini-2.5-flash) → JSON extraction
        { companyName, oneLiner, wedge, icpTitles, icpCompanyType, proofPoints[] }
   ▼
Client fills the editable fields with returned values
```

## Required setup (one user action)
- Connect the **Firecrawl** connector. It injects `FIRECRAWL_API_KEY` server-side. LinkedIn company scraping via Firecrawl is best-effort (the page may be gated); when that happens we degrade gracefully and rely on the website only, and surface a notice.
- `LOVABLE_API_KEY` is already present, so the AI extraction call needs no extra secret.

## Edge function: `pull-company-profile`
- Validates body with Zod: `{ websiteUrl: url, linkedinCompanyUrl: url }`.
- Calls Firecrawl `/v2/scrape` for the website (`formats: ['markdown','summary']`, `onlyMainContent: true`).
- Calls Firecrawl `/v2/scrape` for the LinkedIn URL (markdown only). If it returns 403/empty, continue with website-only and set `linkedinAvailable: false`.
- Sends the combined markdown to Lovable AI Gateway with a strict JSON schema prompt. Truncate inputs (~12k chars each) to keep token use reasonable.
- Returns `{ data: {...}, sources: { websiteAvailable, linkedinAvailable }, warnings: [] }`.
- Standard CORS + try/catch with corsHeaders on errors.

## Client changes (`src/pages/Onboarding.tsx`)
- Replace `handleAutoPull`'s `setTimeout` with `supabase.functions.invoke('pull-company-profile', { body: { websiteUrl, linkedinCompanyUrl } })`.
- Show real loading + error states. On success, populate the editable fields with the returned values.
- If `linkedinAvailable === false`, show an inline notice like "Couldn't read LinkedIn company page — filled in from website only. Edit as needed."
- Keep all fields editable so the user always reviews before continuing.

## Out of scope (for now)
- Persisting raw scraped markdown.
- Using the LinkedIn connector's `w_member_social` / `userinfo` for the user's *personal* profile (separate flow).
- Re-running pull automatically on URL change — only on button click.

## What I need from you
1. Approve the Firecrawl connector (one click after you approve this plan).
2. Confirm you're OK with best-effort LinkedIn (it may fall back to website-only).
