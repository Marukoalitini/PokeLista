import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ErrorState } from '../components/ErrorState';
import { StarRating } from '../components/StarRating';
import { useConsumed } from '../contexts/ConsumedContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useFetch } from '../hooks/useFetch';
import { fetchPokemonDetails } from '../services/api';
import { AppStackParamList } from '../types/navigation';
import { RatingValue } from '../types/pokemon';
import { formatPokemonId } from '../utils/textUtils';
import { COLORS, getTypeColor, RADIUS, SHADOWS, SPACING } from '../utils/theme';

type DetailsScreenProps = NativeStackScreenProps<AppStackParamList, 'Details'>;

export const DetailsScreen: React.FC<DetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { id, name } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getConsumedItem, rateConsumedItem, removeConsumedItem } = useConsumed();
  const [imageError, setImageError] = useState<boolean>(false);

  const {
    data: details,
    loading,
    error,
    refetch,
  } = useFetch(() => fetchPokemonDetails(id), [id]);

  // Sets header title dynamically with item name
  useLayoutEffect(() => {
    const dynamicTitle = details?.name || name || `Pokémon #${id}`;
    navigation.setOptions({
      title: `${dynamicTitle} (${formatPokemonId(id)})`,
    });
  }, [navigation, details?.name, name, id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Buscando detalhes de {name}...</Text>
      </View>
    );
  }

  if (error || !details) {
    return (
      <ErrorState
        message={error || 'Não foi possível carregar os detalhes deste Pokémon.'}
        onRetry={refetch}
      />
    );
  }

  const favorite = isFavorite(details.id);
  const consumedRecord = getConsumedItem(details.id);
  const isConsumed = Boolean(consumedRecord);
  const currentRating = consumedRecord?.rating || 0;
  const showPlaceholder = !details.imageUrl || imageError;

  const listItemPayload = {
    id: details.id,
    name: details.name,
    imageUrl: details.imageUrl,
  };

  const handleToggleConsumed = () => {
    if (isConsumed) {
      removeConsumedItem(details.id);
    } else {
      rateConsumedItem(listItemPayload, 5);
    }
  };

  const handleSelectRating = (newRating: RatingValue) => {
    rateConsumedItem(listItemPayload, newRating);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.pokemonId} selectable={true}>
              {formatPokemonId(details.id)}
            </Text>
            <Text
              style={styles.pokemonName}
              accessibilityRole="header"
              selectable={true}
            >
              {details.name}
            </Text>
            <Text style={styles.genusText} selectable={true}>
              {details.genus}
            </Text>
          </View>

          <Pressable
            onPress={() => toggleFavorite(listItemPayload)}
            style={({ pressed }) => [
              styles.favoriteActionBtn,
              favorite && styles.favoriteActionBtnActive,
              pressed && styles.buttonPressed,
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              favorite
                ? `Remover ${details.name} dos favoritos`
                : `Favoritar ${details.name}`
            }
            accessibilityState={{ selected: favorite }}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={24}
              color={favorite ? COLORS.favoriteActive : COLORS.textPrimary}
            />
            <Text
              style={[
                styles.favoriteActionText,
                favorite && styles.favoriteActionTextActive,
              ]}
            >
              {favorite ? 'Favorito' : 'Favoritar'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.artworkContainer}>
          {showPlaceholder ? (
            <View
              style={styles.placeholderContainer}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`Imagem indisponível para ${details.name}`}
            >
              <Ionicons name="image-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.placeholderText}>Imagem indisponível</Text>
            </View>
          ) : (
            <Image
              source={{ uri: details.imageUrl! }}
              style={styles.artworkImage}
              resizeMode="contain"
              onError={() => setImageError(true)}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`Arte oficial em tamanho grande de ${details.name}`}
            />
          )}
        </View>

        <View style={styles.typesRow}>
          {details.types.map((type) => {
            const palette = getTypeColor(type);
            return (
              <View
                key={type}
                style={[styles.typeBadge, { backgroundColor: palette.bg }]}
              >
                <Text style={[styles.typeBadgeText, { color: palette.text }]}>
                  {type}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Consumed / Captured & 1-5 Star Rating Section */}
      <View style={styles.sectionCard}>
        <View style={styles.consumedHeaderRow}>
          <View style={styles.consumedTitleGroup}>
            <Ionicons
              name={isConsumed ? 'checkmark-circle' : 'radio-button-off'}
              size={24}
              color={isConsumed ? COLORS.success : COLORS.textMuted}
            />
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Status de Captura e Avaliação
            </Text>
          </View>
        </View>

        <Text style={styles.sectionSubtitle}>
          Marque este Pokémon como capturado/consumido e atribua sua nota pessoal de 1 a 5 estrelas:
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.consumedToggleBtn,
            isConsumed && styles.consumedToggleBtnActive,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleToggleConsumed}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            isConsumed
              ? `${details.name} está marcado como capturado. Toque para desmarcar.`
              : `Marcar ${details.name} como capturado`
          }
          accessibilityState={{ selected: isConsumed }}
        >
          <Ionicons
            name={isConsumed ? 'trophy' : 'add-circle-outline'}
            size={20}
            color={isConsumed ? COLORS.white : COLORS.textPrimary}
          />
          <Text
            style={[
              styles.consumedToggleText,
              isConsumed && styles.consumedToggleTextActive,
            ]}
          >
            {isConsumed ? 'Capturado (Toque para remover)' : 'Marcar como Capturado'}
          </Text>
        </Pressable>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>
            Sua Nota ({currentRating > 0 ? `${currentRating}/5` : 'Toque para avaliar'}):
          </Text>
          <StarRating rating={currentRating} onChange={handleSelectRating} />
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Descrição na Pokédex
        </Text>
        <Text style={styles.descriptionText} selectable={true}>
          {details.description}
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Altura</Text>
            <Text style={styles.metricValue} selectable={true}>
              {details.heightInMeters} m
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Peso</Text>
            <Text style={styles.metricValue} selectable={true}>
              {details.weightInKg} kg
            </Text>
          </View>
        </View>

        <Text style={styles.subHeader}>Habilidades</Text>
        <View style={styles.abilitiesRow}>
          {details.abilities.map((ability) => (
            <View key={ability} style={styles.abilityChip}>
              <Text style={styles.abilityChipText} selectable={true}>
                {ability}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Base Stats Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Atributos Base
        </Text>
        {details.stats.map((stat) => {
          const percentage = Math.min(100, Math.round((stat.baseStat / 160) * 100));
          return (
            <View key={stat.name} style={styles.statRow}>
              <Text style={styles.statName}>{stat.name}</Text>
              <Text style={styles.statValue}>{stat.baseStat}</Text>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor:
                        stat.baseStat >= 90 ? COLORS.success : COLORS.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
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
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    boxShadow: SHADOWS.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  pokemonId: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  genusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  favoriteActionBtn: {
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
  favoriteActionBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  favoriteActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  favoriteActionTextActive: {
    color: COLORS.primaryDark,
  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    minHeight: 200,
  },
  artworkImage: {
    width: 200,
    height: 200,
  },
  placeholderContainer: {
    width: 180,
    height: 180,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  typesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    boxShadow: SHADOWS.card,
  },
  consumedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  consumedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  consumedToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 48,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  consumedToggleBtnActive: {
    backgroundColor: COLORS.success,
  },
  consumedToggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  consumedToggleTextActive: {
    color: COLORS.white,
  },
  ratingRow: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontVariant: ['tabular-nums'],
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 23,
    marginTop: SPACING.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    padding: SPACING.md,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    fontVariant: ['tabular-nums'],
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  abilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  abilityChip: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderCurve: 'continuous',
  },
  abilityChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  statName: {
    width: 110,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statValue: {
    width: 36,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  statBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});
