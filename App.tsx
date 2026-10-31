import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ConsumedProvider } from './src/contexts/ConsumedContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FavoritesProvider>
          <ConsumedProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </ConsumedProvider>
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
