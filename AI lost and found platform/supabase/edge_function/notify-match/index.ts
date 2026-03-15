// supabase/functions/notify-match/index.ts
// Triggered automatically via Supabase Database Webhook when a new item is inserted.
// Also callable manually from the Admin notifications panel.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL = 'FinBack AI <notifications@finback.ai>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Send email via Resend ────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
}

// ── Email templates ──────────────────────────────────────────────────────────
function matchFoundTemplate(opts: {
  userName: string;
  lostTitle: string;
  foundTitle: string;
  confidence: number;
  foundLocation: string;
  foundDate: string;
  matchUrl: string;
}) {
  const pct = Math.round(opts.confidence * 100);
  const color = pct >= 70 ? '#34d399' : pct >= 45 ? '#fbbf24' : '#f87171';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0e0e18;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;margin-bottom:8px;">🎯</div>
          <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;">Potential Match Found!</h1>
          <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">FinBack AI has found a ${pct}% confidence match for your lost item</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 8px;font-size:15px;color:#9ca3af;">Hi <strong style="color:#e5e7eb;">${opts.userName}</strong>,</p>
          <p style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6;">
            Our AI engine detected a potential match for your lost item. Here are the details:
          </p>

          <!-- Match comparison -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <!-- Lost item -->
              <td width="45%" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:16px;vertical-align:top;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#f87171;text-transform:uppercase;margin-bottom:8px;">Your Lost Item</div>
                <div style="font-size:15px;font-weight:600;color:#f3f4f6;">${opts.lostTitle}</div>
              </td>
              <!-- Arrow -->
              <td width="10%" align="center" style="vertical-align:middle;padding:0 8px;">
                <div style="font-size:20px;color:#6d28d9;">→</div>
              </td>
              <!-- Found item -->
              <td width="45%" style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:12px;padding:16px;vertical-align:top;">
                <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#34d399;text-transform:uppercase;margin-bottom:8px;">Found Item</div>
                <div style="font-size:15px;font-weight:600;color:#f3f4f6;">${opts.foundTitle}</div>
              </td>
            </tr>
          </table>

          <!-- Confidence badge -->
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:rgba(109,40,217,0.15);border:1px solid rgba(109,40,217,0.3);border-radius:50px;padding:10px 24px;">
              <span style="font-size:28px;font-weight:800;color:${color};font-family:monospace;">${pct}%</span>
              <span style="font-size:13px;color:#9ca3af;margin-left:8px;">AI Confidence</span>
            </div>
          </div>

          <!-- Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:28px;">
            <tr>
              <td style="padding:6px 0;">
                <span style="font-size:12px;color:#6b7280;">📍 Found at:</span>
                <span style="font-size:13px;color:#e5e7eb;margin-left:8px;font-weight:500;">${opts.foundLocation}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;border-top:1px solid rgba(255,255,255,0.05);">
                <span style="font-size:12px;color:#6b7280;">📅 Found on:</span>
                <span style="font-size:13px;color:#e5e7eb;margin-left:8px;font-weight:500;">${opts.foundDate}</span>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${opts.matchUrl}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#4f46e5);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;letter-spacing:0.3px;">
              View Match Details →
            </a>
          </div>

          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
            If this isn't your item, you can dismiss this match from the platform. Our AI improves with every confirmation.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:12px;color:#4b5563;">
            FinBack AI · Campus Lost & Found Platform<br>
            <a href="${opts.matchUrl}" style="color:#6d28d9;text-decoration:none;">View on FinBack AI</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminNotificationTemplate(opts: {
  subject: string;
  message: string;
  appUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090f;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0e0e18;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:28px 40px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;">📣 ${opts.subject}</h1>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Message from FinBack AI</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="font-size:15px;color:#d1d5db;line-height:1.7;margin:0 0 28px;">${opts.message}</p>
          <div style="text-align:center;">
            <a href="${opts.appUrl}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#4f46e5);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;">
              Open FinBack AI →
            </a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:12px;color:#4b5563;">FinBack AI · Campus Lost & Found</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Build enhanced matches (same logic as frontend) ─────────────────────────
function categorySimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  const groups: Record<string, string> = {
    Electronics: 'tech', Accessories: 'personal', Documents: 'paper',
    Clothing: 'wear', Books: 'paper', Keys: 'personal',
    Bags: 'carry', 'Sports Equipment': 'activity', Jewelry: 'personal', Other: 'misc',
  };
  return groups[a] && groups[a] === groups[b] ? 0.5 : 0.1;
}
function tokenize(text: string): string[] {
  const stop = new Set(['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'my', 'i', 'it', 'is', 'was', 'lost', 'found']);
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
}
function textSim(a: string, b: string): number {
  const ta = new Set(tokenize(a)), tb = new Set(tokenize(b));
  const inter = [...ta].filter(t => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return union > 0 ? inter / union : 0;
}
function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function scoreMatch(lost: any, found: any): number {
  const cat = categorySimilarity(lost.category || '', found.category || '');
  const txt = textSim((lost.title + ' ' + (lost.description || '')), (found.title + ' ' + (found.description || '')));
  const dist = distKm(lost.location_lat || 0, lost.location_lng || 0, found.location_lat || 0, found.location_lng || 0);
  const loc = Math.exp(-dist / 5);
  const diffDays = Math.abs(new Date(found.date_found || found.created_at).getTime() - new Date(lost.date_lost || lost.created_at).getTime()) / 86400000;
  const time = Math.exp(-diffDays / 20);
  return Math.round((cat * 0.3 + txt * 0.3 + loc * 0.25 + time * 0.15) * 100) / 100;
}

// ── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const APP_URL = Deno.env.get('APP_URL') || 'https://finback-ai.vercel.app';

    // ── Mode 1: Database webhook — new item inserted ────────────────────────
    // Called automatically when a new row is inserted into `items`.
    if (body.type === 'INSERT' && body.record) {
      const newItem = body.record;

      // Fetch all items of the opposite type to find matches
      const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
      const { data: candidates } = await supabase
        .from('items')
        .select('*')
        .eq('type', oppositeType)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!candidates || candidates.length === 0) {
        return new Response(JSON.stringify({ sent: 0, reason: 'no candidates' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Score all candidates and keep those above 40%
      const matches = candidates
        .map(c => ({
          item: c,
          score: newItem.type === 'lost' ? scoreMatch(newItem, c) : scoreMatch(c, newItem),
        }))
        .filter(m => m.score >= 0.4)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // top 3 matches max

      if (matches.length === 0) {
        return new Response(JSON.stringify({ sent: 0, reason: 'no matches above threshold' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Get the user who owns the new item
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const owner = users.find((u: any) => u.id === newItem.user_id);
      if (!owner?.email) {
        return new Response(JSON.stringify({ sent: 0, reason: 'owner email not found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const bestMatch = matches[0];
      const lostItem = newItem.type === 'lost' ? newItem : bestMatch.item;
      const foundItem = newItem.type === 'found' ? newItem : bestMatch.item;

      await sendEmail(
        owner.email,
        `🎯 ${Math.round(bestMatch.score * 100)}% Match Found for "${newItem.title}"`,
        matchFoundTemplate({
          userName: owner.user_metadata?.full_name || owner.email.split('@')[0],
          lostTitle: lostItem.title,
          foundTitle: foundItem.title,
          confidence: bestMatch.score,
          foundLocation: foundItem.location_name || `${foundItem.location_lat?.toFixed(4)}, ${foundItem.location_lng?.toFixed(4)}`,
          foundDate: new Date(foundItem.date_found || foundItem.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          matchUrl: `${APP_URL}/matches`,
        })
      );

      // Also notify the finder if it was a lost item that was just submitted
      // (so the person who found it knows someone is looking)
      if (newItem.type === 'lost') {
        const finder = users.find((u: any) => u.id === bestMatch.item.user_id);
        if (finder?.email && finder.email !== owner.email) {
          await sendEmail(
            finder.email,
            `Someone is looking for the item you found: "${bestMatch.item.title}"`,
            matchFoundTemplate({
              userName: finder.user_metadata?.full_name || finder.email.split('@')[0],
              lostTitle: lostItem.title,
              foundTitle: foundItem.title,
              confidence: bestMatch.score,
              foundLocation: foundItem.location_name || '',
              foundDate: new Date(foundItem.date_found || foundItem.created_at).toLocaleDateString(),
              matchUrl: `${APP_URL}/matches`,
            })
          );
        }
      }

      return new Response(JSON.stringify({ sent: 1, score: bestMatch.score }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Mode 2: Manual admin broadcast ─────────────────────────────────────
    // Called from the Admin Notifications panel.
    if (body.type === 'broadcast') {
      const { subject, message, target } = body; // target: 'all' | 'lost' | 'found'

      const { data: { users } } = await supabase.auth.admin.listUsers();

      let targetEmails: string[] = [];

      if (target === 'all') {
        targetEmails = users.filter((u: any) => u.email_confirmed_at).map((u: any) => u.email);
      } else {
        // Get user_ids who have items of the target type
        const { data: items } = await supabase.from('items').select('user_id').eq('type', target);
        const ids = new Set((items || []).map((i: any) => i.user_id));
        targetEmails = users
          .filter((u: any) => ids.has(u.id) && u.email_confirmed_at)
          .map((u: any) => u.email);
      }

      if (targetEmails.length === 0) {
        return new Response(JSON.stringify({ sent: 0, reason: 'no target emails' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Send in batches of 10 to respect Resend rate limits
      const BATCH = 10;
      let sent = 0;
      for (let i = 0; i < targetEmails.length; i += BATCH) {
        const batch = targetEmails.slice(i, i + BATCH);
        await Promise.all(batch.map(email =>
          sendEmail(email, subject, adminNotificationTemplate({ subject, message, appUrl: APP_URL }))
            .catch(err => console.error(`Failed to send to ${email}:`, err))
        ));
        sent += batch.length;
        // Small delay between batches to avoid rate limiting
        if (i + BATCH < targetEmails.length) await new Promise(r => setTimeout(r, 200));
      }

      return new Response(JSON.stringify({ sent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown request type' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
});
