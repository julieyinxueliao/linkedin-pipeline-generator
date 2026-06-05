import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface Body {
  samples?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const body = (await req.json().catch(() => ({}))) as Body;
    const samples = Array.isArray(body.samples) ? body.samples.map((s) => String(s || '').trim()).filter(Boolean) : [];
    if (!samples.length) {
      return new Response(JSON.stringify({ error: 'Provide at least one writing sample' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You analyze a founder's personal writing voice from samples they wrote (LinkedIn posts, essays, or short answers). Return ONLY valid JSON in this shape:
{ "traits": string[] }
Rules:
- Return 4 to 6 traits.
- Each trait must be SPECIFIC to what you observe in the samples, not generic platitudes.
- Each trait is a short phrase, max 8 words. Examples of good shape: "Opens with a contrarian one-liner", "Uses short paragraphs and line breaks", "Prefers concrete numbers over adjectives".
- Do not include hedges like "tends to" or "often".
- Do not invent traits not supported by the samples.`;

    const user = samples.map((s, i) => `--- Sample ${i + 1} ---\n${s.slice(0, 4000)}`).join('\n\n');

    const aiRes = await fetch(AI_GATEWAY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error(`AI gateway ${aiRes.status}`);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const traits = Array.isArray(parsed.traits) ? parsed.traits.map(String).filter(Boolean).slice(0, 6) : [];

    return new Response(JSON.stringify({ traits }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e) {
    console.error('analyze-voice error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
