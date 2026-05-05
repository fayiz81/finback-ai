// src/lib/imageMatch.ts
// Client-side helpers for AI-powered image description.
// Calls our secure Supabase Edge Function — API key never exposed to browser.

import { supabase } from '@/lib/supabase';

// ─── Convert File → Base64 data URL ──────────────────────────────────────────
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

// ─── Get AI description from an image URL (after upload) ─────────────────────
export async function getImageDescription(
  imageUrl: string,
  itemType: 'lost' | 'found' = 'lost'
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('describe-image', {
      body: { imageUrl, itemType },
    });

    if (error) {
      console.error('describe-image edge function error:', error);
      return null;
    }

    return data?.description ?? null;
  } catch (err) {
    console.error('getImageDescription failed:', err);
    return null;
  }
}

// ─── Get AI description from a base64 image (before upload) ──────────────────
export async function getImageDescriptionFromBase64(
  base64: string,
  itemType: 'lost' | 'found' = 'lost'
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('describe-image', {
      body: { imageBase64: base64, itemType },
    });

    if (error) {
      console.error('describe-image edge function error:', error);
      return null;
    }

    return data?.description ?? null;
  } catch (err) {
    console.error('getImageDescriptionFromBase64 failed:', err);
    return null;
  }
}

// ─── Enrich a user description with AI image analysis ────────────────────────
// Appends AI-generated details to the user's typed description
export async function enrichDescription(
  userDescription: string,
  imageUrl: string | null,
  itemType: 'lost' | 'found' = 'lost'
): Promise<string> {
  if (!imageUrl) return userDescription;

  const aiDesc = await getImageDescription(imageUrl, itemType);
  if (!aiDesc) return userDescription;

  // If user wrote nothing, use AI description directly
  if (!userDescription.trim()) return aiDesc;

  // Merge: user description first, then AI details
  return `${userDescription.trim()} [AI Analysis: ${aiDesc}]`;
}
