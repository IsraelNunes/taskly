export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  PerfilTab: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  NewsDetail: { id: string };
  NewsForm: { id?: string };
};
