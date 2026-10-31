import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ItemCard } from '../components/ItemCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { PokemonListItem } from '../types/pokemon';
import { COLORS, SPACING } from '../utils/theme';

type FavoritesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Favorites'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesNavigationProp>();
  const { favorites } = useFavorites();

  const handleOpenDetails = useCallback(
    (item: PokemonListItem) => {
      navigation.navigate('Details', { id: item.id, name: item.name });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={handleOpenDetails} />
        )}
        ListHeaderComponent={
          favorites.length > 0 ? (
            <Text style={styles.headerInfo}>
              Você possui {favorites.length} Pokémon favorito(s)
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            iconName="heart-outline"
            title="Sua lista de favoritos está vazia"
            description="Toque no ícone de coração em qualquer card do catálogo ou na tela de detalhes para salvar seus Pokémon favoritos aqui."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  headerInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontVariant: ['tabular-nums'],
  },
});
