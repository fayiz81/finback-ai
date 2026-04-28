// src/hooks/useMatchNotification.ts
// Sends automatic email via EmailJS when a new item is submitted and a match is found.
// Usage: call sendMatchEmail(newItem, matchedItem, confidence, ownerEmail, ownerName) after item insert.

import emailjs from '@emailjs/browser';
import { EMAILJS_TEMPLATE_ID } from '@/lib/index';

const EMAILJS_SERVICE_ID  = 'service_0gpttgh';
const EMAILJS_PUBLIC_KEY  = '8WuJMcm-wl0Ho8cYA';

export async function sendMatchEmail(opts: {
  toEmail: string;
  userName: string;
  lostTitle: string;
  foundTitle: string;
  confidence: number;
  foundLocation: string;
  foundDate: string;
}) {
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email:       opts.toEmail,
        user_name:      opts.userName,
        lost_title:     opts.lostTitle,
        found_title:    opts.foundTitle,
        confidence:        Math.round(opts.confidence * 100),
        confidence_offset: Math.round(289 - opts.confidence * 289),
        found_location: opts.foundLocation || 'Unknown',
        found_date:     opts.foundDate,
        match_url:      'https://finback-ai.vercel.app/matches',
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log('Match notification sent to', opts.toEmail);
    return true;
  } catch (err) {
    console.error('EmailJS error:', err);
    return false;
  }
}
