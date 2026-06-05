import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const FIRECRAWL_V2 = 'https://api.firecrawl.dev/v2';
const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface PullBody {
  websiteUrl?: string;
  linkedinCompanyUrl?: string;
}

function isValidUrl(s: unknown): s is string {
  if (typeof s !== 'string' || !s.trim()) return false;
  try {
    const u = new URL(s.startsWith('http') ? s : `https://${s}`);
    return !!u.hostname;
  } catch {
    return false;
  }
}

function normalizeUrl(s: string) {
  return s.startsWith('http') ? s : `https://${s}`;
}

async function firecrawlScrape(url: string, apiKey: string, formats: string[]): Promise<{ markdown?: string; summary?: string; error?: string }> {
  try {
    const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats, onlyMainContent: true }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: `${res.status}: ${data?.error ?? res.statusText}` };
    // v2 returns { success, data: { markdown, summary, metadata, ... } } typically
    const payload = data?.data ?? data;
    return { markdown: payload?.markdown, summary: payload?.summary };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!FIRECRAWL_API_KEY) throw new Error('FIRECRAWL_API_KEY is not configured');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const body = (await req.json().catch(() => ({}))) as PullBody;
    if (!isValidUrl(body.websiteUrl) || !isValidUrl(body.linkedinCompanyUrl)) {
      return new Response(JSON.stringify({ error: 'websiteUrl and linkedinCompanyUrl must be valid URLs' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const websiteUrl = normalizeUrl(body.websiteUrl!);
    const linkedinUrl = normalizeUrl(body.linkedinCompanyUrl!);

    const [site, li] = await Promise.all([
      firecrawlScrape(websiteUrl, FIRECRAWL_API_KEY, ['markdown', 'summary']),
      firecrawlScrape(linkedinUrl, FIRECRAWL_API_KEY, ['markdown']),
    ]);

    const websiteAvailable = !!(site.markdown || site.summary);
    const linkedinAvailable = !!li.markdown && li.markdown.length > 200;

    if (!websiteAvailable && !linkedinAvailable) {
      return new Response(JSON.stringify({
        error: 'Could not read either source',
        details: { website: site.error, linkedin: li.error },
      }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const truncate = (s?: string, n = 12000) => (s ?? '').slice(0, n);
    const context = [
      websiteAvailable ? `### WEBSITE (${websiteUrl})\nSummary: ${site.summary ?? ''}\n\n${truncate(site.markdown)}` : '',
      linkedinAvailable ? `### LINKEDIN COMPANY (${linkedinUrl})\n${truncate(li.markdown)}` : '',
    ].filter(Boolean).join('\n\n---\n\n');

    const systemPrompt = `You extract a B2B company profile from scraped web content. Return ONLY valid JSON matching this exact shape, with no commentary:
{
  "companyName": string,
  "oneLiner": string,                 // <= 140 chars, plain language, what they actually do
  "wedge": string,                    // 3-7 word category they want to own
  "icpTitles": string,                // comma-separated buyer titles, e.g. "VP Ops, Head of RevOps"
  "icpCompanyType": string,           // e.g. "Series A–C B2B SaaS, 50–500 employees"
  "proofPoints": string[]             // 3-5 concrete proof points. Each MUST be grounded in the source text. If a number/metric is not explicitly stated, write it WITHOUT a number rather than inventing one. Never fabricate metrics.
}
Rules:
- Never invent metrics, customer names, or claims not present in the source.
- Prefer specificity over marketing fluff.
- If a field cannot be determined, return an empty string (or empty array for proofPoints).`;

    const aiRes = await fetch(AI_GATEWAY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in workspace billing.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway ${aiRes.status}: ${errText}`);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const data = {
      companyName: String(parsed.companyName ?? ''),
      oneLiner: String(parsed.oneLiner ?? ''),
      wedge: String(parsed.wedge ?? ''),
      icpTitles: String(parsed.icpTitles ?? ''),
      icpCompanyType: String(parsed.icpCompanyType ?? ''),
      proofPoints: Array.isArray(parsed.proofPoints) ? parsed.proofPoints.map(String).filter(Boolean) : [],
    };

    return new Response(JSON.stringify({
      data,
      sources: { websiteAvailable, linkedinAvailable },
      warnings: [
        !websiteAvailable ? 'Website could not be read' : null,
        !linkedinAvailable ? 'LinkedIn company page could not be read (often gated). Filled in from website only.' : null,
      ].filter(Boolean),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (e) {
    console.error('pull-company-profile error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
