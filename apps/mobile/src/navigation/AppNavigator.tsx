import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { navigationTheme } from '../theme';
import {
  AdminTabParamList,
  AppStackParamList,
  ClientTabParamList,
  ProfessionalTabParamList,
  PublicStackParamList,
  PublicTabParamList,
} from '../types/navigation';
import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { AdminCategoriesScreen } from '../screens/admin/AdminCategoriesScreen';
import { AdminCitiesScreen } from '../screens/admin/AdminCitiesScreen';
import { AdminProfilesScreen } from '../screens/admin/AdminProfilesScreen';
import { AdminUfsScreen } from '../screens/admin/AdminUfsScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { EditAvailabilityScreen } from '../screens/EditAvailabilityScreen';
import { EditClientProfileScreen } from '../screens/EditClientProfileScreen';
import { EditProfessionalProfileScreen } from '../screens/EditProfessionalProfileScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { IncomingRequestsScreen } from '../screens/IncomingRequestsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MyRequestsScreen } from '../screens/MyRequestsScreen';
import { NewRequestScreen } from '../screens/NewRequestScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProfessionalPublicProfileScreen } from '../screens/ProfessionalPublicProfileScreen';
import { PublicAccountScreen } from '../screens/PublicAccountScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { RequestDetailScreen } from '../screens/RequestDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { colors } from '../theme/colors';

const PublicTab = createBottomTabNavigator<PublicTabParamList>();
const PublicStack = createNativeStackNavigator<PublicStackParamList>();
const ClientTab = createBottomTabNavigator<ClientTabParamList>();
const ProfessionalTab = createBottomTabNavigator<ProfessionalTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const tabBarScreenOptions = (
  iconMap: Record<string, keyof typeof Ionicons.glyphMap>,
  insets: ReturnType<typeof useSafeAreaInsets>,
) => ({
  route,
}: {
  route: { name: string };
}) => ({
  headerShown: false,
  sceneStyle: { paddingTop: insets.top },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: {
    height: 56 + Math.max(insets.bottom, 8),
    paddingBottom: Math.max(insets.bottom, 8),
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabBarIcon: ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={iconMap[route.name] ?? 'ellipse-outline'} size={size} color={color} />
  ),
});

function PublicTabsNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <PublicTab.Navigator
      screenOptions={tabBarScreenOptions(
        { PublicHome: 'home-outline', PublicAccount: 'person-outline' },
        insets,
      )}
    >
      <PublicTab.Screen name="PublicHome" component={HomeScreen} options={{ title: 'Início' }} />
      <PublicTab.Screen name="PublicAccount" component={PublicAccountScreen} options={{ title: 'Entrar' }} />
    </PublicTab.Navigator>
  );
}

function PublicStackNavigator() {
  return (
    <PublicStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
      }}
    >
      <PublicStack.Screen name="PublicTabs" component={PublicTabsNavigator} options={{ headerShown: false }} />
      <PublicStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <PublicStack.Screen name="Cadastro" component={RegisterScreen} options={{ title: 'Cadastro' }} />
    </PublicStack.Navigator>
  );
}

function ClientTabsNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <ClientTab.Navigator
      screenOptions={tabBarScreenOptions(
        { HomeTab: 'home-outline', PerfilTab: 'person-circle-outline' },
        insets,
      )}
    >
      <ClientTab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Início' }} />
      <ClientTab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </ClientTab.Navigator>
  );
}

function ProfessionalTabsNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <ProfessionalTab.Navigator
      screenOptions={tabBarScreenOptions(
        { HomeTab: 'home-outline', PerfilTab: 'person-circle-outline' },
        insets,
      )}
    >
      <ProfessionalTab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Início' }} />
      <ProfessionalTab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </ProfessionalTab.Navigator>
  );
}

function AdminTabsNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <AdminTab.Navigator
      screenOptions={tabBarScreenOptions(
        {
          PerfilTab: 'person-circle-outline',
          AdminUsersTab: 'people-outline',
          AdminCategoriesTab: 'grid-outline',
        },
        insets,
      )}
    >
      <AdminTab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <AdminTab.Screen name="AdminUsersTab" component={AdminUsersScreen} options={{ title: 'Usuários' }} />
      <AdminTab.Screen name="AdminCategoriesTab" component={AdminCategoriesScreen} options={{ title: 'Categorias' }} />
    </AdminTab.Navigator>
  );
}

function MainTabsNavigator() {
  const { user } = useAuth();

  if (user?.perfil === 'PROFISSIONAL') {
    return <ProfessionalTabsNavigator />;
  }

  if (user?.perfil === 'ADMIN') {
    return <AdminTabsNavigator />;
  }

  return <ClientTabsNavigator />;
}

function AuthStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
      }}
    >
      <AppStack.Screen name="MainTabs" component={MainTabsNavigator} options={{ headerShown: false }} />
      <AppStack.Screen name="EditClientProfile" component={EditClientProfileScreen} options={{ title: 'Editar perfil' }} />
      <AppStack.Screen name="EditProfessionalProfile" component={EditProfessionalProfileScreen} options={{ title: 'Editar perfil' }} />
      <AppStack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Usuários' }} />
      <AppStack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ title: 'Categorias' }} />
      <AppStack.Screen name="AdminProfiles" component={AdminProfilesScreen} options={{ title: 'Perfis' }} />
      <AppStack.Screen name="AdminUfs" component={AdminUfsScreen} options={{ title: 'UFs' }} />
      <AppStack.Screen name="AdminCities" component={AdminCitiesScreen} options={{ title: 'Cidades' }} />
      <AppStack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar Profissionais' }} />
      <AppStack.Screen name="ProfessionalPublicProfile" component={ProfessionalPublicProfileScreen} options={{ title: 'Profissional' }} />
      <AppStack.Screen name="NewRequest" component={NewRequestScreen} options={{ title: 'Nova Contratação' }} />
      <AppStack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'Minhas Contratações' }} />
      <AppStack.Screen name="IncomingRequests" component={IncomingRequestsScreen} options={{ title: 'Solicitações Recebidas' }} />
      <AppStack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Contratação' }} />
      <AppStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pagamento' }} />
      <AppStack.Screen name="EditAvailability" component={EditAvailabilityScreen} options={{ title: 'Minha Disponibilidade' }} />
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
      {token ? <AuthStackNavigator /> : <PublicStackNavigator />}
    </NavigationContainer>
  );
}
