import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useConsumed } from '../contexts/ConsumedContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { CapturedScreen } from '../screens/CapturedScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SearchScreen } from '../screens/SearchScreen';
import {
  AppStackParamList,
  AuthStackParamList,
  MainTabParamList,
} from '../types/navigation';
import { COLORS } from '../utils/theme';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabsNavigator: React.FC = () => {
  const { favorites } = useFavorites();
  const { consumedItems } = useConsumed();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          height: 66 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={[
              styles.tabLabelText,
              { color, fontWeight: focused ? '700' : '600' },
            ]}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{
          title: 'Pokédex',
          tabBarAccessibilityLabel: 'Aba Catálogo Principal Pokédex',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Buscar',
          tabBarAccessibilityLabel: 'Aba Buscar Pokémon',
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoritos',
          tabBarBadge: favorites.length > 0 ? favorites.length : undefined,
          tabBarAccessibilityLabel: `Aba Favoritos. ${favorites.length} itens`,
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Captured"
        component={CapturedScreen}
        options={{
          title: 'Capturados',
          tabBarBadge: consumedItems.length > 0 ? consumedItems.length : undefined,
          tabBarAccessibilityLabel: `Aba Capturados e Avaliados. ${consumedItems.length} itens`,
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy-outline" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Conditional navigation based on AuthContext session state
export const AppNavigator: React.FC = () => {
  const { user, isLoadingAuth } = useAuth();
  const { isHydratingFavorites } = useFavorites();
  const { isHydratingConsumed } = useConsumed();

  const isHydrating =
    isLoadingAuth || (Boolean(user) && (isHydratingFavorites || isHydratingConsumed));

  if (isHydrating) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.splashText}>Carregando seus dados salvos...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppStack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <AppStack.Screen
            name="MainTabs"
            component={MainTabsNavigator}
            options={{ headerShown: false }}
          />
          <AppStack.Screen
            name="Details"
            component={DetailsScreen}
            options={({ route }) => ({
              title: route.params?.name || 'Detalhes',
            })}
          />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <AuthStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Autenticação — PokéLista 2.0' }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabLabelText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    includeFontPadding: true,
    marginTop: 2,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  splashText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
