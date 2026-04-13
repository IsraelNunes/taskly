import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types/auth';

const TOKEN_KEY = '@taskly/token';
const USER_KEY = '@taskly/user';

export async function saveAuthSession(token: string, user: AuthUser): Promise<void> {
  await AsyncStorage.setMany({
    [TOKEN_KEY]: token,
    [USER_KEY]: JSON.stringify(user),
  });
}

export async function loadAuthSession(): Promise<{ token: string | null; user: AuthUser | null }> {
  const values = await AsyncStorage.getMany([TOKEN_KEY, USER_KEY]);
  const token = values[TOKEN_KEY] ?? null;
  const serializedUser = values[USER_KEY] ?? null;

  return {
    token,
    user: serializedUser ? (JSON.parse(serializedUser) as AuthUser) : null,
  };
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeMany([TOKEN_KEY, USER_KEY]);
}
