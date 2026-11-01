import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { loadConsumedFromStorage, saveConsumedToStorage } from '../services/storage';
import { ConsumedPokemon, PokemonListItem, RatingValue } from '../types/pokemon';
import { useAuth } from './AuthContext';

interface ConsumedContextData {
  consumedItems: ConsumedPokemon[];
  isHydratingConsumed: boolean;
  storageError: string | null;
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
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Synchronously true whenever a user is present but their data has not finished hydrating yet
  const isHydratingConsumed = Boolean(user && hydratedUserId !== user.id);

  // Hydrates persisted consumed items on startup
  useEffect(() => {
    let isMounted = true;

    async function hydrateConsumed() {
      if (!user) {
        if (isMounted) {
          setConsumedItems([]);
          setStorageError(null);
          setHydratedUserId(null);
        }
        return;
      }

      const targetUserId = user.id;
      setStorageError(null);

      try {
        const storedConsumed = await loadConsumedFromStorage(targetUserId);
        if (isMounted) {
          setConsumedItems(storedConsumed);
        }
      } catch {
        if (isMounted) {
          setStorageError('Não foi possível restaurar os itens capturados salvos.');
        }
      } finally {
        if (isMounted) {
          setHydratedUserId(targetUserId);
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

      const previousItems = consumedItems;
      const newRecord: ConsumedPokemon = {
        ...item,
        rating,
        consumedAt: new Date().toISOString(),
      };

      const exists = previousItems.some((entry) => entry.id === item.id);
      const updatedItems = exists
        ? previousItems.map((entry) => (entry.id === item.id ? newRecord : entry))
        : [newRecord, ...previousItems];

      setConsumedItems(updatedItems);
      setStorageError(null);

      try {
        await saveConsumedToStorage(user.id, updatedItems);
      } catch {
        setConsumedItems(previousItems);
        const errorMsg = 'Falha ao salvar a avaliação no armazenamento local.';
        setStorageError(errorMsg);
        Alert.alert('Erro de Persistência', errorMsg);
      }
    },
    [user, consumedItems]
  );

  const removeConsumedItem = useCallback(
    async (id: number): Promise<void> => {
      if (!user) {
        return;
      }

      const previousItems = consumedItems;
      const updatedItems = previousItems.filter((entry) => entry.id !== id);

      setConsumedItems(updatedItems);
      setStorageError(null);

      try {
        await saveConsumedToStorage(user.id, updatedItems);
      } catch {
        setConsumedItems(previousItems);
        const errorMsg = 'Falha ao remover item do armazenamento local.';
        setStorageError(errorMsg);
        Alert.alert('Erro de Persistência', errorMsg);
      }
    },
    [user, consumedItems]
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
        storageError,
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
