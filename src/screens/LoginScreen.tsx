import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

export const LoginScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuthenticate = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      if (isRegisterMode) {
        await signUp(name, email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Falha ao autenticar usuário.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setErrorMessage(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="planet" size={44} color={COLORS.white} />
          </View>
          <Text style={styles.appTitle} accessibilityRole="header">
            PokéLista 2.0
          </Text>
          <Text style={styles.appSubtitle}>
            Catálogo Interativo de Pokémon com Favoritos e Avaliações
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle} accessibilityRole="header">
            {isRegisterMode ? 'Criar Nova Conta' : 'Entrar na sua Conta'}
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorBannerText} selectable={true}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {isRegisterMode ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Treinador</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Ash Ketchum"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
                accessible={true}
                accessibilityLabel="Nome do treinador"
              />
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="treinador@pokemon.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessible={true}
              accessibilityLabel="Endereço de e-mail"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={true}
              autoCapitalize="none"
              accessible={true}
              accessibilityLabel="Senha de acesso"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleAuthenticate}
            disabled={submitting}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isRegisterMode ? 'Cadastrar e entrar' : 'Entrar no aplicativo'
            }
            accessibilityState={{ disabled: submitting, busy: submitting }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegisterMode ? 'Cadastrar e Entrar' : 'Entrar'}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.switchModeButton}
            onPress={toggleMode}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isRegisterMode
                ? 'Já possui uma conta? Faça login'
                : 'Não possui conta? Cadastre-se'
            }
          >
            <Text style={styles.switchModeText}>
              {isRegisterMode
                ? 'Já possui uma conta? Faça login'
                : 'Não possui conta? Cadastre-se localmente'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    boxShadow: SHADOWS.raised,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBackground,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },
  submitButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  switchModeButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  switchModeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
