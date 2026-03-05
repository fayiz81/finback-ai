export const ROUTE_PATHS = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  BROWSE: '/browse',
  SUBMIT: '/submit',
  MATCHES: '/matches',
  ADMIN: '/admin',
  AUTH: '/auth',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const ITEM_CATEGORIES = [
  'Electronics',
  'Accessories',
  'Documents',
  'Clothing',
  'Books',
  'Keys',
  'Bags',
  'Sports Equipment',
  'Jewelry',
  'Other',
] as const;

export interface User {
  id: string;
  email: string;
  name: string;
  role: typeof USER_ROLES[keyof typeof USER_ROLES];
  avatar?: string;
  createdAt: Date;
}

export interface LostItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: typeof ITEM_CATEGORIES[number];
  imageUrl: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  dateLost: Date;
  status: 'active' | 'matched' | 'resolved';
  createdAt: Date;
}

export interface FoundItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: typeof ITEM_CATEGORIES[number];
  imageUrl: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  dateFound: Date;
  status: 'active' | 'matched' | 'resolved';
  createdAt: Date;
}

export interface MatchResult {
  id: string;
  lostItemId: string;
  foundItemId: string;
  confidenceScore: number;
  breakdown: {
    imageSimilarity: number;
    textSimilarity: number;
    locationProximity: number;
    timeProximity: number;
  };
  status: 'pending' | 'contacted' | 'confirmed' | 'rejected';
  createdAt: Date;
}

export const calculateMatchScore = (
  imageSim: number,
  textSim: number,
  locationProx: number,
  timeProx: number
): number => {
  const weights = {
    image: 0.4,
    text: 0.3,
    location: 0.2,
    time: 0.1,
  };

  const score =
    imageSim * weights.image +
    textSim * weights.text +
    locationProx * weights.location +
    timeProx * weights.time;

  return Math.round(score * 100) / 100;
};

export const getDistanceInKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const normalizeScore = (value: number, max: number): number => {
  return Math.max(0, Math.min(1, 1 - value / max));
};
