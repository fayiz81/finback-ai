import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useItems(filters?: { status?: string; search?: string; category?: string }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let query = supabase.from('items').select('*').order('created_at', { ascending: false });
      if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
      const { data } = await query;
      setItems(data || []);
      setLoading(false);
    }
    load();
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
    const { data } = await supabase.from('items').insert([{ ...item, image_url }]).select().single();
    if (data) setItems(prev => [data, ...prev]);
    return data;
  };

  return { items, loading, createItem };
}
