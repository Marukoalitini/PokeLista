import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RatingValue } from '../types/pokemon';
import { COLORS } from '../utils/theme';

interface StarRatingProps {
  rating: number;
  onChange?: (newRating: RatingValue) => void;
  size?: number;
  disabled?: boolean;
}

const STARS: RatingValue[] = [1, 2, 3, 4, 5];

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  size = 28,
  disabled = false,
}) => {
  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {STARS.map((starValue) => {
        const isSelected = starValue <= rating;
        return (
          <Pressable
            key={starValue}
            disabled={disabled || !onChange}
            onPress={() => onChange?.(starValue)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={styles.starButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Nota ${starValue} de 5 estrelas`}
            accessibilityState={{ selected: isSelected, disabled }}
          >
            <Ionicons
              name={isSelected ? 'star' : 'star-outline'}
              size={size}
              color={isSelected ? COLORS.starActive : COLORS.starInactive}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  starButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
