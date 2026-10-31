import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={52} color={COLORS.error} />
      <Text style={styles.title} accessibilityRole="header">
        Ops! Algo deu errado
      </Text>
      <Text style={styles.message} selectable={true}>
        {message}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.retryButtonPressed,
        ]}
        onPress={onRetry}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Tentar novamente carregar os dados"
      >
        <Ionicons name="refresh" size={18} color={COLORS.white} />
        <Text style={styles.retryButtonText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    minHeight: 48,
    minWidth: 160,
    gap: SPACING.sm,
  },
  retryButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
