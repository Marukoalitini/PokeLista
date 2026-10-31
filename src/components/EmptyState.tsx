import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../utils/theme';

interface EmptyStateProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  title,
  description,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={56} color={COLORS.textMuted} />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.description} selectable={true}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
