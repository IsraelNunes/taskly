import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function SplashScreen() {
  return (
    <LinearGradient colors={[colors.secondary, '#094F55']} style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>T</Text>
      </View>
      <Text style={styles.title}>Taskly</Text>
      <Text style={styles.tagline}>Conectando pessoas e serviços</Text>
      <ActivityIndicator color="rgba(255,255,255,0.5)" style={styles.spinner} size="small" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  logoLetter: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '900',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  spinner: {
    marginTop: 32,
  },
});
