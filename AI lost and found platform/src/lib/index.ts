// ─── Constants ────────────────────────────────────────────────────────────────
export const ROUTE_PATHS = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  BROWSE: '/browse',
  SUBMIT: '/submit',
  MATCHES: '/matches',
  ADMIN: '/admin',
  AUTH: '/auth',
} as const;

export const USER_ROLES = { USER: 'user', ADMIN: 'admin' } as const;

export const ITEM_CATEGORIES = [
  'Electronics','Accessories','Documents','Clothing','Books',
  'Keys','Bags','Sports Equipment','Jewelry','Other',
] as const;

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface User {
  id: string; email: string; name: string;
  role: typeof USER_ROLES[keyof typeof USER_ROLES];
  avatar?: string; createdAt: Date;
}
export interface LostItem {
  id: string; userId: string; title: string; description: string;
  category: typeof ITEM_CATEGORIES[number]; imageUrl: string;
  location: { name: string; lat: number; lng: number };
  dateLost: Date; status: 'active' | 'matched' | 'resolved'; createdAt: Date;
}
export interface FoundItem {
  id: string; userId: string; title: string; description: string;
  category: typeof ITEM_CATEGORIES[number]; imageUrl: string;
  location: { name: string; lat: number; lng: number };
  dateFound: Date; status: 'active' | 'matched' | 'resolved'; createdAt: Date;
}
export interface MatchResult {
  id: string; lostItemId: string; foundItemId: string; confidenceScore: number;
  breakdown: {
    imageSimilarity: number; textSimilarity: number;
    locationProximity: number; timeProximity: number;
    colorMatch: number; brandMatch: number; physicalDescMatch: number;
  };
  status: 'pending' | 'contacted' | 'confirmed' | 'rejected';
  createdAt: Date;
}

// ─── Geo ──────────────────────────────────────────────────────────────────────
export const getDistanceInKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getDaysDifference = (date1: Date, date2: Date): number =>
  Math.ceil(Math.abs(date2.getTime() - date1.getTime()) / (1000*60*60*24));

export const normalizeScore = (value: number, max: number): number =>
  Math.max(0, Math.min(1, 1 - value / max));

// ─── NLP helpers ─────────────────────────────────────────────────────────────

// Common stop words to ignore
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'my','i','it','its','this','that','is','was','lost','found','have','has',
  'been','near','around','last','about','some','very','really',
]);

// Color words detector
const COLOR_WORDS = new Set([
  'black','white','red','blue','green','yellow','orange','purple','pink',
  'brown','grey','gray','silver','gold','navy','beige','cream','maroon',
  'teal','cyan','magenta','rose','indigo','violet','lime','tan','khaki',
]);

// Brand/maker words
const BRAND_PATTERNS = [
  /apple|iphone|ipad|macbook|airpods/i,
  /samsung|galaxy/i,
  /sony|bose|jbl|beats/i,
  /nike|adidas|puma|reebok/i,
  /hp|dell|lenovo|asus|acer/i,
  /gucci|louis|vuitton|prada|zara|hm/i,
  /canon|nikon|gopro/i,
];

function extractTokens(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function extractColors(tokens: string[]): string[] {
  return tokens.filter(t => COLOR_WORDS.has(t));
}

function extractBrands(text: string): string[] {
  return BRAND_PATTERNS.filter(p => p.test(text)).map(p => p.source);
}

function extractPhysicalDesc(tokens: string[]): string[] {
  // Size, material, distinctive feature words
  const physWords = new Set([
    'large','small','big','tiny','mini','pro','max','plus','lite','old','new',
    'leather','metal','plastic','wooden','fabric','rubber','glass','canvas',
    'broken','scratched','cracked','new','old','vintage','worn','torn',
    'case','cover','pouch','bag','strap','handle',
  ]);
  return tokens.filter(t => physWords.has(t));
}

// TF-IDF inspired token importance scoring
function tokenImportance(token: string, allDocs: string[][]): number {
  const df = allDocs.filter(doc => doc.includes(token)).length;
  const idf = df > 0 ? Math.log(allDocs.length / df) + 1 : 1;
  // Boost rare, specific words
  const lengthBonus = token.length > 6 ? 1.5 : 1;
  return idf * lengthBonus;
}

// Jaccard + weighted token overlap
function advancedTextSimilarity(a: string, b: string, allDocs: string[][] = []): number {
  const tokA = extractTokens(a);
  const tokB = extractTokens(b);
  if (tokA.length === 0 || tokB.length === 0) return 0;

  const setA = new Set(tokA);
  const setB = new Set(tokB);
  const intersection = [...setA].filter(t => setB.has(t));
  const union = new Set([...setA, ...setB]);

  // Weighted overlap: important/rare tokens count more
  const weightedScore = intersection.reduce((sum, tok) => {
    const imp = tokenImportance(tok, allDocs.length > 0 ? allDocs : [tokA, tokB]);
    return sum + imp;
  }, 0);
  const maxWeight = [...union].reduce((sum, tok) => sum + tokenImportance(tok, allDocs.length > 0 ? allDocs : [tokA, tokB]), 0);

  const jaccard = intersection.length / union.size;
  const weighted = maxWeight > 0 ? weightedScore / maxWeight : 0;

  return Math.min(1, jaccard * 0.4 + weighted * 0.6);
}

function colorSimilarity(textA: string, textB: string): number {
  const colA = extractColors(extractTokens(textA));
  const colB = extractColors(extractTokens(textB));
  if (colA.length === 0 && colB.length === 0) return 0.5; // neutral — no color mentioned
  if (colA.length === 0 || colB.length === 0) return 0.3;
  const shared = colA.filter(c => colB.includes(c)).length;
  return shared > 0 ? Math.min(1, 0.6 + shared * 0.2) : 0;
}

function brandSimilarity(textA: string, textB: string): number {
  const brA = extractBrands(textA);
  const brB = extractBrands(textB);
  if (brA.length === 0 && brB.length === 0) return 0.5; // neutral
  if (brA.length === 0 || brB.length === 0) return 0.2;
  const shared = brA.filter(b => brB.includes(b)).length;
  return shared > 0 ? 1.0 : 0.0;
}

function physicalDescSimilarity(textA: string, textB: string): number {
  const pA = extractPhysicalDesc(extractTokens(textA));
  const pB = extractPhysicalDesc(extractTokens(textB));
  if (pA.length === 0 && pB.length === 0) return 0.5;
  const shared = pA.filter(p => pB.includes(p)).length;
  const total = new Set([...pA, ...pB]).size;
  return total > 0 ? shared / total : 0.3;
}

// Category semantic groupings — nearby categories get partial credit
const CATEGORY_GROUPS: Record<string, string> = {
  'Electronics': 'tech', 'Accessories': 'personal',
  'Documents': 'paper', 'Clothing': 'wear',
  'Books': 'paper', 'Keys': 'personal',
  'Bags': 'carry', 'Sports Equipment': 'activity',
  'Jewelry': 'personal', 'Other': 'misc',
};

function categorySimilarity(catA: string, catB: string): number {
  if (catA === catB) return 1.0;
  if (CATEGORY_GROUPS[catA] && CATEGORY_GROUPS[catA] === CATEGORY_GROUPS[catB]) return 0.5;
  return 0.1;
}

// ─── Image similarity proxy ───────────────────────────────────────────────────
// Without a real vision model, we use all available textual signals to estimate
// visual similarity. This is significantly better than a fixed 0.65 baseline.
function estimatedImageSimilarity(
  lostText: string, foundText: string,
  catSim: number, colorSim: number, brandSim: number
): number {
  // Visual appearance is heavily driven by: category + color + brand + physical desc
  const physA = extractPhysicalDesc(extractTokens(lostText));
  const physB = extractPhysicalDesc(extractTokens(foundText));
  const physShared = physA.filter(p => physB.includes(p)).length;
  const physScore = physA.length + physB.length > 0 ? (2 * physShared) / (physA.length + physB.length) : 0.3;

  const score = catSim * 0.35 + colorSim * 0.30 + brandSim * 0.25 + physScore * 0.10;
  // Clamp and add a small baseline (items are at least somewhat similar if being compared)
  return Math.min(1, Math.max(0.1, score));
}

// ─── Location scoring — adaptive radius ───────────────────────────────────────
function adaptiveLocationScore(distKm: number, category: string): number {
  // Small items (keys, jewelry, docs) are less likely found far away
  const smallItemCats = new Set(['Keys','Jewelry','Documents','Accessories']);
  const maxKm = smallItemCats.has(category) ? 2 : 15;
  // Exponential decay rather than linear
  return Math.exp(-distKm / (maxKm * 0.5));
}

// ─── Time scoring — asymmetric ────────────────────────────────────────────────
// Found item should be AFTER lost item; reward that, penalize reverse
function adaptiveTimeScore(lostDate: Date, foundDate: Date): number {
  const diffDays = (foundDate.getTime() - lostDate.getTime()) / (1000*60*60*24);
  if (diffDays < 0) {
    // Found BEFORE lost — possible but unlikely; strong penalty
    return Math.max(0, 0.3 + diffDays * 0.02);
  }
  // Reward same-day/next-day, decay over 60 days
  return Math.exp(-diffDays / 20);
}

// ─── Master scoring function (upgraded weights) ───────────────────────────────
export interface EnhancedBreakdown {
  imageSimilarity: number;
  textSimilarity: number;
  locationProximity: number;
  timeProximity: number;
  colorMatch: number;
  brandMatch: number;
  physicalDescMatch: number;
  categorySimilarity: number;
  confidence: 'high' | 'medium' | 'low';
  signals: string[]; // human-readable reasons
}

export interface EnhancedMatch {
  id: string;
  lostItem: any;
  foundItem: any;
  confidenceScore: number;
  breakdown: EnhancedBreakdown;
  status: 'pending' | 'confirmed' | 'dismissed';
  createdAt: Date;
}

export function buildEnhancedMatches(
  lostItems: any[],
  foundItems: any[],
  minScore = 0.25
): EnhancedMatch[] {
  const results: EnhancedMatch[] = [];

  // Build corpus for TF-IDF
  const allDocs = [
    ...lostItems.map(i => extractTokens(i.title + ' ' + (i.description || ''))),
    ...foundItems.map(i => extractTokens(i.title + ' ' + (i.description || ''))),
  ];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const lostText = (lost.title + ' ' + (lost.description || '')).toLowerCase();
      const foundText = (found.title + ' ' + (found.description || '')).toLowerCase();

      // ── Individual signals ──────────────────────────────────────────
      const catSim = categorySimilarity(lost.category || '', found.category || '');
      const colorSim = colorSimilarity(lostText, foundText);
      const brandSim = brandSimilarity(lostText, foundText);
      const textSim = advancedTextSimilarity(lostText, foundText, allDocs);
      const physSim = physicalDescSimilarity(lostText, foundText);
      const imageSim = estimatedImageSimilarity(lostText, foundText, catSim, colorSim, brandSim);

      const distKm = getDistanceInKm(
        lost.location_lat || 0, lost.location_lng || 0,
        found.location_lat || 0, found.location_lng || 0
      );
      const locationScore = adaptiveLocationScore(distKm, lost.category || '');

      const lostDate = new Date(lost.date_lost || lost.created_at);
      const foundDate = new Date(found.date_found || found.created_at);
      const timeScore = adaptiveTimeScore(lostDate, foundDate);

      // ── Composite score — upgraded weights ──────────────────────────
      // image: 0.25, text: 0.25, category: 0.15, color: 0.12,
      // brand: 0.10, location: 0.08, time: 0.05
      const score =
        imageSim   * 0.25 +
        textSim    * 0.25 +
        catSim     * 0.15 +
        colorSim   * 0.12 +
        brandSim   * 0.10 +
        locationScore * 0.08 +
        timeScore  * 0.05;

      const finalScore = Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
      if (finalScore < minScore) continue;

      // ── Human-readable signals ──────────────────────────────────────
      const signals: string[] = [];
      if (catSim === 1.0) signals.push('Same category');
      else if (catSim >= 0.5) signals.push('Related category');
      if (brandSim === 1.0) signals.push('Same brand detected');
      if (colorSim >= 0.8) signals.push('Matching colors');
      if (textSim >= 0.6) signals.push('Strong description match');
      else if (textSim >= 0.35) signals.push('Partial description match');
      if (distKm < 0.5) signals.push('Very close location');
      else if (distKm < 3) signals.push('Nearby location');
      const diffDays = Math.round((foundDate.getTime() - lostDate.getTime()) / (1000*60*60*24));
      if (diffDays >= 0 && diffDays <= 3) signals.push('Found within 3 days');
      else if (diffDays >= 0 && diffDays <= 14) signals.push('Found within 2 weeks');
      if (physSim >= 0.5) signals.push('Physical description matches');

      const confidence: 'high' | 'medium' | 'low' =
        finalScore >= 0.7 ? 'high' : finalScore >= 0.45 ? 'medium' : 'low';

      results.push({
        id: `${lost.id}-${found.id}`,
        lostItem: lost,
        foundItem: found,
        confidenceScore: finalScore,
        breakdown: {
          imageSimilarity: Math.round(imageSim * 100) / 100,
          textSimilarity: Math.round(textSim * 100) / 100,
          locationProximity: Math.round(locationScore * 100) / 100,
          timeProximity: Math.round(timeScore * 100) / 100,
          colorMatch: Math.round(colorSim * 100) / 100,
          brandMatch: Math.round(brandSim * 100) / 100,
          physicalDescMatch: Math.round(physSim * 100) / 100,
          categorySimilarity: Math.round(catSim * 100) / 100,
          confidence,
          signals,
        },
        status: 'pending',
        createdAt: new Date(),
      });
    }
  }

  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

// Legacy exports kept for backward compatibility (AdminDashboard, Home)
export const calculateMatchScore = (
  imageSim: number, textSim: number, locationProx: number, timeProx: number
): number => {
  const score = imageSim*0.4 + textSim*0.3 + locationProx*0.2 + timeProx*0.1;
  return Math.round(score * 100) / 100;
};
