import { DefaultTheme } from '@react-navigation/native';
import { colors } from './colors';

export { colors } from './colors';
export { spacing } from './spacing';

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};
