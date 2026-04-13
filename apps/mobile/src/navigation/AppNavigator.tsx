import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { navigationTheme } from '../theme';
import { AppStackParamList, AppTabParamList, AuthStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NewsDetailScreen } from '../screens/NewsDetailScreen';
import { NewsFormScreen } from '../screens/NewsFormScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { colors } from '../theme/colors';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Cadastro" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 62,
          paddingBottom: 7,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'HomeTab' ? 'newspaper-outline' : 'person-circle-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Notícias' }} />
      <Tab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          color: colors.text,
        },
      }}
    >
      <AppStack.Screen name="MainTabs" component={AppTabsNavigator} options={{ headerShown: false }} />
      <AppStack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ title: 'Detalhe da notícia' }} />
      <AppStack.Screen name="NewsForm" component={NewsFormScreen} options={{ title: 'Editor de notícia' }} />
    </AppStack.Navigator>
  );
}

export function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {token ? <AppStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}
