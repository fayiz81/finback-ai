import { useState, useCallback, useEffect } from 'react';
import {
  LostItem,
  FoundItem,
  MatchResult,
  ITEM_CATEGORIES,
  calculateMatchScore,
  getDistanceInKm,
  getDaysDifference,
  normalizeScore,
} from '@/lib/index';
import { mockLostItems, mockFoundItems, mockMatches } from '@/data/index';

interface ItemFormData {
  title: string;
  description: string;
  category: typeof ITEM_CATEGORIES[number];
  imageFile?: File;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  date: Date;
}

interface FilterOptions {
  category?: string;
  searchQuery?: string;
  maxDistance?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: 'lost' | 'found';
}

export const useItems = () => {
  const [lostItems, setLostItems] = useState<LostItem[]>(mockLostItems);
  const [foundItems, setFoundItems] = useState<FoundItem[]>(mockFoundItems);
  const [matches, setMatches] = useState<MatchResult[]>(mockMatches);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }, []);

  const simulateAIMatching = useCallback(
    async (item: LostItem | FoundItem, type: 'lost' | 'found'): Promise<MatchResult[]> => {
      setIsProcessingMatch(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const itemsToMatch = type === 'lost' ? foundItems : lostItems;
      const newMatches: MatchResult[] = [];

      itemsToMatch.forEach((matchItem) => {
        const imageSimilarity = Math.random() * 0.4 + 0.6;
        const textSimilarity = Math.random() * 0.3 + 0.6;

        const distance = getDistanceInKm(
          item.location.lat,
          item.location.lng,
          matchItem.location.lat,
          matchItem.location.lng
        );
        const locationProximity = normalizeScore(distance, 10);

        const itemDate = 'dateLost' in item ? item.dateLost : item.dateFound;
        const matchDate = 'dateLost' in matchItem ? matchItem.dateLost : matchItem.dateFound;
        const daysDiff = getDaysDifference(itemDate, matchDate);
        const timeProximity = normalizeScore(daysDiff, 30);

        const confidenceScore = calculateMatchScore(
          imageSimilarity,
          textSimilarity,
          locationProximity,
          timeProximity
        );

        if (confidenceScore > 0.5) {
          const match: MatchResult = {
            id: `match-${Date.now()}-${Math.random()}`,
            lostItemId: type === 'lost' ? item.id : matchItem.id,
            foundItemId: type === 'found' ? item.id : matchItem.id,
            confidenceScore,
            breakdown: {
              imageSimilarity,
              textSimilarity,
              locationProximity,
              timeProximity,
            },
            status: 'pending',
            createdAt: new Date(),
          };
          newMatches.push(match);
        }
      });

      newMatches.sort((a, b) => b.confidenceScore - a.confidenceScore);

      setIsProcessingMatch(false);
      return newMatches;
    },
    [lostItems, foundItems]
  );

  const submitLostItem = useCallback(
    async (formData: ItemFormData, userId: string): Promise<LostItem> => {
      setIsLoading(true);
      setError(null);

      try {
        let imageUrl = '';
        if (formData.imageFile) {
          imageUrl = await uploadImage(formData.imageFile);
        }

        const newItem: LostItem = {
          id: `lost-${Date.now()}`,
          userId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          imageUrl,
          location: formData.location,
          dateLost: formData.date,
          status: 'active',
          createdAt: new Date(),
        };

        setLostItems((prev) => [newItem, ...prev]);

        const newMatches = await simulateAIMatching(newItem, 'lost');
        setMatches((prev) => [...newMatches, ...prev]);

        if (newMatches.some((match) => match.confidenceScore > 0.8)) {
          console.log('High confidence match found! Email notification sent.');
        }

        setIsLoading(false);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit item');
        setIsLoading(false);
        throw err;
      }
    },
    [uploadImage, simulateAIMatching]
  );

  const submitFoundItem = useCallback(
    async (formData: ItemFormData, userId: string): Promise<FoundItem> => {
      setIsLoading(true);
      setError(null);

      try {
        let imageUrl = '';
        if (formData.imageFile) {
          imageUrl = await uploadImage(formData.imageFile);
        }

        const newItem: FoundItem = {
          id: `found-${Date.now()}`,
          userId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          imageUrl,
          location: formData.location,
          dateFound: formData.date,
          status: 'active',
          createdAt: new Date(),
        };

        setFoundItems((prev) => [newItem, ...prev]);

        const newMatches = await simulateAIMatching(newItem, 'found');
        setMatches((prev) => [...newMatches, ...prev]);

        if (newMatches.some((match) => match.confidenceScore > 0.8)) {
          console.log('High confidence match found! Email notification sent.');
        }

        setIsLoading(false);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit item');
        setIsLoading(false);
        throw err;
      }
    },
    [uploadImage, simulateAIMatching]
  );

  const updateItemStatus = useCallback(
    (itemId: string, type: 'lost' | 'found', status: 'active' | 'matched' | 'resolved') => {
      if (type === 'lost') {
        setLostItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, status } : item))
        );
      } else {
        setFoundItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, status } : item))
        );
      }
    },
    []
  );

  const updateMatchStatus = useCallback(
    (matchId: string, status: MatchResult['status']) => {
      setMatches((prev) =>
        prev.map((match) => (match.id === matchId ? { ...match, status } : match))
      );
    },
    []
  );

  const deleteItem = useCallback((itemId: string, type: 'lost' | 'found') => {
    if (type === 'lost') {
      setLostItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setFoundItems((prev) => prev.filter((item) => item.id !== itemId));
    }

    setMatches((prev) =>
      prev.filter(
        (match) =>
          (type === 'lost' ? match.lostItemId : match.foundItemId) !== itemId
      )
    );
  }, []);

  const filterItems = useCallback(
    (items: (LostItem | FoundItem)[], filters: FilterOptions) => {
      let filtered = [...items];

      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((item) => item.category === filters.category);
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
      }

      if (filters.maxDistance !== undefined) {
        filtered = filtered.filter((item) => {
          return true;
        });
      }

      if (filters.dateRange) {
        filtered = filtered.filter((item) => {
          const itemDate = 'dateLost' in item ? item.dateLost : item.dateFound;
          return (
            itemDate >= filters.dateRange!.start &&
            itemDate <= filters.dateRange!.end
          );
        });
      }

      return filtered;
    },
    []
  );

  const getMatchesForItem = useCallback(
    (itemId: string, type: 'lost' | 'found'): MatchResult[] => {
      return matches.filter((match) =>
        type === 'lost' ? match.lostItemId === itemId : match.foundItemId === itemId
      );
    },
    [matches]
  );

  const getUserItems = useCallback(
    (userId: string) => {
      const userLostItems = lostItems.filter((item) => item.userId === userId);
      const userFoundItems = foundItems.filter((item) => item.userId === userId);
      return { lostItems: userLostItems, foundItems: userFoundItems };
    },
    [lostItems, foundItems]
  );

  return {
    lostItems,
    foundItems,
    matches,
    isLoading,
    error,
    isProcessingMatch,
    submitLostItem,
    submitFoundItem,
    updateItemStatus,
    updateMatchStatus,
    deleteItem,
    filterItems,
    getMatchesForItem,
    getUserItems,
    getCurrentLocation,
    uploadImage,
  };
};
