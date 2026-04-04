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
const BRAND_PATTERNS: Array<[RegExp, string]> = [
  [/apple|iphone|ipad|macbook|airpods|imac|ipod/i, 'apple'],
  [/samsung|galaxy/i, 'samsung'],
  [/sony|bose|jbl|beats|sennheiser/i, 'audio'],
  [/nike|adidas|puma|reebok|converse|vans/i, 'sportswear'],
  [/hp|dell|lenovo|asus|acer|msi|thinkpad/i, 'laptop'],
  [/gucci|louis|vuitton|prada|zara|hm|h&m/i, 'fashion'],
  [/canon|nikon|gopro|sony|fuji/i, 'camera'],
  [/motorola|oneplus|huawei|xiaomi|realme|oppo/i, 'phone'],
  [/skullcandy|jabra|anker|boat/i, 'headphones'],
  [/casio|fossil|seiko|rolex|titan/i, 'watch'],
];

// ─── Synonyms for better text matching ───────────────────────────────────────
const SYNONYMS: Record<string, string[]> = {
  phone:    ['mobile','cell','smartphone','iphone','android'],
  laptop:   ['computer','notebook','macbook','chromebook'],
  bag:      ['backpack','purse','satchel','handbag','tote','pouch'],
  wallet:   ['purse','billfold','cardholder'],
  keys:     ['keychain','keyring','keyfob'],
  watch:    ['smartwatch','timepiece','wristwatch'],
  earphones:['earbuds','headphones','airpods','pods'],
  glasses:  ['spectacles','sunglasses','eyewear','goggles'],
  charger:  ['cable','adapter','power bank','powerbank'],
  card:     ['id','idcard','license','passport','document'],
};

function expandSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const tok of tokens) {
    for (const [key, synonymList] of Object.entries(SYNONYMS)) {
      if (tok === key || synonymList.includes(tok)) {
        expanded.add(key);
        synonymList.forEach(s => expanded.add(s));
      }
    }
  }
  return [...expanded];
}

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
  return BRAND_PATTERNS
    .filter(([p]) => p.test(text))
    .map(([, name]) => name);
}

function extractPhysicalDesc(tokens: string[]): string[] {
  const physWords = new Set([
    'large','small','big','tiny','mini','pro','max','plus','lite','ultra',
    'leather','metal','plastic','wooden','fabric','rubber','glass','canvas','silicon',
    'broken','scratched','cracked','new','old','vintage','worn','torn','dented',
    'case','cover','pouch','bag','strap','handle','clip','chain',
    '13','14','15','16','inch','cm','mm','size',
  ]);
  return tokens.filter(t => physWords.has(t));
}

// TF-IDF inspired token importance
function tokenImportance(token: string, allDocs: string[][]): number {
  const df = allDocs.filter(doc => doc.includes(token)).length;
  const idf = df > 0 ? Math.log((allDocs.length + 1) / (df + 1)) + 1 : 1;
  const lengthBonus = token.length > 6 ? 1.6 : token.length > 4 ? 1.2 : 1;
  return idf * lengthBonus;
}

// Advanced text similarity with synonyms + TF-IDF
function advancedTextSimilarity(a: string, b: string, allDocs: string[][] = []): number {
  const rawA = extractTokens(a);
  const rawB = extractTokens(b);
  if (rawA.length === 0 || rawB.length === 0) return 0;

  // Expand with synonyms for better matching
  const tokA = expandSynonyms(rawA);
  const tokB = expandSynonyms(rawB);

  const setA = new Set(tokA);
  const setB = new Set(tokB);
  const intersection = [...setA].filter(t => setB.has(t));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0;

  const corpus = allDocs.length > 0 ? allDocs : [rawA, rawB];
  const weightedInter = intersection.reduce((sum, tok) => sum + tokenImportance(tok, corpus), 0);
  const weightedUnion = [...union].reduce((sum, tok) => sum + tokenImportance(tok, corpus), 0);

  const jaccard = intersection.length / union.size;
  const weighted = weightedUnion > 0 ? weightedInter / weightedUnion : 0;

  // Title word bonus: exact title word match is very strong signal
  const titleA = a.split(' ').slice(0, 3).map(w => w.toLowerCase());
  const titleB = b.split(' ').slice(0, 3).map(w => w.toLowerCase());
  const titleMatch = titleA.filter(w => titleB.includes(w) && w.length > 3).length;
  const titleBonus = Math.min(0.3, titleMatch * 0.15);

  return Math.min(1, jaccard * 0.3 + weighted * 0.6 + titleBonus);
}

function colorSimilarity(textA: string, textB: string): number {
  const colA = extractColors(extractTokens(textA));
  const colB = extractColors(extractTokens(textB));
  if (colA.length === 0 && colB.length === 0) return 0.5;
  if (colA.length === 0 || colB.length === 0) return 0.25;
  const shared = colA.filter(c => colB.includes(c)).length;
  if (shared === 0) return 0.05; // Different colors mentioned — penalize
  return Math.min(1, 0.65 + shared * 0.25);
}

function brandSimilarity(textA: string, textB: string): number {
  const brA = extractBrands(textA);
  const brB = extractBrands(textB);
  if (brA.length === 0 && brB.length === 0) return 0.5;
  if (brA.length === 0 || brB.length === 0) return 0.2;
  const shared = brA.filter(b => brB.includes(b)).length;
  return shared > 0 ? 1.0 : 0.0; // Brand mismatch is a strong negative
}

function physicalDescSimilarity(textA: string, textB: string): number {
  const pA = extractPhysicalDesc(extractTokens(textA));
  const pB = extractPhysicalDesc(extractTokens(textB));
  if (pA.length === 0 && pB.length === 0) return 0.5;
  if (pA.length === 0 || pB.length === 0) return 0.35;
  const shared = pA.filter(p => pB.includes(p)).length;
  const total = new Set([...pA, ...pB]).size;
  return total > 0 ? Math.min(1, (shared / total) * 1.2) : 0.3;
}

// Semantic category groups
const CATEGORY_GROUPS: Record<string, string> = {
  'Electronics': 'tech', 'Accessories': 'personal',
  'Documents': 'paper', 'Clothing': 'wear',
  'Books': 'paper', 'Keys': 'personal',
  'Bags': 'carry', 'Sports Equipment': 'activity',
  'Jewelry': 'personal', 'Other': 'misc',
};

function categorySimilarity(catA: string, catB: string): number {
  if (!catA || !catB) return 0.3;
  if (catA === catB) return 1.0;
  if (CATEGORY_GROUPS[catA] && CATEGORY_GROUPS[catA] === CATEGORY_GROUPS[catB]) return 0.55;
  return 0.05; // Different category groups — low signal
}

// Image similarity proxy — uses all textual signals
function estimatedImageSimilarity(
  lostText: string, foundText: string,
  catSim: number, colorSim: number, brandSim: number, physSim: number
): number {
  // Weight category heavily — a phone doesn't look like a book
  const score = catSim * 0.40 + colorSim * 0.25 + brandSim * 0.25 + physSim * 0.10;
  return Math.min(1, Math.max(0.05, score));
}

// Adaptive location — smaller items lost in tighter radius
function adaptiveLocationScore(distKm: number, category: string): number {
  const tightCats = new Set(['Keys', 'Jewelry', 'Documents', 'Accessories']);
  const mediumCats = new Set(['Electronics', 'Books', 'Clothing']);
  const maxKm = tightCats.has(category) ? 1.5 : mediumCats.has(category) ? 8 : 15;
  if (distKm === 0) return 1.0;
  return Math.exp(-distKm / (maxKm * 0.4));
}

// Asymmetric time scoring
function adaptiveTimeScore(lostDate: Date, foundDate: Date): number {
  const diffDays = (foundDate.getTime() - lostDate.getTime()) / (1000*60*60*24);
  if (diffDays < -1) return Math.max(0, 0.2 + diffDays * 0.015); // Found before lost — penalize
  if (diffDays <= 0) return 0.85; // Same day — high score
  if (diffDays <= 3) return 0.95;
  if (diffDays <= 7) return 0.85;
  return Math.exp(-diffDays / 25); // Decay over ~25 days
}

// ─── Upgraded weights ─────────────────────────────────────────────────────────
// text is the most reliable signal we have (no real vision model)
// brand is very high precision when it fires
// category gates everything — cross-category matches are almost always wrong
const WEIGHTS = {
  text:     0.30, // TF-IDF + synonym weighted overlap
  category: 0.22, // Most important gate
  brand:    0.18, // Very high precision
  image:    0.12, // Proxy estimate
  color:    0.10, // Strong when mentioned
  location: 0.05, // Useful but not decisive
  time:     0.03, // Weak signal
};

// Legacy export kept for backward compatibility
export const calculateMatchScore = (
  imageSim: number, textSim: number, locationProx: number, timeProx: number
): number => {
  const score = imageSim*0.4 + textSim*0.3 + locationProx*0.2 + timeProx*0.1;
  return Math.round(score * 100) / 100;
};

// ─── Enhanced Match Types ─────────────────────────────────────────────────────
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
  signals: string[];
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

// ─── Main matching function ───────────────────────────────────────────────────
export function buildEnhancedMatches(
  lostItems: any[],
  foundItems: any[],
  minScore = 0.25
): EnhancedMatch[] {
  const results: EnhancedMatch[] = [];

  const allDocs = [
    ...lostItems.map(i => extractTokens(i.title + ' ' + (i.description || ''))),
    ...foundItems.map(i => extractTokens(i.title + ' ' + (i.description || ''))),
  ];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const lostText  = (lost.title  + ' ' + (lost.description  || '')).toLowerCase();
      const foundText = (found.title + ' ' + (found.description || '')).toLowerCase();

      const catSim      = categorySimilarity(lost.category || '', found.category || '');
      const colorSim    = colorSimilarity(lostText, foundText);
      const brandSim    = brandSimilarity(lostText, foundText);
      const textSim     = advancedTextSimilarity(lostText, foundText, allDocs);
      const physSim     = physicalDescSimilarity(lostText, foundText);
      const imageSim    = estimatedImageSimilarity(lostText, foundText, catSim, colorSim, brandSim, physSim);

      const distKm = getDistanceInKm(
        lost.location_lat || 0, lost.location_lng || 0,
        found.location_lat || 0, found.location_lng || 0
      );
      const locationScore = adaptiveLocationScore(distKm, lost.category || '');

      const lostDate  = new Date(lost.date_lost  || lost.created_at);
      const foundDate = new Date(found.date_found || found.created_at);
      const timeScore = adaptiveTimeScore(lostDate, foundDate);

      const score =
        textSim       * WEIGHTS.text     +
        catSim        * WEIGHTS.category +
        brandSim      * WEIGHTS.brand    +
        imageSim      * WEIGHTS.image    +
        colorSim      * WEIGHTS.color    +
        locationScore * WEIGHTS.location +
        timeScore     * WEIGHTS.time;

      const catPenalty = catSim < 0.1 ? 0.6 : 1.0;
      const finalScore = Math.round(Math.min(1, Math.max(0, score * catPenalty)) * 100) / 100;

      if (finalScore < minScore) continue;

      const signals: string[] = [];
      if (catSim === 1.0)    signals.push('Same category');
      else if (catSim >= 0.5) signals.push('Related category');
      if (brandSim === 1.0)  signals.push('Same brand detected');
      if (colorSim >= 0.8)   signals.push('Matching colors');
      else if (colorSim <= 0.1) signals.push('Color mismatch');
      if (textSim >= 0.55)   signals.push('Strong description match');
      else if (textSim >= 0.3) signals.push('Partial description match');
      if (distKm < 0.3)      signals.push('Same location');
      else if (distKm < 1)   signals.push('Very close location');
      else if (distKm < 5)   signals.push('Nearby location');
      const diffDays = Math.round((foundDate.getTime() - lostDate.getTime()) / (1000*60*60*24));
      if (diffDays >= 0 && diffDays <= 1)  signals.push('Found same day');
      else if (diffDays >= 0 && diffDays <= 7) signals.push('Found within a week');
      else if (diffDays >= 0 && diffDays <= 30) signals.push('Found within a month');
      if (physSim >= 0.5)    signals.push('Physical description matches');

      const confidence: 'high' | 'medium' | 'low' =
        finalScore >= 0.7 ? 'high' : finalScore >= 0.45 ? 'medium' : 'low';

      results.push({
        id: `${lost.id}-${found.id}`,
        lostItem: lost,
        foundItem: found,
        confidenceScore: finalScore,
        breakdown: {
          imageSimilarity:    Math.round(imageSim      * 100) / 100,
          textSimilarity:     Math.round(textSim       * 100) / 100,
          locationProximity:  Math.round(locationScore * 100) / 100,
          timeProximity:      Math.round(timeScore     * 100) / 100,
          colorMatch:         Math.round(colorSim      * 100) / 100,
          brandMatch:         Math.round(brandSim      * 100) / 100,
          physicalDescMatch:  Math.round(physSim       * 100) / 100,
          categorySimilarity: Math.round(catSim        * 100) / 100,
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
