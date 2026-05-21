import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../types/auth';

const TOKEN_KEY = '@taskly/token';
const USER_KEY = '@taskly/user';

export async function saveAuthSession(token: string, user: AuthUser): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
}

export async function loadAuthSession(): Promise<{ token: string | null; user: AuthUser | null }> {
  const values = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  const token = values.find(([key]) => key === TOKEN_KEY)?.[1] ?? null;
  const serializedUser = values.find(([key]) => key === USER_KEY)?.[1] ?? null;

  return {
    token,
    user: serializedUser ? (JSON.parse(serializedUser) as AuthUser) : null,
  };
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
