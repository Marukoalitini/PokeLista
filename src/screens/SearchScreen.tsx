import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ItemCard } from '../components/ItemCard';
import { searchPokemon } from '../services/api';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { PokemonListItem } from '../types/pokemon';
import { getErrorMessage } from '../utils/errorUtils';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

type SearchNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchNavigationProp>();

  const [query, setQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [results, setResults] = useState<PokemonListItem[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Executes API search and updates results list without auto-navigating
  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSubmittedQuery(trimmed);

    try {
      const matchedItems = await searchPokemon(trimmed);
      setResults(matchedItems);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Falha ao buscar Pokémon na API. Verifique sua conexão e tente novamente.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setSubmittedQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleOpenDetails = useCallback(
    (item: PokemonListItem) => {
      navigation.navigate('Details', { id: item.id, name: item.name });
    },
    [navigation]
  );

  const isSearchDisabled = !query.trim() || loading;

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Nome ou número (ex.: pikachu, char, 25)"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            accessible={true}
            accessibilityLabel="Campo de busca de Pokémon por nome ou número"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.clearButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Limpar texto da busca"
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
            isSearchDisabled && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={isSearchDisabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Buscar Pokémon"
          accessibilityState={{ disabled: isSearchDisabled, busy: loading }}
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Buscando por &quot;{submittedQuery}&quot;...
          </Text>
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={handleSearch} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ItemCard item={item} onPress={handleOpenDetails} />
          )}
          ListHeaderComponent={
            hasSearched && results.length > 0 ? (
              <Text style={styles.resultsCountText}>
                {results.length} resultado(s) encontrado(s) para &quot;
                {submittedQuery}&quot;
              </Text>
            ) : null
          }
          ListEmptyComponent={
            hasSearched ? (
              <EmptyState
                iconName="search-outline"
                title="Nenhum Pokémon encontrado"
                description={`Não encontramos resultados para "${submittedQuery}". Tente outro nome ou número da Pokédex.`}
              />
            ) : (
              <EmptyState
                iconName="compass-outline"
                title="Pesquise na Pokédex"
                description="Digite parte do nome (ex.: 'pika', 'char', 'eevee') ou o número (ex.: '25', '150') e toque em Buscar."
              />
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    paddingHorizontal: SPACING.md,
    minHeight: 48,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  clearButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -SPACING.sm,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    minHeight: 48,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  resultsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontVariant: ['tabular-nums'],
  },
});
