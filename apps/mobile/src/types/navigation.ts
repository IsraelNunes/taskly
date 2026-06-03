export type PublicTabParamList = {
  PublicHome: undefined;
  PublicAccount: undefined;
};

export type PublicStackParamList = {
  PublicTabs: undefined;
  Login: undefined;
  Cadastro: undefined;
};

export type ClientTabParamList = {
  HomeTab: undefined;
  PerfilTab: undefined;
};

export type ProfessionalTabParamList = {
  HomeTab: undefined;
  PerfilTab: undefined;
};

export type AdminTabParamList = {
  PerfilTab: undefined;
  AdminUsersTab: undefined;
  AdminCategoriesTab: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  EditClientProfile: undefined;
  EditProfessionalProfile: undefined;
  AdminUsers: undefined;
  AdminCategories: undefined;
  AdminProfiles: undefined;
  AdminUfs: undefined;
  AdminCities: undefined;
  Search: undefined;
  ProfessionalPublicProfile: { userId: string };
  NewRequest: { professionalId: string; professionalNome: string };
  MyRequests: undefined;
  IncomingRequests: undefined;
  RequestDetail: { requestId: string };
  Payment: { requestId: string; valor: number };
  EditAvailability: undefined;
};
