import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useConsumed } from '../contexts/ConsumedContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { PokemonListItem } from '../types/pokemon';
import { formatPokemonId } from '../utils/textUtils';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

interface ItemCardProps {
  item: PokemonListItem;
  onPress: (item: PokemonListItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getConsumedItem } = useConsumed();
  const [hasImageError, setHasImageError] = useState<boolean>(false);

  const favorite = isFavorite(item.id);
  const consumedInfo = getConsumedItem(item.id);
  const showPlaceholder = !item.imageUrl || hasImageError;

  const formattedId = formatPokemonId(item.id);

  return (
    <View style={styles.cardWrapper}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => onPress(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, número ${formattedId}.${
          favorite ? ' Marcado como favorito.' : ''
        }${
          consumedInfo
            ? ` Capturado com nota ${consumedInfo.rating} de 5 estrelas.`
            : ''
        }`}
        accessibilityHint="Toque duas vezes para abrir a tela de detalhes deste Pokémon"
        accessibilityState={{ selected: favorite }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.idText} allowFontScaling={true}>
            {formattedId}
          </Text>

          <Pressable
            onPress={() => toggleFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.favoriteButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              favorite
                ? `Remover ${item.name} dos favoritos`
                : `Adicionar ${item.name} aos favoritos`
            }
            accessibilityHint="Alterna o estado de favorito deste Pokémon"
            accessibilityState={{ selected: favorite }}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={22}
              color={favorite ? COLORS.favoriteActive : COLORS.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.imageContainer}>
          {showPlaceholder ? (
            <View
              style={styles.placeholderBox}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`Imagem indisponível para ${item.name}`}
            >
              <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.placeholderText} allowFontScaling={true}>
                Sem imagem
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.imageUrl! }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setHasImageError(true)}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`Ilustração oficial de ${item.name}`}
            />
          )}
        </View>

        <Text style={styles.nameText} allowFontScaling={true}>
          {item.name}
        </Text>

        {consumedInfo ? (
          <View
            style={styles.consumedBadge}
            accessible={true}
            accessibilityLabel={`Capturado com nota ${consumedInfo.rating} de 5 estrelas`}
          >
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.consumedBadgeText} allowFontScaling={true}>
              Capturado • {consumedInfo.rating}★
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    padding: SPACING.xs,
    maxWidth: '50%',
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 192,
    boxShadow: SHADOWS.card,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  idText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  favoriteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -SPACING.sm,
    marginTop: -SPACING.sm,
  },
  imageContainer: {
    minWidth: 96,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  image: {
    width: 96,
    height: 96,
  },
  placeholderBox: {
    minWidth: 92,
    minHeight: 92,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
  },
  placeholderText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  consumedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: COLORS.successBackground,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  consumedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
    fontVariant: ['tabular-nums'],
  },
});
