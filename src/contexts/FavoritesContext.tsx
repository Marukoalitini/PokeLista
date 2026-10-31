import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadFavoritesFromStorage, saveFavoritesToStorage } from '../services/storage';
import { PokemonListItem } from '../types/pokemon';
import { useAuth } from './AuthContext';

interface FavoritesContextData {
  favorites: PokemonListItem[];
  isHydratingFavorites: boolean;
  toggleFavorite: (item: PokemonListItem) => Promise<void>;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextData | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<PokemonListItem[]>([]);
  const [isHydratingFavorites, setIsHydratingFavorites] = useState<boolean>(true);

  // Hydrates persisted favorites when user session is active
  useEffect(() => {
    let isMounted = true;

    async function hydrateFavorites() {
      if (!user) {
        if (isMounted) {
          setFavorites([]);
          setIsHydratingFavorites(false);
        }
        return;
      }

      setIsHydratingFavorites(true);
      try {
        const storedFavorites = await loadFavoritesFromStorage(user.id);
        if (isMounted) {
          setFavorites(storedFavorites);
        }
      } finally {
        if (isMounted) {
          setIsHydratingFavorites(false);
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

      setFavorites((prev) => {
        const exists = prev.some((fav) => fav.id === item.id);
        const updated = exists
          ? prev.filter((fav) => fav.id !== item.id)
          : [item, ...prev];

        saveFavoritesToStorage(user.id, updated).catch(() => {});
        return updated;
      });
    },
    [user]
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
