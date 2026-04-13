import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function SplashScreen() {
  return (
    <LinearGradient colors={[colors.secondaryLight, '#FFFFFF']} style={styles.container}>
      <View style={styles.logoBubble}>
        <Text style={styles.logo}>T</Text>
      </View>
      <Text style={styles.title}>Taskly</Text>
      <Text style={styles.subtitle}>Conectando pessoas e serviços com qualidade.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 30,
  },
  logoBubble: {
    width: 74,
    height: 74,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: '900',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 280,
    lineHeight: 21,
  },
});
