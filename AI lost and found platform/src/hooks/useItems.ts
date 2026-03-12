import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

    // ✅ Real-time subscription — re-fetch on any INSERT, UPDATE, or DELETE
    const channel = supabase
      .channel('items-realtime')
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

  const createItem = async (item: any, imageFile?: File) => {
    let image_url = null;
    if (imageFile) {
      const { data } = await supabase.storage
        .from('item-images')
        .upload(`${Date.now()}-${imageFile.name}`, imageFile);
      if (data) {
        const { data: url } = supabase.storage.from('item-images').getPublicUrl(data.path);
        image_url = url.publicUrl;
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

  const getUserItems = (userId: string) => ({
    lostItems: items.filter((i) => i.user_id === userId && i.type === 'lost'),
    foundItems: items.filter((i) => i.user_id === userId && i.type === 'found'),
  });

  const matches: any[] = [];
  const getMatchesForItem = (_itemId: string) => [];

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
