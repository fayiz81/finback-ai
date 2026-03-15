// src/hooks/useMatchNotification.ts
// Runs client-side after a successful item submission.
// Scores the new item against existing items, and if a match ≥ 40% is found,
// sends a "match found" email via EmailJS directly from the browser.

import emailjs from '@emailjs/browser';
import { supabase } from '@/lib/supabase';

// ── EmailJS credentials (set in .env) ────────────────────────────────────────
// VITE_EMAILJS_SERVICE_ID    → your EmailJS service ID
// VITE_EMAILJS_PUBLIC_KEY    → your EmailJS public key (User ID)
// VITE_EMAILJS_MATCH_TEMPLATE_ID → template with vars below
const SERVICE_ID   = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
const TEMPLATE_ID  = import.meta.env.VITE_EMAILJS_MATCH_TEMPLATE_ID as string;
const APP_URL      = import.meta.env.VITE_APP_URL || 'https://finback-ai.vercel.app';

// ── Scoring helpers ───────────────────────────────────────────────────────────
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
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'my', 'i', 'it', 'is', 'was', 'lost', 'found',
  ]);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
}

function textSim(a: string, b: string): number {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  const inter = [...ta].filter((t) => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return union > 0 ? inter / union : 0;
}

function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreMatch(lost: any, found: any): number {
  const cat = categorySimilarity(lost.category || '', found.category || '');
  const txt = textSim(
    `${lost.title} ${lost.description || ''}`,
    `${found.title} ${found.description || ''}`
  );
  const dist = distKm(
    lost.location_lat || 0, lost.location_lng || 0,
    found.location_lat || 0, found.location_lng || 0
  );
  const loc = Math.exp(-dist / 5);
  const diffDays =
    Math.abs(
      new Date(found.date_found || found.created_at).getTime() -
        new Date(lost.date_lost || lost.created_at).getTime()
    ) / 86_400_000;
  const time = Math.exp(-diffDays / 20);
  return Math.round((cat * 0.3 + txt * 0.3 + loc * 0.25 + time * 0.15) * 100) / 100;
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useMatchNotification() {
  /**
   * Call this right after a successful item creation.
   * @param newItem  The item just inserted (must have `id`, `type`, `user_id`, etc.)
   * @param ownerEmail  The submitting user's email address
   * @param ownerName   Display name for the greeting
   */
  const sendMatchNotificationIfFound = async (
    newItem: any,
    ownerEmail: string,
    ownerName: string
  ) => {
    try {
      if (!SERVICE_ID || !PUBLIC_KEY || !TEMPLATE_ID) {
        console.warn('[EmailJS] Missing env vars — skipping match notification.');
        return;
      }

      // Fetch up to 100 opposite-type items to score against
      const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
      const { data: candidates, error } = await supabase
        .from('items')
        .select('*')
        .eq('type', oppositeType)
        .neq('id', newItem.id)          // exclude self (shouldn't happen, but safe)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !candidates || candidates.length === 0) return;

      // Score & pick the best match (must be ≥ 40%)
      const scored = candidates
        .map((c) => ({
          item: c,
          score:
            newItem.type === 'lost'
              ? scoreMatch(newItem, c)
              : scoreMatch(c, newItem),
        }))
        .filter((m) => m.score >= 0.4)
        .sort((a, b) => b.score - a.score);

      if (scored.length === 0) return;

      const best = scored[0];
      const pct  = Math.round(best.score * 100);
      const lostItem  = newItem.type === 'lost' ? newItem : best.item;
      const foundItem = newItem.type === 'found' ? newItem : best.item;

      // ── Send email via EmailJS ──────────────────────────────────────────────
      // Your EmailJS template must have these variables:
      //   {{to_email}}, {{to_name}}, {{lost_title}}, {{found_title}},
      //   {{confidence_pct}}, {{found_location}}, {{found_date}}, {{match_url}}
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email:       ownerEmail,
          to_name:        ownerName,
          lost_title:     lostItem.title,
          found_title:    foundItem.title,
          confidence_pct: `${pct}%`,
          found_location:
            foundItem.location_name ||
            `${foundItem.location_lat?.toFixed(4)}, ${foundItem.location_lng?.toFixed(4)}`,
          found_date: new Date(
            foundItem.date_found || foundItem.created_at
          ).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          }),
          match_url: `${APP_URL}/matches`,
        },
        PUBLIC_KEY
      );

      console.log(`[EmailJS] Match notification sent (${pct}% confidence)`);
    } catch (err) {
      // Non-fatal — item is already saved, just log the error
      console.error('[EmailJS] Failed to send match notification:', err);
    }
  };

  return { sendMatchNotificationIfFound };
}
