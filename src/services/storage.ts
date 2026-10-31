import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ConsumedPokemon, PokemonListItem, StoredUserRecord, User } from '../types/pokemon';

const USERS_INDEX_KEY = '@pokelista:users_index_v2';
const SECURE_SESSION_KEY = 'pokelista_secure_session_v2';
const SECURE_HASH_PREFIX = 'pokelista_pwd_hash_';
const FAVORITES_PREFIX = '@pokelista:favorites:';
const CONSUMED_PREFIX = '@pokelista:consumed:';

// Sanitizes key to match Expo SecureStore requirement: only alphanumeric, '.', '-', '_'
function sanitizeSecureKey(rawKey: string): string {
  return rawKey.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Reads sensitive value using SecureStore on native and AsyncStorage fallback on web
async function getSecureItem(key: string): Promise<string | null> {
  const safeKey = sanitizeSecureKey(key);
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(safeKey);
  }
  try {
    return await SecureStore.getItemAsync(safeKey);
  } catch {
    return AsyncStorage.getItem(safeKey);
  }
}

// Writes sensitive value using SecureStore on native and AsyncStorage fallback on web
async function setSecureItem(key: string, value: string): Promise<void> {
  const safeKey = sanitizeSecureKey(key);
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(safeKey, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(safeKey, value);
  } catch {
    await AsyncStorage.setItem(safeKey, value);
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  const safeKey = sanitizeSecureKey(key);
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(safeKey);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(safeKey);
  } catch {
    await AsyncStorage.removeItem(safeKey);
  }
}

// Loads user profiles from AsyncStorage and their individual password hashes from SecureStore
export async function loadRegisteredUsers(): Promise<StoredUserRecord[]> {
  const rawProfiles = await AsyncStorage.getItem(USERS_INDEX_KEY);
  if (!rawProfiles) {
    return [];
  }
  try {
    const profiles = JSON.parse(rawProfiles) as User[];
    const records = await Promise.all(
      profiles.map(async (profile) => {
        const passwordHash =
          (await getSecureItem(`${SECURE_HASH_PREFIX}${profile.id}`)) || '';
        return {
          ...profile,
          passwordHash,
        };
      })
    );
    return records;
  } catch {
    return [];
  }
}

// Saves non-sensitive profile list in AsyncStorage and each password hash in SecureStore (<2KB limit)
export async function saveRegisteredUsers(users: StoredUserRecord[]): Promise<void> {
  const profiles: User[] = users.map(({ id, name, email }) => ({
    id,
    name,
    email,
  }));
  await AsyncStorage.setItem(USERS_INDEX_KEY, JSON.stringify(profiles));

  await Promise.all(
    users.map((user) =>
      setSecureItem(`${SECURE_HASH_PREFIX}${user.id}`, user.passwordHash)
    )
  );
}

export async function loadActiveSession(): Promise<User | null> {
  const raw = await getSecureItem(SECURE_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function saveActiveSession(user: User): Promise<void> {
  await setSecureItem(SECURE_SESSION_KEY, JSON.stringify(user));
}

export async function clearActiveSession(): Promise<void> {
  await deleteSecureItem(SECURE_SESSION_KEY);
}

export async function loadFavoritesFromStorage(userId: string): Promise<PokemonListItem[]> {
  const raw = await AsyncStorage.getItem(`${FAVORITES_PREFIX}${userId}`);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as PokemonListItem[];
  } catch {
    return [];
  }
}

export async function saveFavoritesToStorage(
  userId: string,
  favorites: PokemonListItem[]
): Promise<void> {
  await AsyncStorage.setItem(`${FAVORITES_PREFIX}${userId}`, JSON.stringify(favorites));
}

export async function loadConsumedFromStorage(userId: string): Promise<ConsumedPokemon[]> {
  const raw = await AsyncStorage.getItem(`${CONSUMED_PREFIX}${userId}`);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as ConsumedPokemon[];
  } catch {
    return [];
  }
}

export async function saveConsumedToStorage(
  userId: string,
  consumed: ConsumedPokemon[]
): Promise<void> {
  await AsyncStorage.setItem(`${CONSUMED_PREFIX}${userId}`, JSON.stringify(consumed));
}
