import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface BriefInputs {
  preset: 'reach' | 'pipeline';
  companyName: string;
  companyOneLiner: string;
  websiteUrl?: string;
  wedge: string;
  icpTitles: string;
  icpCompanyType: string;
  proofPoints: string[];
  samplePosts: string[];
  voiceTraits?: string[];
  connectedSourceNames: string[];
  additionalContext?: string;
}

const PLAYBOOK = `GTM FOUNDER LINKEDIN PLAYBOOK — CORE PRINCIPLES

1. Every post belongs to ONE of these archetypes:
- Contrarian POV (TOFU): "Everyone believes X. The truth is Y." Names a category shift. No CTA.
- Frame-shift (TOFU/MOFU): "X is not Y anymore." Repositions a stale category. Soft CTA.
- Customer Story (MOFU/BOFU): Real win, narrative-first, ONE concrete number. Soft CTA.
- Teardown (TOFU/MOFU): Public analysis of a tactic/page with a clear verdict. No CTA.
- Narrative Product (BOFU): Product wrapped in the problem story that forced it. Hard CTA.
- Comment-gated Magnet (MOFU/BOFU): Trade a resource for a comment. Use sparingly.
- Lesson Learned (TOFU): Personal lesson from running the company. No CTA.
- Proprietary Data Drop (TOFU/MOFU): Internal benchmark only you can publish. Soft CTA.

2. Preset = REACH (default): mix is 60% TOFU / 30% MOFU / 10% BOFU. CTA mix: 50% none, 35% soft, 10% comment-gated, 5% hard.
3. Preset = PIPELINE: mix is 40/35/25. CTA: 30/35/15/20.

4. Pillars (always 5, ordered): 
   - {Wedge} POV (TOFU) — owns the category fight
   - Operator Playbook (MOFU) — specific tactics with steps
   - Customer Proof (MOFU or BOFU) — wins with one real number
   - Narrative Product (BOFU) — why we built it
   - Founder Lens (TOFU) — beliefs from running the company

5. NEVER invent metrics or customer names. If a number is missing in the source, write "[INSERT METRIC]".
6. The Category POV must be ONE bold sentence that re-frames the wedge — not a description of what the company does.
7. POV Bank items must be punchy, specific, and provocative. NOT bland.
8. Asset Inventory: list what real material exists, and flag gaps with hasProof=false.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const inputs = (await req.json().catch(() => ({}))) as BriefInputs;
    if (!inputs.wedge && !inputs.companyName) {
      return new Response(JSON.stringify({ error: 'Need at least company name or wedge' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a senior B2B content strategist generating a STRATEGY BRIEF for a founder's LinkedIn presence. You MUST follow the playbook below. Return ONLY valid JSON.

${PLAYBOOK}

Output shape (return ONLY this JSON):
{
  "positioning": string,
  "categoryPov": string,
  "povBank": [{ "id": string, "text": string }],
  "pillars": [
    { "id": string, "name": string, "funnelTilt": "TOFU"|"MOFU"|"BOFU", "exampleAngles": string[], "archetypeIds": string[] }
  ],
  "assetInventory": [{ "id": string, "pillarId": string, "text": string, "hasProof": boolean }]
}

Constraints:
- povBank MUST have 6 items, each a punchy 1-2 sentence point of view CUSTOMIZED to this company's wedge, ICP, and proof points. Reference real specifics from the inputs when possible. Avoid generic clichés.
- pillars MUST have exactly 5 items in this order: {Wedge} POV, Operator Playbook, Customer Proof, Narrative Product, Founder Lens. Names should use the actual wedge.
- archetypeIds for each pillar must come from: ["contrarian-pov","frame-shift","customer-story","teardown","narrative-product","comment-gated","lesson-learned","data-drop"].
- assetInventory: list all real proof points from the inputs (hasProof=true), all connectedSourceNames (hasProof=true, pillar 'pillar-playbook'), and flag obvious gaps with hasProof=false.
- ids: use "pov-0".."pov-5" for povBank, and "pillar-pov","pillar-playbook","pillar-proof","pillar-product","pillar-founder" for pillars (in that order). Use "asset-<n>" for assets.
- positioning: ONE sentence stating who they help, with what specifically, and what changes.
- categoryPov: ONE bold sentence reframing the wedge. Not a description of the company.`;

    const userPayload = JSON.stringify({
      preset: inputs.preset,
      companyName: inputs.companyName,
      companyOneLiner: inputs.companyOneLiner,
      wedge: inputs.wedge,
      icpTitles: inputs.icpTitles,
      icpCompanyType: inputs.icpCompanyType,
      proofPoints: inputs.proofPoints,
      voiceTraits: inputs.voiceTraits ?? [],
      samplePostsExcerpt: (inputs.samplePosts || []).slice(0, 3).map((s) => s.slice(0, 300)),
      connectedSourceNames: inputs.connectedSourceNames,
      additionalContextExcerpt: (inputs.additionalContext || '').slice(0, 2000),
    }, null, 2);

    const aiRes = await fetch(AI_GATEWAY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPayload },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const t = await aiRes.text();
      throw new Error(`AI gateway ${aiRes.status}: ${t}`);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    // Light validation/normalization
    const brief = {
      positioning: String(parsed.positioning ?? ''),
      categoryPov: String(parsed.categoryPov ?? ''),
      povBank: Array.isArray(parsed.povBank) ? parsed.povBank.slice(0, 6).map((p: any, i: number) => ({ id: String(p?.id || `pov-${i}`), text: String(p?.text || '') })).filter((p: any) => p.text) : [],
      pillars: Array.isArray(parsed.pillars) ? parsed.pillars.slice(0, 5).map((p: any) => ({
        id: String(p?.id || ''),
        name: String(p?.name || ''),
        funnelTilt: ['TOFU', 'MOFU', 'BOFU'].includes(p?.funnelTilt) ? p.funnelTilt : 'TOFU',
        exampleAngles: Array.isArray(p?.exampleAngles) ? p.exampleAngles.map(String).slice(0, 5) : [],
        archetypeIds: Array.isArray(p?.archetypeIds) ? p.archetypeIds.map(String) : [],
      })) : [],
      assetInventory: Array.isArray(parsed.assetInventory) ? parsed.assetInventory.map((a: any, i: number) => ({
        id: String(a?.id || `asset-${i}`),
        pillarId: String(a?.pillarId || 'pillar-playbook'),
        text: String(a?.text || ''),
        hasProof: !!a?.hasProof,
      })).filter((a: any) => a.text) : [],
    };

    return new Response(JSON.stringify({ brief }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e) {
    console.error('generate-strategy-brief error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
