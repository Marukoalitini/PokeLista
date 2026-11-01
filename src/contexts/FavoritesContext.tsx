import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { loadFavoritesFromStorage, saveFavoritesToStorage } from '../services/storage';
import { PokemonListItem } from '../types/pokemon';
import { useAuth } from './AuthContext';

interface FavoritesContextData {
  favorites: PokemonListItem[];
  isHydratingFavorites: boolean;
  storageError: string | null;
  toggleFavorite: (item: PokemonListItem) => Promise<void>;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<PokemonListItem[]>([]);
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Synchronously true whenever a user is present but their data has not finished hydrating yet
  const isHydratingFavorites = Boolean(user && hydratedUserId !== user.id);

  // Hydrates persisted favorites when user session is active
  useEffect(() => {
    let isMounted = true;

    async function hydrateFavorites() {
      if (!user) {
        if (isMounted) {
          setFavorites([]);
          setStorageError(null);
          setHydratedUserId(null);
        }
        return;
      }

      const targetUserId = user.id;
      setStorageError(null);

      try {
        const storedFavorites = await loadFavoritesFromStorage(targetUserId);
        if (isMounted) {
          setFavorites(storedFavorites);
        }
      } catch {
        if (isMounted) {
          setStorageError('Não foi possível restaurar seus favoritos salvos.');
        }
      } finally {
        if (isMounted) {
          setHydratedUserId(targetUserId);
        }
      }
    }

    hydrateFavorites();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleFavorite = useCallback(
    async (item: PokemonListItem): Promise<void> => {
      if (!user) {
        return;
      }

      const previousFavorites = favorites;
      const exists = previousFavorites.some((fav) => fav.id === item.id);
      const updatedFavorites = exists
        ? previousFavorites.filter((fav) => fav.id !== item.id)
        : [item, ...previousFavorites];

      setFavorites(updatedFavorites);
      setStorageError(null);

      try {
        await saveFavoritesToStorage(user.id, updatedFavorites);
      } catch {
        setFavorites(previousFavorites);
        const errorMsg = 'Falha ao salvar alterações nos favoritos no armazenamento local.';
        setStorageError(errorMsg);
        Alert.alert('Erro de Persistência', errorMsg);
      }
    },
    [user, favorites]
  );

  const isFavorite = useCallback(
    (id: number): boolean => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isHydratingFavorites,
        storageError,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextData {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
