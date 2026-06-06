import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface DraftInputs {
  archetypeId: string;
  archetypeName: string;
  archetypeDescription: string;
  skeleton: string[];
  funnelStage: string;
  ctaType: 'none' | 'soft' | 'comment-gated' | 'hard';
  pillarName: string;
  workingAngle: string;
  brief: {
    companyName: string;
    companyOneLiner: string;
    wedge: string;
    icpTitles: string;
    icpCompanyType: string;
    proofPoints: string[];
    categoryPov: string;
    positioning: string;
  };
  voiceTraits: string[];
  samplePosts: string[];
}

const SYSTEM_PROMPT = `You are a senior B2B ghostwriter drafting a single LinkedIn post for a founder. Follow these rules without exception:

1. Write in the founder's voice — use the provided voice traits and sample posts to match tone, cadence, sentence length, and vocabulary. If no samples are given, use a clean operator tone: direct, specific, no jargon, no hype.
2. Follow the archetype's skeleton in order. Every section of the skeleton must appear as a beat in the post (not as a literal heading).
3. NEVER invent metrics, customer names, dollar amounts, percentages, or specific outcomes. If the archetype calls for a number and none is supplied in the proofPoints, write [INSERT METRIC] literally.
4. Use short lines. White space between beats. LinkedIn-native formatting (line breaks, no markdown headers, no hashtags unless natural).
5. Hook in the first line. No throat-clearing ("In today's world…", "I've been thinking…").
6. Match the CTA type exactly:
   - none: end on the insight, no call to action
   - soft: a curious open question to the reader
   - comment-gated: "comment [WORD] and I'll DM you…"
   - hard: a clear, specific ask to talk / try / DM
7. 120–250 words. No emojis. No "TL;DR". No closing signature.
8. Return ONLY the post body. No preamble, no explanation, no quotes around it.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const inputs = (await req.json().catch(() => ({}))) as DraftInputs;
    if (!inputs?.archetypeId || !inputs?.brief) {
      return new Response(JSON.stringify({ error: 'Missing archetype or brief' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPayload = `Archetype: ${inputs.archetypeName} — ${inputs.archetypeDescription}
Skeleton (follow in order):
${inputs.skeleton.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

Funnel stage: ${inputs.funnelStage}
Pillar: ${inputs.pillarName}
CTA type: ${inputs.ctaType}
Working angle (this post's specific take): ${inputs.workingAngle}

Company: ${inputs.brief.companyName}
One-liner: ${inputs.brief.companyOneLiner}
Wedge / category to own: ${inputs.brief.wedge}
ICP titles: ${inputs.brief.icpTitles}
ICP company type: ${inputs.brief.icpCompanyType}
Positioning: ${inputs.brief.positioning}
Category POV: ${inputs.brief.categoryPov}
Proof points (use VERBATIM if needed — do not invent more):
${inputs.brief.proofPoints.length ? inputs.brief.proofPoints.map((p) => `  - ${p}`).join('\n') : '  (none — use [INSERT METRIC] where a number would go)'}

Voice traits: ${inputs.voiceTraits.length ? inputs.voiceTraits.join(', ') : '(not calibrated — use a clean operator tone)'}
${inputs.samplePosts.length ? `\nReference posts (mirror cadence, NOT content):\n${inputs.samplePosts.slice(0, 2).map((s, i) => `--- SAMPLE ${i + 1} ---\n${s.slice(0, 1200)}`).join('\n\n')}` : ''}

Write the post now.`;

    const aiRes = await fetch(AI_GATEWAY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPayload },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded — try again in a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in workspace settings.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const t = await aiRes.text();
      console.error('AI gateway error', aiRes.status, t);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error('draft-post error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
