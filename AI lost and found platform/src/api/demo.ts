const API = '/api';

export interface Item {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url: string | null;
  status: 'lost' | 'found';
  created_at: string;
}

export async function getItems(filters?: {
  status?: 'lost' | 'found' | 'all';
  search?: string;
}): Promise<Item[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);

  const res  = await fetch(`${API}/items?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data.items;
}

export async function getItem(id: string): Promise<Item> {
  const res  = await fetch(`${API}/items/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data.item;
}

export async function createItem(item: {
  title: string;
  description: string;
  location: string;
  image_url?: string;
  status: 'lost' | 'found';
}): Promise<Item> {
  const res  = await fetch(`${API}/items`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(item),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data.item;
}

export async function deleteItem(id: string): Promise<void> {
  const res  = await fetch(`${API}/items/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
}
