import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { StarRating } from '../components/StarRating';
import { useConsumed } from '../contexts/ConsumedContext';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { ConsumedPokemon, RatingValue } from '../types/pokemon';
import { formatPokemonId } from '../utils/textUtils';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

type CapturedNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Captured'>,
  NativeStackNavigationProp<AppStackParamList>
>;

interface CapturedRowProps {
  item: ConsumedPokemon;
  onOpenDetails: (item: ConsumedPokemon) => void;
  onUpdateRating: (item: ConsumedPokemon, rating: RatingValue) => void;
  onRemove: (id: number) => void;
}

const CapturedRow: React.FC<CapturedRowProps> = ({
  item,
  onOpenDetails,
  onUpdateRating,
  onRemove,
}) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const showPlaceholder = !item.imageUrl || imgError;

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [
          styles.cardMainRow,
          pressed && styles.rowPressed,
        ]}
        onPress={() => onOpenDetails(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, capturado com nota ${item.rating} de 5 estrelas. Toque para ver detalhes.`}
      >
        {showPlaceholder ? (
          <View style={styles.placeholderBox}>
            <Ionicons name="image-outline" size={28} color={COLORS.textMuted} />
          </View>
        ) : (
          <Image
            source={{ uri: item.imageUrl! }}
            style={styles.thumbnail}
            resizeMode="contain"
            onError={() => setImgError(true)}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`Miniatura de ${item.name}`}
          />
        )}

        <View style={styles.infoColumn}>
          <Text style={styles.idText}>{formatPokemonId(item.id)}</Text>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.statusText}>Capturado • Nota {item.rating}/5</Text>
        </View>

        <Pressable
          style={styles.removeBtn}
          onPress={() => onRemove(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${item.name} da lista de capturados`}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </Pressable>
      </Pressable>

      <View style={styles.ratingFooter}>
        <Text style={styles.ratingLabel}>Avaliação pessoal:</Text>
        <StarRating
          rating={item.rating}
          size={24}
          onChange={(newRating) => onUpdateRating(item, newRating)}
        />
      </View>
    </View>
  );
};

export const CapturedScreen: React.FC = () => {
  const navigation = useNavigation<CapturedNavigationProp>();
  const { consumedItems, rateConsumedItem, removeConsumedItem } = useConsumed();

  const averageRating =
    consumedItems.length > 0
      ? (
          consumedItems.reduce((acc, cur) => acc + cur.rating, 0) /
          consumedItems.length
        ).toFixed(1)
      : '0.0';

  return (
    <View style={styles.container}>
      <FlatList
        data={consumedItems}
        keyExtractor={(item) => item.id.toString()}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CapturedRow
            item={item}
            onOpenDetails={(selected) =>
              navigation.navigate('Details', {
                id: selected.id,
                name: selected.name,
              })
            }
            onUpdateRating={(selected, rating) =>
              rateConsumedItem(
                {
                  id: selected.id,
                  name: selected.name,
                  imageUrl: selected.imageUrl,
                },
                rating
              )
            }
            onRemove={removeConsumedItem}
          />
        )}
        ListHeaderComponent={
          consumedItems.length > 0 ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{consumedItems.length}</Text>
                <Text style={styles.summaryLabel}>Capturados</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{averageRating} ★</Text>
                <Text style={styles.summaryLabel}>Média de Notas</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            iconName="trophy-outline"
            title="Nenhum Pokémon capturado ainda"
            description="Abra a tela de detalhes de qualquer Pokémon para marcá-lo como capturado/consumido e atribuir uma nota de 1 a 5 estrelas."
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
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    boxShadow: SHADOWS.card,
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    boxShadow: SHADOWS.card,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rowPressed: {
    opacity: 0.8,
  },
  thumbnail: {
    width: 68,
    height: 68,
  },
  placeholderBox: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoColumn: {
    flex: 1,
  },
  idText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  removeBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
