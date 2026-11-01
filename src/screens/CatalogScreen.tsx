import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ErrorState } from '../components/ErrorState';
import { ItemCard } from '../components/ItemCard';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { fetchPokemonPage } from '../services/api';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { PokemonListItem } from '../types/pokemon';
import { getErrorMessage } from '../utils/errorUtils';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

type CatalogNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Catalog'>,
  NativeStackNavigationProp<AppStackParamList>
>;

const PAGE_LIMIT = 20;

export const CatalogScreen: React.FC = () => {
  const navigation = useNavigation<CatalogNavigationProp>();
  const { user, signOut } = useAuth();
  const { favorites, storageError } = useFavorites();

  const [items, setItems] = useState<PokemonListItem[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationError, setPaginationError] = useState<string | null>(null);

  // Loads initial page of Pokemon
  const loadFirstPage = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }
    setError(null);
    setPaginationError(null);

    try {
      const result = await fetchPokemonPage(0, PAGE_LIMIT);
      setItems(result.items);
      setOffset(PAGE_LIMIT);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Não foi possível atualizar o catálogo da PokéAPI.'
        )
      );
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage(false);
  }, [loadFirstPage]);

  // Loads next page for infinite scrolling
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || initialLoading || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setPaginationError(null);

    try {
      const result = await fetchPokemonPage(offset, PAGE_LIMIT);
      setItems((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = result.items.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });
      setOffset((prev) => prev + PAGE_LIMIT);
      setHasMore(result.hasMore);
    } catch (err) {
      setPaginationError(
        getErrorMessage(err, 'Falha ao carregar mais Pokémon.')
      );
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, initialLoading, refreshing, hasMore, offset]);

  const handleOpenDetails = useCallback(
    (item: PokemonListItem) => {
      navigation.navigate('Details', { id: item.id, name: item.name });
    },
    [navigation]
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerContainer} accessibilityLiveRegion="polite">
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerText} allowFontScaling={true}>
            Carregando mais Pokémon...
          </Text>
        </View>
      );
    }

    if (paginationError) {
      return (
        <View style={styles.footerContainer} accessibilityRole="alert">
          <Text
            style={styles.paginationErrorText}
            selectable={true}
            allowFontScaling={true}
          >
            {paginationError}
          </Text>
          <Pressable
            style={styles.retryMoreButton}
            onPress={handleLoadMore}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente carregar a próxima página"
          >
            <Text style={styles.retryMoreButtonText} allowFontScaling={true}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      );
    }

    return <View style={styles.footerSpacer} />;
  };

  if (initialLoading) {
    return (
      <View style={styles.centered} accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText} allowFontScaling={true}>
          Carregando Pokédex...
        </Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={() => loadFirstPage(false)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.userBanner}>
        <View style={styles.userTextContainer}>
          <Text style={styles.greetingText} allowFontScaling={true}>
            Olá, {user?.name || 'Treinador'}!
          </Text>
          <Text style={styles.subGreetingText} allowFontScaling={true}>
            Explore a Pokédex, favorite e avalie seus Pokémon
          </Text>
        </View>

        <View style={styles.bannerActions}>
          <Pressable
            style={styles.headerActionButton}
            onPress={() => navigation.navigate('Favorites')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Ir para Favoritos. ${favorites.length} itens favoritados.`}
          >
            <Ionicons name="heart" size={20} color={COLORS.favoriteActive} />
            <Text style={styles.headerActionText} allowFontScaling={true}>
              {favorites.length}
            </Text>
          </Pressable>

          <Pressable
            style={styles.logoutButton}
            onPress={signOut}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta (Logout)"
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.logoutText} allowFontScaling={true}>
              Sair
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Displays non-blocking error banner with retry when refresh fails on a populated list */}
      {error && items.length > 0 ? (
        <View
          style={styles.refreshErrorBanner}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <View style={styles.refreshErrorTextGroup}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text
              style={styles.refreshErrorText}
              selectable={true}
              allowFontScaling={true}
            >
              {error}
            </Text>
          </View>
          <Pressable
            style={styles.refreshRetryButton}
            onPress={() => loadFirstPage(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente atualizar a lista"
          >
            <Text style={styles.refreshRetryButtonText} allowFontScaling={true}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      ) : null}

      {storageError ? (
        <View
          style={styles.refreshErrorBanner}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Ionicons name="warning-outline" size={20} color={COLORS.error} />
          <Text
            style={styles.refreshErrorText}
            selectable={true}
            allowFontScaling={true}
          >
            {storageError}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={handleOpenDetails} />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshing={refreshing}
        onRefresh={() => loadFirstPage(true)}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  userTextContainer: {
    flex: 1,
    minWidth: 180,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subGreetingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    minHeight: 44,
    minWidth: 44,
    gap: SPACING.xs,
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    fontVariant: ['tabular-nums'],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    minHeight: 44,
    minWidth: 44,
    gap: SPACING.xs,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  refreshErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    backgroundColor: COLORS.errorBackground,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  refreshErrorTextGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 180,
    gap: SPACING.sm,
  },
  refreshErrorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  refreshRetryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderCurve: 'continuous',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshRetryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  footerContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  paginationErrorText: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  retryMoreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    minHeight: 44,
    justifyContent: 'center',
  },
  retryMoreButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  footerSpacer: {
    height: SPACING.lg,
  },
});
