// supabase/functions/describe-image/index.ts
// Secure Supabase Edge Function — calls OpenAI GPT-4o Vision API
// to generate a structured description of a lost/found item image.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { imageUrl, imageBase64, itemType = 'item' } = body;

    if (!imageUrl && !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageUrl or imageBase64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the image content — prefer URL (cheaper), fallback to base64
    const imageContent = imageUrl
      ? { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } }
      : { type: 'image_url', image_url: { url: imageBase64, detail: 'low' } };

    const prompt = `You are analyzing an image of a ${itemType === 'lost' ? 'lost' : 'found'} item for a lost-and-found platform.

Describe the item in detail covering:
1. Item type / category (e.g. wallet, phone, bag, keys)
2. Color(s) and pattern
3. Brand or logo if visible
4. Material or texture
5. Size (small / medium / large)
6. Distinctive features (scratches, stickers, engravings, etc.)
7. Condition

Be concise but specific. Format: plain paragraph, 2-3 sentences max.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              imageContent,
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return new Response(
        JSON.stringify({ error: 'OpenAI API error', detail: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(
      JSON.stringify({
        description,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('describe-image error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
