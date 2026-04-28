import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { buildEnhancedMatches, type EnhancedMatch } from '@/lib/index';

export function useItems(filters?: { status?: string; search?: string; category?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);

  async function load() {
    setLoading(true);
    let query = supabase.from('items').select('*').order('created_at', { ascending: false });
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();

    // ✅ Unique channel name per hook instance — prevents silent collision when
    //    multiple pages (Dashboard + Browse) each call useItems() simultaneously.
    //    Supabase only allows ONE subscriber per channel name; duplicates are dropped.
    const channelId = `items-rt-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => {
          load(); // re-fetch the full list when anything changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters?.status, filters?.search, filters?.category]);

  // Convert any image (including HEIC) to JPEG via canvas before upload
  const convertToJpeg = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // If already a web-safe format, return as-is
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
        resolve(file);
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const jpegFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
            resolve(jpegFile);
          } else {
            resolve(file); // fallback to original if conversion fails
          }
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  };

  const createItem = async (item: any, imageFile?: File) => {
    let image_url = null;
    if (imageFile) {
      const safeFile = await convertToJpeg(imageFile);
      // Use a simple clean filename — no special chars, no spaces
      const ext = safeFile.type === 'image/png' ? 'png' : safeFile.type === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `img_${Date.now()}.${ext}`;
      // Get fresh session to ensure auth token is attached to storage request
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session before upload:', session?.user?.email, 'token:', !!session?.access_token);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, safeFile, { contentType: safeFile.type || 'image/jpeg', upsert: true });
      if (uploadError) {
        console.error('Image upload error full:', JSON.stringify(uploadError));
        // Try without auth as fallback (public bucket)
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/item-images/${fileName}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': safeFile.type || 'image/jpeg',
              'x-upsert': 'true',
            },
            body: safeFile,
          }
        );
        if (response.ok) {
          image_url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/item-images/${fileName}`;
          console.log('Image uploaded via fallback:', image_url);
        } else {
          const errText = await response.text();
          console.error('Fallback upload failed:', errText);
        }
      } else if (uploadData) {
        const { data: url } = supabase.storage.from('item-images').getPublicUrl(uploadData.path);
        image_url = url.publicUrl;
        console.log('Image uploaded successfully:', image_url);
      }
    }
    const { data, error } = await supabase
      .from('items')
      .insert([{ ...item, image_url }])
      .select()
      .single();

    // ✅ Real-time subscription will auto-update all hooks,
    //    but also push optimistically to local state immediately
    if (data) setItems(prev => [data, ...prev]);
    return { data, error };
  };

  const lostItems = items.filter((i) => i.type === 'lost');
  const foundItems = items.filter((i) => i.type === 'found');

  // ── Live AI matches — recomputed whenever items change ────────────────────
  const matches: EnhancedMatch[] = buildEnhancedMatches(lostItems, foundItems, 0.25);

  const getUserItems = (userId: string) => ({
    lostItems: items.filter((i) => i.user_id === userId && i.type === 'lost'),
    foundItems: items.filter((i) => i.user_id === userId && i.type === 'found'),
  });

  const getMatchesForItem = (itemId: string) =>
    matches.filter(m => m.lostItem?.id === itemId || m.foundItem?.id === itemId);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err)
      );
    });
  };

  return {
    items,
    loading,
    isProcessingMatch,
    lostItems,
    foundItems,
    matches,
    createItem,
    getUserItems,
    getMatchesForItem,
    getCurrentLocation,
    refetch: load,
  };
}
