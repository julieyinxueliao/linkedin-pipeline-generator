import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface RefineRequest {
  fieldLabel: string;
  currentValue: string;
  instruction: string;
  context?: string;
  multiline?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const body = (await req.json().catch(() => ({}))) as RefineRequest;
    const { fieldLabel, currentValue, instruction, context, multiline } = body;
    if (!fieldLabel || typeof currentValue !== 'string' || !instruction) {
      return new Response(JSON.stringify({ error: 'fieldLabel, currentValue, instruction required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a senior B2B content strategist helping a founder refine their LinkedIn strategy brief. Rewrite the field below per the user's instruction.

RULES:
- Return ONLY the rewritten field text. No preamble, no quotes, no markdown.
- Keep it punchy, specific, and provocative. No corporate filler.
- ${multiline ? 'May span multiple short sentences.' : 'Keep it to ONE bold sentence unless the instruction says otherwise.'}
- Never invent metrics or customer names. Use [INSERT METRIC] if a number is missing.
- Preserve the user's voice from the broader brief context.`;

    const userPayload = `FIELD: ${fieldLabel}

CURRENT VALUE:
${currentValue || '(empty)'}

USER INSTRUCTION:
${instruction}

${context ? `BRIEF CONTEXT (for voice/specificity only):\n${context.slice(0, 2500)}` : ''}`;

    const aiRes = await fetch(AI_GATEWAY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
    let text = String(aiJson?.choices?.[0]?.message?.content ?? '').trim();
    // strip wrapping quotes if model added them
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('"') && text.endsWith('"'))) {
      text = text.slice(1, -1).trim();
    }

    return new Response(JSON.stringify({ value: text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e) {
    console.error('refine-field error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
