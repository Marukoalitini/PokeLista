import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadConsumedFromStorage, saveConsumedToStorage } from '../services/storage';
import { ConsumedPokemon, PokemonListItem, RatingValue } from '../types/pokemon';
import { useAuth } from './AuthContext';

interface ConsumedContextData {
  consumedItems: ConsumedPokemon[];
  isHydratingConsumed: boolean;
  rateConsumedItem: (item: PokemonListItem, rating: RatingValue) => Promise<void>;
  removeConsumedItem: (id: number) => Promise<void>;
  getConsumedItem: (id: number) => ConsumedPokemon | undefined;
}

const ConsumedContext = createContext<ConsumedContextData | undefined>(undefined);

export const ConsumedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [consumedItems, setConsumedItems] = useState<ConsumedPokemon[]>([]);
  const [isHydratingConsumed, setIsHydratingConsumed] = useState<boolean>(true);

  // Hydrates persisted consumed items on startup
  useEffect(() => {
    let isMounted = true;

    async function hydrateConsumed() {
      if (!user) {
        if (isMounted) {
          setConsumedItems([]);
          setIsHydratingConsumed(false);
        }
        return;
      }

      setIsHydratingConsumed(true);
      try {
        const storedConsumed = await loadConsumedFromStorage(user.id);
        if (isMounted) {
          setConsumedItems(storedConsumed);
        }
      } finally {
        if (isMounted) {
          setIsHydratingConsumed(false);
        }
      }
    }

    hydrateConsumed();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const rateConsumedItem = useCallback(
    async (item: PokemonListItem, rating: RatingValue): Promise<void> => {
      if (!user) {
        return;
      }

      const newRecord: ConsumedPokemon = {
        ...item,
        rating,
        consumedAt: new Date().toISOString(),
      };

      setConsumedItems((prev) => {
        const exists = prev.some((entry) => entry.id === item.id);
        const updated = exists
          ? prev.map((entry) => (entry.id === item.id ? newRecord : entry))
          : [newRecord, ...prev];

        saveConsumedToStorage(user.id, updated).catch(() => {});
        return updated;
      });
    },
    [user]
  );

  const removeConsumedItem = useCallback(
    async (id: number): Promise<void> => {
      if (!user) {
        return;
      }

      setConsumedItems((prev) => {
        const updated = prev.filter((entry) => entry.id !== id);
        saveConsumedToStorage(user.id, updated).catch(() => {});
        return updated;
      });
    },
    [user]
  );

  const getConsumedItem = useCallback(
    (id: number): ConsumedPokemon | undefined => {
      return consumedItems.find((entry) => entry.id === id);
    },
    [consumedItems]
  );

  return (
    <ConsumedContext.Provider
      value={{
        consumedItems,
        isHydratingConsumed,
        rateConsumedItem,
        removeConsumedItem,
        getConsumedItem,
      }}
    >
      {children}
    </ConsumedContext.Provider>
  );
};

export function useConsumed(): ConsumedContextData {
  const context = useContext(ConsumedContext);
  if (!context) {
    throw new Error('useConsumed must be used within a ConsumedProvider');
  }
  return context;
}
